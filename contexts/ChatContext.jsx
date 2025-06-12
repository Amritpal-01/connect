/** @format */

"use client";

import { createContext, useEffect, useState, useContext } from "react";
import { socket } from "../socket";
import { useAuth } from "./AuthContext";
import { openDB } from "idb";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { userData, fetchUserData } = useAuth();
  const [activeFriend, setActiveFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isloadingMessages, setIsloadingMessages] = useState(null);
  const [db, setDb] = useState(null);

  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  useEffect(() => {
    async function initDB() {
      // indexedDB.deleteDatabase("ChatDB");
      const dbInstance = await openDB("ChatDB", 2, {
        upgrade(db) {
          if (!db.objectStoreNames.contains("rooms")) {
            db.createObjectStore("rooms", { keyPath: "id" });
          }
        },
      });

      setDb(dbInstance);
      console.log("DB ready");
    }

    initDB();
  }, []);

  const getMessages = async () => {
    console.log("getting messages")
    setIsloadingMessages(true);
    setMessages([]);

    const room = activeFriend.roomId;

    let currentRoom;

    try {
      currentRoom = await db.get("rooms", room);
      if (!currentRoom) throw new Error("room not found");
    } catch {
      console.log("room not found");
      await db.add("rooms", {
        id: room,
        messages: [],
      });
      currentRoom = await db.get("rooms", room); // 🟢 Re-fetch after adding
    }

    let newRoom = currentRoom;


    const oldMessages = currentRoom.messages;
    const newMessages = activeFriend.unSeenMessages;

    console.log(newMessages)

    newRoom.messages = [...oldMessages, ...newMessages];

    await db.put("rooms", newRoom);

    setMessages(newRoom.messages);
    setIsloadingMessages(false);
    
    userData.friends.map(friend => {
      if(friend == activeFriend){
        friend.unSeenMessages = []
      }
    })
  };

  useEffect(() => {
    if (!db) return;
    if (!activeFriend) return;
    getMessages();
  }, [activeFriend, db]);

  useEffect(() => {
    if (!userData) return;

    const onConnect = () => {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    };

    const onDisconnect = () => {
      setIsConnected(false);
      setTransport("N/A");
    };

    const onReceiveMessage = async ({ message, roomId, forWhome }) => {
      let currentRoom;
      try {
        currentRoom = await db.get("rooms", roomId);
        if (!currentRoom) throw new Error("room not found");
      } catch {
        await db.add("rooms", {
          id: room,
          messages: [],
        });
        currentRoom = await db.get("rooms", roomId); // 🟢 Re-fetch after adding
      }

      let newRoom = currentRoom;

      const oldMessages = currentRoom.messages;
      const newMessages = message;

      newRoom.messages = [...oldMessages, newMessages];

      await db.put("rooms", newRoom);

      setMessages((prevMessages) => [...prevMessages, message]);
    };

    const onFr = () => {
      fetchUserData();
    };

    const deleteUnSeenMessages = async ({ from }) => {
      let response = await fetch("/api/deleteMessages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          friendname: from,
          username: userData.username,
        }),
      });
    };

    socket.on("receivePrivateFriendRequest", onFr);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("receivePrivateMessage", onReceiveMessage);
    socket.on("receiveDeleteSeenMessage", deleteUnSeenMessages);

    socket.emit("register", userData.username);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("receivePrivateMessage", onReceiveMessage);
      socket.off("receivePrivateFriendRequest", onFr);
      socket.off("receiveDeleteSeenMessage", deleteUnSeenMessages);
    };
  }, [userData]);

  const sendPrivateMessage = async (message) => {
    let currentRoom = await db.get("rooms", activeFriend.roomId);

    if (!currentRoom) {
      currentRoom = await db.add("rooms", {
        id: activeFriend.roomId,
        messages: [],
      });
    }

    let newRoom = currentRoom;

    const oldMessages = currentRoom.messages;
    const newMessages = message;

    newRoom.messages = [...oldMessages, newMessages];

    console.log(newRoom);

    await db.put("rooms", newRoom);

    socket.emit("privateMessage", {
      from: userData.username,
      to: activeFriend.username,
      roomId: activeFriend.roomId,
      message,
    });
  };

  const sendFriendRequstThroughSocket = (friendname) => {
    socket.emit("privateFriendRequest", {
      to: friendname,
    });
  };

  const deleteSeenMessage = async ({ friendname, username }) => {
    socket.emit("deleteSeenMessage", {
      to: friendname,
      from: username,
    });
  };

  return (
    <ChatContext.Provider
      value={{
        activeFriend,
        setActiveFriend,
        messages,
        setMessages,
        sendPrivateMessage,
        isloadingMessages,
        sendFriendRequstThroughSocket,
        deleteSeenMessage,
        db,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);

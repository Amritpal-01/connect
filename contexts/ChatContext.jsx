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
  const [currentRoomId, setCurrentRoomId] = useState(null);
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
    setIsloadingMessages(true);
    setMessages([]);
    const response = await fetch("/api/getMessages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userUid: userData.uid,
        friendUid: activeFriend.friendUid,
      }),
    });

    const res = await response.json();

    const room = res.currentRoom.roomId;

    let currentRoom;
    try {
      currentRoom = await db.get("rooms", room);
      if (!currentRoom) throw new Error("room not found");
    } catch {
      
      console.log("room not found")
      await db.add("rooms", {
        id: room,
        messages: [],
      });
      currentRoom = await db.get("rooms", room); // 🟢 Re-fetch after adding
    }

    let newRoom = currentRoom;

    console.log(newRoom);

    const oldMessages = currentRoom.messages;
    const newMessages = res.currentRoom.messages;
    let isThereAnyNewMessage = false;

    if (newMessages.length != 0 && oldMessages.length != 0) {
        const lastOldMessage = {
          text: oldMessages[oldMessages.length - 1].text,
          sender: oldMessages[oldMessages.length - 1].sender,
        };

        const lastNewMessage = {
          text: newMessages[newMessages.length - 1].text,
          sender: newMessages[newMessages.length - 1].sender,
        };

        isThereAnyNewMessage = !(
          lastNewMessage.sender == lastOldMessage.sender &&
          lastNewMessage.text == lastOldMessage.text
        );
    }


    if (isThereAnyNewMessage) {
      if (oldMessages.length != 0) {
        newRoom.messages = [...oldMessages, ...newMessages];
      } else {
        newRoom.messages = newMessages;
      }

      await db.put("rooms", newRoom);

      const anotherResponse = await fetch("/api/deleteMessages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userUid: userData.uid,
          friendUid: activeFriend.friendUid,
        }),
      });
    }

    console.log(newRoom);

    setMessages(newRoom.messages);
    setCurrentRoomId(room);
    setIsloadingMessages(false);
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

    const onReceiveMessage = async ({ message, roomId }) => {
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

      console.log(newRoom.messages)

      await db.put("rooms", newRoom);

      setMessages((prevMessages) => [...prevMessages, message]);
    };

    const onFr = () => {
      fetchUserData();
    };

    socket.on("receivePrivateFriendRequest", onFr);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("receivePrivateMessage", onReceiveMessage);

    socket.emit("register", userData.username);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("receivePrivateMessage", onReceiveMessage);
      socket.off("receivePrivateFriendRequest", onFr);
    };
  }, [userData]);

  const sendPrivateMessage = async (message) => {
    const currentRoom = await db.get("rooms", currentRoomId);

    let newRoom = currentRoom;

    const oldMessages = currentRoom.messages;
    const newMessages = message;

    newRoom.messages = [...oldMessages, newMessages];

    console.log(newRoom)

    await db.put("rooms", newRoom);

    socket.emit("privateMessage", {
      to: activeFriend.friendUsername,
      roomId: currentRoomId,
      message,
    });
  };

  const sendFriendRequstThroughSocket = (friendname) => {
    socket.emit("privateFriendRequest", {
      to: friendname,
    });
  };

  return (
    <ChatContext.Provider
      value={{
        activeFriend,
        setActiveFriend,
        messages,
        setMessages,
        currentRoomId,
        sendPrivateMessage,
        isloadingMessages,
        sendFriendRequstThroughSocket,
        db,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);

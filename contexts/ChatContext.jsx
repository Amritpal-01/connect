/** @format */

"use client";

import { createContext, useEffect, useState, useContext } from "react";
import { socket } from "../socket";
import { useAuth } from "./AuthContext";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { userData,fetchUserData } = useAuth();
  const [activeFriend, setActiveFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [isloadingMessages, setIsloadingMessages] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

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
    setMessages(res.currentRoom.messages);
    setCurrentRoomId(res.currentRoom.roomId);
    setIsloadingMessages(false);
  };

  useEffect(() => {
    if (!activeFriend) return;
    getMessages();
  }, [activeFriend]);

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

    const onReceiveMessage = ({ message }) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    const onFr = () => {
      fetchUserData();
    }

    socket.on("receivePrivateFriendRequest", onFr)
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

  const sendPrivateMessage = (message) => {
    socket.emit("privateMessage", {
      to: activeFriend.friendUsername,
      message,
    });
  };

  const sendFriendRequstThroughSocket = (friendname) => {
    socket.emit("privateFriendRequest", {
      to: friendname
    });
  }

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
        sendFriendRequstThroughSocket
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);

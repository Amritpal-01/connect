/** @format */

"use client";

// context/ChatContext.js
import { createContext, useEffect, useState, useContext } from "react";
import { socket } from "../socket";
import { useAuth } from "./AuthContext";
const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { userData } = useAuth();
  const [activeFriend, setActiveFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  const getMessages = async () => {
    let responce = await fetch("/api/getMessages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userUid: userData.uid,
        friendUid: activeFriend.friendUid,
      }),
    });

    let res = await responce.json();
    setMessages(res.currentRoom.messages);
    setCurrentRoomId(res.currentRoom.roomId);
  };

  useEffect(() => {
    if (!activeFriend) return;

    getMessages();
  }, [activeFriend]);

  useEffect(
    () => {
      if (!userData) return;
      if (socket.connected) {
        onConnect();
      }

      function onConnect() {
        setIsConnected(true);
        setTransport(socket.io.engine.transport.name);

        socket.io.engine.on("upgrade", (transport) => {
          setTransport(transport.name);
        });
      }

      function onDisconnect() {
        setIsConnected(false);
        setTransport("N/A");
      }

      socket.on("connect", onConnect);
      socket.on("disconnect", onDisconnect);

      socket.on("receivePrivateMessage", ({ from, message }) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      socket.emit("register", userData.username);

      return () => {
        socket.off("connect", onConnect);
        socket.off("disconnect", onDisconnect);
      };
    },
    [userData],
    []
  );

  const sendPrivateMessage = (message) => {
    socket.emit("privateMessage", { to: activeFriend.friendUsername, message });
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
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
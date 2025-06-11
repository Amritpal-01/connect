/** @format */

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import EmojiPicker from "emoji-picker-react";
import { motion, AnimatePresence } from "framer-motion";

const Chats = ({ setActivePanelMain, activePanelMain }) => {
  const {
    activeFriend,
    messages,
    setMessages,
    currentRoomId,
    sendPrivateMessage,
    isloadingMessages,
  } = useChat();
  const { currentUser, userData } = useAuth();
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [userScrollHeight, setUserScrollHeight] = useState(0);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const header = useRef();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollButton(false);
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;

    const isNeadBottom = scrollHeight - clientHeight - scrollTop < 200;
    
    if(!isNeadBottom){
      setShowScrollButton(true)
    }else{
      setShowScrollButton(false)
    }

    setUserScrollHeight(scrollHeight - scrollTop - clientHeight);
  };

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Scroll to bottom when chat is opened
  useEffect(() => {
    if (activePanelMain === "room" && !isloadingMessages) {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
        setShowScrollButton(false);
    }
  }, [activePanelMain, isloadingMessages]);

  const smartScroll = () => {
    if (messages.length > 0) {
      const container = messagesContainerRef.current;
      if (container) {
        const isNearBottom = userScrollHeight < 200;
        if (isNearBottom) {
          scrollToBottom();
          setShowScrollButton(false);
        } else {
          setShowScrollButton(true);
        }
      }
    }
  };

  useEffect(() => {
    smartScroll();
  }, [messages]);

  const handleEmojiClick = (emojiObject) => {
    setMessage((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setAttachments((prev) => [...prev, ...files]);
  };

  const handleTyping = () => {
    setIsTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim() && attachments.length === 0) return;

    const newMessage = {
      text: message,
      sender: userData.username,
      timestamp: new Date(),
      attachments: attachments,
    };

    setMessage("");

    setMessages([...messages, newMessage]);

    await sendPrivateMessage(newMessage);

    let response = await fetch("/api/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId: currentRoomId,
        message: {
          text: newMessage.text,
          sender: newMessage.sender,
          attachments: newMessage.attachments,
        },
      }),
    });

    setAttachments([]);
  };

  return (
    <div className="h-full w-full flex flex-col bg-gray-900/50 backdrop-blur-sm">
      {/* Header */}
      <div
        ref={header}
        className="flex z-10 w-full items-center justify-between border-b border-gray-700/50 bg-gray-800/30 backdrop-blur-sm"
      >
        <button 
          onClick={() => setActivePanelMain("chats")}
          className="hidden max-[800px]:flex mx-2 p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-300 backdrop-blur-sm"
        >
          <svg
            fill="#fff"
            width="20px"
            height="20px"
            viewBox="0 0 1024 1024"
            xmlns="http://www.w3.org/2000/svg"
            className="transform hover:scale-110 transition-transform"
          >
            <path d="M222.927 580.115l301.354 328.512c24.354 28.708 20.825 71.724-7.883 96.078s-71.724 20.825-96.078-7.883L19.576 559.963a67.846 67.846 0 01-13.784-20.022 68.03 68.03 0 01-5.977-29.488l.001-.063a68.343 68.343 0 017.265-29.134 68.28 68.28 0 011.384-2.6 67.59 67.59 0 0110.102-13.687L429.966 21.113c25.592-27.611 68.721-29.247 96.331-3.656s29.247 68.721 3.656 96.331L224.088 443.784h730.46c37.647 0 68.166 30.519 68.166 68.166s-30.519 68.166-68.166 68.166H222.927z" />
          </svg>
        </button>
        <div className="flex items-center gap-2 p-2 pr-10">
          <div className="aspect-square w-8 relative overflow-hidden rounded-full ring-2 ring-gray-700">
            <Image
              fill
              alt="profilePic"
              src={activeFriend?.friendPhotoURL || "/noProfile.jpg"}
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-white font-medium text-sm truncate">
              {activeFriend?.friendDisplayName}
            </h1>
            <p className="text-xs text-gray-400">
              {isTyping ? "Typing..." : "Online"}
            </p>
          </div>
        </div>
        <div className="w-8"></div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1  overflow-y-auto space-y-2 p-2 scrollbar-thin-custom relative"
      >
        {isloadingMessages ? (
          <div className="w-full flex items-center justify-center "></div>
        ) : (
          <div>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex messagesIn p-2 fadeIn ${
                  msg.sender === userData.username
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {msg.sender !== userData.username && (
                  <div className="flex-shrink-0 mr-1 self-end">
                    <div className="w-6 h-6 rounded-full overflow-hidden">
                      <Image
                        src={activeFriend?.friendPhotoURL || "/noProfile.jpg"}
                        alt="profile"
                        width={24}
                        height={24}
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-1.5 ${
                    msg.sender === userData.username
                      ? "bg-blue-500 text-white"
                      : "bg-gray-700 text-gray-100"
                  }`}
                >
                  {msg.attachments?.length > 0 && (
                    <div className="grid grid-cols-2 gap-1 mb-1">
                      {msg.attachments.map((file, index) => (
                        <div
                          key={index}
                          className="relative aspect-square rounded-lg overflow-hidden"
                        >
                          <Image
                            src={URL.createObjectURL(file)}
                            alt={`Attachment ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {msg.text}
                  </p>
                  <p
                    className={`text-[10px] mt-0.5 ${
                      msg.sender === userData.username
                        ? "text-blue-100"
                        : "text-gray-400"
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                </div>
                {msg.sender === userData.username && (
                  <div className="flex-shrink-0 ml-1 self-end">
                    <div className="w-6 h-6 rounded-full overflow-hidden">
                      <Image
                        src={userData.photoURL || "/noProfile.jpg"}
                        alt="profile"
                        width={24}
                        height={24}
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
            </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to Bottom Button */}
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-24 right-6 p-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-500 transition-all duration-300 z-10"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </button>
        )}

      {/* Message Input */}
      <form
        onSubmit={handleSendMessage}
        className="p-1.5 border-t border-gray-700/50 bg-gray-800/30 backdrop-blur-sm"
      >
        {attachments.length > 0 && (
          <div className="flex gap-1.5 mb-1.5 overflow-x-auto pb-1.5 scrollbar-thin-custom">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 group"
              >
                <Image
                  src={URL.createObjectURL(file)}
                  alt={`Attachment ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() =>
                    setAttachments((prev) => prev.filter((_, i) => i !== index))
                  }
                  className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg
                    className="w-2.5 h-2.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-end gap-1.5">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-1.5 rounded-lg bg-gray-800/50 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 transition-all duration-300 flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-6c.78 2.34 2.72 4 5 4s4.22-1.66 5-4H7zm8-3c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm-6 0c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z" />
            </svg>
          </button>
          <div className="flex-1 min-h-[36px] max-h-24 bg-gray-800/50 rounded-lg flex items-end">
            <textarea
              value={message}
              onFocus={() => {
                setTimeout(async () => {
                  if(userScrollHeight < 400){
                    scrollToBottom();
                  }

                  await header.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }, 300);
              }}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
                e.target.style.height = "auto";
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 96) + "px";
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="Type a message..."
              rows={1}
              className="flex-1 px-3 py-2 bg-transparent text-gray-200 placeholder-gray-400 focus:outline-none resize-none max-h-24 min-h-[36px] text-[16px]"
            />
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-lg bg-gray-800/50 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 transition-all duration-300 flex-shrink-0"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            accept="image/*"
            className="hidden"
          />
          <button
            type="submit"
            disabled={!message.trim() && attachments.length === 0}
            className="p-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
        {showEmojiPicker && (
          <div className="absolute bottom-16 left-2 z-50">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
      </form>
    </div>
  );
};

export default Chats;

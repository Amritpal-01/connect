/** @format */

"use client";

import Chats from "@/components/Chats";
import NavigationWindow from "@/components/NavigationWindow";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useRef, useState } from "react";
import { redirect } from "next/navigation";
import { useChat } from "@/contexts/ChatContext";

export default function Home() {
  const { isSocketConnected } = useChat();
  const appView = useRef();
  const { currentUser, userData, isLoadingSession } = useAuth();
  const [isChatsToggle, setIsChatsToggle] = useState(true);
  const [activePanelMain, setActivePanelMain] = useState("chats");

  useEffect(() => {
    if (!isLoadingSession && !currentUser) {
      redirect("/auth/signin");
    }
  }, [isLoadingSession, currentUser]);

  if (isLoadingSession || !userData || !currentUser)
    return (
      <div className="w-full h-[100dvh] flex items-center justify-center ">
        <div className=" mx-auto mt-6">
          <div className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 shadow-sm flex flex-col items-center justify-center">
            <div className="flex space-x-1 mr-3">
              <span className="dot bg-blue-500"></span>
              <span className="dot bg-blue-500"></span>
              <span className="dot bg-blue-500"></span>
            </div>
            <span className="text-gray-700 dark:text-gray-200 font-medium text-sm">
              Loading messages
            </span>
          </div>
        </div>
      </div>
    );

  if (!isSocketConnected)
    return (
      <div className="w-full h-[100dvh] flex items-center justify-center ">
        <div className=" mx-auto mt-6">
          <div className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 shadow-sm flex flex-col items-center justify-center">
            <div className="flex space-x-1 mr-3">
              <span className="dot bg-blue-500"></span>
              <span className="dot bg-blue-500"></span>
              <span className="dot bg-blue-500"></span>
            </div>
            <span className="text-gray-700 dark:text-gray-200 font-medium text-sm">
              Wait for connection
            </span>
          </div>
        </div>
      </div>
    );

  return (
    <div ref={appView} className={`w-full max-h-[100dvh] flex flex-row`}>
      <div
        className={`flex flex-col transition-all duration-300 w-96 overflow-hidden ${
          activePanelMain === "chats"
            ? "max-[800px]:w-[100dvw]"
            : "max-[800px]:w-0"
        } relative`}
      >
        <NavigationWindow setActivePanelMain={setActivePanelMain} />
      </div>
      <div
        className={`w-[1px] h-[100dvh] bg-[#474751] max-[800px]:hidden`}
      ></div>
      <div
        className={`flex-1 overflow-hidden items-start transition-all duration-300 ${
          activePanelMain === "room"
            ? "max-[800px]:w-[100dvw]"
            : "w-0 opacity-0"
        }`}
      >
        <Chats
          setActivePanelMain={setActivePanelMain}
          activePanelMain={activePanelMain}
        />
      </div>
    </div>
  );
}

/** @format */

"use client";

import Chats from "@/components/Chats";
import NavigationWindow from "@/components/NavigationWindow";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useRef, useState } from "react";
import { redirect } from "next/navigation";
import { useChat } from "@/contexts/ChatContext";

export default function Home() {
  const { fuck } = useChat();
  const appView = useRef()
  const { currentUser, userData, isLoadingSession } = useAuth();
  const [isChatsToggle, setIsChatsToggle] = useState(true);
  const [activePanelMain, setActivePanelMain] = useState("chats");
  const [viewPortHeight, setViewPortHeight] = useState(0); // initialize safely

  useEffect(() => {
    if (typeof window !== "undefined" && window.visualViewport) {
      setViewPortHeight(window.visualViewport.height.toFixed(2));
    }
  }, []);


  useEffect(() => {
    window.visualViewport.addEventListener("resize", () => {
      let num = window.visualViewport.height.toFixed(2);
      setViewPortHeight(num);
    });
  }, []);

  useEffect(() => {
    if (!isLoadingSession && !currentUser) {
      redirect("/auth/signin");
    }
  }, [isLoadingSession, currentUser]);

  if (isLoadingSession || !userData || !currentUser)
    return (
      <div className="w-full h-[100dvh] flex items-center justify-center ">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium">Loading...</p>
        </div>
      </div>
    );

  return (
    <div
    ref={appView}
      className={`w-full max-h-[100dvh] flex flex-row`}
      style={{height:`${(activePanelMain === "room")?(viewPortHeight + "px"):""}`}}
    >
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
        className={`flex-1 items-start transition-all duration-300 ${
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

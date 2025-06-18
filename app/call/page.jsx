/** @format */

"use client";

import React, { useEffect, useRef } from "react";
import { useChat } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";
import { redirect } from "next/navigation";
import Image from "next/image";

const page = () => {
  const { activeCall, remoteStream } = useChat();
  const { userData } = useAuth();
  const remoteVideo = useRef();

  useEffect(() => {
    if (!remoteStream) return;
    remoteVideo.current.srcObject = remoteStream;
  }, [remoteStream]);

  if (!activeCall) {
    redirect("/");
  }

  return (
    <div className="h-[100dvh] relative mx-auto w-96 max-[800px]:w-full flex flex-col">
      <video
        ref={remoteVideo}
        className="absolute w-full h-full object-cover rounded-xl border border-white/20"
        id="remote"
        autoPlay
        playsInline
      ></video>
      <header className="flex justify-between items-center p-4 flex-row">
        <button className="mx-2 p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-300 backdrop-blur-sm">
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
        <h3 className="text-white font-bold text-lg">
          {activeCall?.displayName}
        </h3>
        <div className="p-6 rounded-full backdrop-blur-sm bg-white/10 border border-white/20 relative overflow-hidden">
          <Image
            fill
            alt="profilePic"
            src={userData?.profile.photoURL || "/noProfile.jpg"}
            className="object-cover"
          />
        </div>
      </header>
      <main className="flex-1 flex justify-center items-center">
        {/* <div className="aspect-square h-44 rounded-full backdrop-blur-sm bg-white/10 border border-white/20 relative overflow-hidden">
          <Image
            fill
            alt="profilePic"
            src={activeCall?.photoURL || "/noProfile.jpg"}
            className="object-cover"
          />
        </div> */}
      </main>
      <footer className="px-4 py-2 m-4 flex justify-between rounded-2xl backdrop-blur-sm bg-black/10 border border-black/20">
        <div className="p-6 rounded-full backdrop-blur-sm bg-white/10 border border-white/20"></div>
        <div className="p-6 rounded-full backdrop-blur-sm bg-white/10 border border-white/20"></div>
        <div className="p-6 rounded-full backdrop-blur-sm bg-white/10 border border-white/20"></div>
        <div className="p-6 rounded-full backdrop-blur-sm bg-white/10 border border-white/20"></div>
        <div className="p-6 rounded-full backdrop-blur-sm bg-white/10 border border-white/20"></div>
      </footer>
    </div>
  );
};

export default page;

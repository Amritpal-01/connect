/** @format */

import React, { useState } from "react";
import Friends from "./navigationWindow/Friends";
import Profile from "./navigationWindow/Profile";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import AddFriends from "./navigationWindow/AddFriends";

const NavigationWindow = ({setActivePanelMain}) => {
  const { currentUser } = useAuth();
  const [activePanel, setActivePanel] = useState("friends")
  return (
    <div className="relative h-[100dvh]">
      {(activePanel != "friends") && (
        <button 
          onClick={() => setActivePanel("friends")} 
          className="absolute top-5 left-5 z-10 p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-300 backdrop-blur-sm"
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
      )}
      <div className="w-full flex justify-center flex-row">
        <div className={`transition-all duration-500 ease-in-out transform ${activePanel === "profile" ? "w-full opacity-100 translate-x-0" : "w-0 opacity-0 -translate-x-full"} flex justify-center overflow-hidden`}>
          <Profile />
        </div>
        <div className={`transition-all duration-500 ease-in-out transform ${activePanel === "friends" ? "w-full opacity-100 translate-x-0" : "w-0 opacity-0 translate-x-full"} overflow-hidden`}>
          <Friends setActivePanelMain={setActivePanelMain} />
        </div>
        <div className={`transition-all duration-500 ease-in-out transform ${activePanel === "addFriends" ? "w-full opacity-100 translate-x-0" : "w-0 opacity-0 translate-x-full"} flex justify-center overflow-hidden`}>
          <AddFriends/>
        </div>
      </div>
      <header className="absolute bottom-0 w-full flex justify-between p-5 bg-gradient-to-t from-gray-900/95 to-transparent backdrop-blur-sm">
        <div 
          onClick={() => setActivePanel("profile")} 
          className="group cursor-pointer"
        >
          <div className="flex gap-3 items-center">
            <div className="aspect-square w-12 relative rounded-full bg-white overflow-hidden ring-2 ring-gray-700 group-hover:ring-blue-500 transition-all duration-300">
              <Image
                fill
                alt="profilePic"
                src={`${currentUser.photoURL ? currentUser.photoURL : "/noProfile.jpg"}`}
                className="object-cover"
              />
            </div>
            <svg
              className="mt-auto text-gray-400 group-hover:text-blue-500 transition-colors duration-300"
              width="20px"
              height="20px"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21.2799 6.40005L11.7399 15.94C10.7899 16.89 7.96987 17.33 7.33987 16.7C6.70987 16.07 7.13987 13.25 8.08987 12.3L17.6399 2.75002C17.8754 2.49308 18.1605 2.28654 18.4781 2.14284C18.7956 1.99914 19.139 1.92124 19.4875 1.9139C19.8359 1.90657 20.1823 1.96991 20.5056 2.10012C20.8289 2.23033 21.1225 2.42473 21.3686 2.67153C21.6147 2.91833 21.8083 3.21243 21.9376 3.53609C22.0669 3.85976 22.1294 4.20626 22.1211 4.55471C22.1128 4.90316 22.0339 5.24635 21.8894 5.5635C21.7448 5.88065 21.5375 6.16524 21.2799 6.40005V6.40005Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M11 4H6C4.93913 4 3.92178 4.42142 3.17163 5.17157C2.42149 5.92172 2 6.93913 2 8V18C2 19.0609 2.42149 20.0783 3.17163 20.8284C3.92178 21.5786 4.93913 22 6 22H17C19.21 22 20 20.2 20 18V13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        <div
          onClick={() => setActivePanel("addFriends")}
          className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-500 flex justify-center items-center shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 cursor-pointer"
        >
          <svg
            fill="#fff"
            version="1.1"
            id="Capa_1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            width="20px"
            height="20px"
            viewBox="0 0 45.902 45.902"
            xmlSpace="preserve"
            className="transform hover:rotate-90 transition-transform duration-300"
          >
            <g>
              <g>
                <path d="M43.162,26.681c-1.564-1.578-3.631-2.539-5.825-2.742c1.894-1.704,3.089-4.164,3.089-6.912 c0-5.141-4.166-9.307-9.308-9.307c-4.911,0-8.932,3.804-9.281,8.625c4.369,1.89,7.435,6.244,7.435,11.299 c0,1.846-0.42,3.65-1.201,5.287c1.125,0.588,2.162,1.348,3.066,2.26c2.318,2.334,3.635,5.561,3.61,8.851l-0.002,0.067 l-0.002,0.057l-0.082,1.557h11.149l0.092-12.33C45.921,30.878,44.936,28.466,43.162,26.681z" />
                <path d="M23.184,34.558c1.893-1.703,3.092-4.164,3.092-6.912c0-5.142-4.168-9.309-9.309-9.309c-5.142,0-9.309,4.167-9.309,9.309 c0,2.743,1.194,5.202,3.084,6.906c-4.84,0.375-8.663,4.383-8.698,9.318l-0.092,1.853h14.153h15.553l0.092-1.714 c0.018-2.514-0.968-4.926-2.741-6.711C27.443,35.719,25.377,34.761,23.184,34.558z" />
                <path d="M6.004,11.374v3.458c0,1.432,1.164,2.595,2.597,2.595c1.435,0,2.597-1.163,2.597-2.595v-3.458h3.454 c1.433,0,2.596-1.164,2.596-2.597c0-1.432-1.163-2.596-2.596-2.596h-3.454V2.774c0-1.433-1.162-2.595-2.597-2.595 c-1.433,0-2.597,1.162-2.597,2.595V6.18H2.596C1.161,6.18,0,7.344,0,8.776c0,1.433,1.161,2.597,2.596,2.597H6.004z" />
              </g>
            </g>
          </svg>
        </div>
      </header>
    </div>
  );
};

export default NavigationWindow;

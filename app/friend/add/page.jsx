/** @format */
"use client";
import React, { useRef, useState } from "react";
import { redirect } from "next/navigation";

const page = () => {
  const [addByUsernameToggle, setaddByUsernameToggle] = useState(false);
  return (
    <div
      className="w-full fadeIn h-[100dvh] flex justify-center relative"
    >
      <button
        onClick={() => {
          if(addByUsernameToggle){
            setaddByUsernameToggle(false)
          }else{
            redirect("/");
          }
        }}
        className="absolute top-5 left-5"
      >
        <svg
          fill="#fff"
          width="20px"
          height="20px"
          viewBox="0 0 1024 1024"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M222.927 580.115l301.354 328.512c24.354 28.708 20.825 71.724-7.883 96.078s-71.724 20.825-96.078-7.883L19.576 559.963a67.846 67.846 0 01-13.784-20.022 68.03 68.03 0 01-5.977-29.488l.001-.063a68.343 68.343 0 017.265-29.134 68.28 68.28 0 011.384-2.6 67.59 67.59 0 0110.102-13.687L429.966 21.113c25.592-27.611 68.721-29.247 96.331-3.656s29.247 68.721 3.656 96.331L224.088 443.784h730.46c37.647 0 68.166 30.519 68.166 68.166s-30.519 68.166-68.166 68.166H222.927z" />
        </svg>
      </button>
      <div className={`${addByUsernameToggle?"w-0":"w-80"} flex flex-col items-center overflow-hidden`}>
        <h2 className="">Add a Friend</h2>
        <div onClick={() => {
            setaddByUsernameToggle(true)
          }} className="w-80 bg-[#31313A] flex justify-between items-center px-4 py-4 rounded-xl cursor-pointer">
          <div  className="flex items-center gap-2">
            <h5 className="font-bold text-3xl text-[#A6A6A6]">@</h5>
            <h1 className="font-bold text-md text-[#A6A6A6]">
              Add by Username
            </h1>
          </div>
          <button>
            <svg
              fill="#A6A6A6"
              version="1.1"
              baseProfile="tiny"
              id="Layer_1"
              xmlnsx="&ns_extend;"
              xmlnsi="&ns_ai;"
              xmlnsgraph="&ns_graphs;"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              xmlnsa="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/"
              width="20px"
              height="20px"
              viewBox="0 0 42 42"
              xmlSpace="preserve"
            >
              <polygon
                fillRule="evenodd"
                points="13.933,1 34,21.068 14.431,40.637 9.498,35.704 24.136,21.068 9,5.933 "
              />
            </svg>
          </button>
        </div>

        <h1 className="font-bold text-md text-[#A6A6A6] w-full px-3 py-5">
          Friend Requests
        </h1>
        <div className="flex-1">
          <div className="w-80 bg-[#31313A] flex flex-col justify-between items-center px-4 py-4 rounded-xl relative">
            <button className="absolute top-2 right-3">
              <svg
                fill="#5F7288"
                width="30px"
                height="30px"
                viewBox="0 0 32 32"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M18.8,16l5.5-5.5c0.8-0.8,0.8-2,0-2.8l0,0C24,7.3,23.5,7,23,7c-0.5,0-1,0.2-1.4,0.6L16,13.2l-5.5-5.5  c-0.8-0.8-2.1-0.8-2.8,0C7.3,8,7,8.5,7,9.1s0.2,1,0.6,1.4l5.5,5.5l-5.5,5.5C7.3,21.9,7,22.4,7,23c0,0.5,0.2,1,0.6,1.4  C8,24.8,8.5,25,9,25c0.5,0,1-0.2,1.4-0.6l5.5-5.5l5.5,5.5c0.8,0.8,2.1,0.8,2.8,0c0.8-0.8,0.8-2.1,0-2.8L18.8,16z" />
              </svg>
            </button>
            <div className="friend w-full flex flex-row py-3 relative">
              <div className=" bg-[#a1a1ab] h-[0.5px] absolute -top-0 left-[10%]"></div>
              <div className="aspect-square w-12 bg-white rounded-full"></div>
              <div className="flex flex-col mx-3">
                <h1 className="text-white font-bold">Some Guy</h1>
              </div>
            </div>
            <button className="text-[#838688] font-bold bg-[#3C5039] w-18 h-7 rounded-lg ml-auto">
              Accept
            </button>
          </div>
        </div>
      </div>
      
      <div className={`${addByUsernameToggle?"w-80":"w-0"} flex flex-col items-center overflow-hidden`}>
        <h2 className="mt-12">Add by Username</h2>
        <input
              id="username"
              placeholder="Enter a Username"
              className="text-[#A6A6A6] bg-[#474751] w-80 px-3 py-2 my-1 rounded-sm"
        />
        <div className="text-[#A6A6A6] font-bold bg-[#334C81] w-52 h-10 rounded-xl my-6 flex justify-center items-center">
            <div>Send Friend Request</div>
        </div>
      </div>
    </div>
  );
};

export default page;

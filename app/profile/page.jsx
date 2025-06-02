/** @format */
"use client";
import React, { useRef, useState } from "react";
import { redirect } from "next/navigation";

const page = () => {
  const [name, setName] = useState("Some Guy");
  const [about, setAbout] = useState("");
  return (
    <div
      className="w-full fadeIn h-[100dvh] flex justify-center relative"
    >
      <button
        onClick={() => {
            redirect("/");
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

      <div className={`w-80 flex flex-col items-center overflow-hidden`}>
        <h2>Profile</h2>
        <div className="aspect-square w-32 bg-[#31313A] rounded-full"></div>
        <button className="py-2 font-bold text-[#6CBD6C]">Edit</button>

        <label
          htmlFor="name"
          className="font-bold text-[12px] mt-5 w-full text-[#525252]"
        >
          Name
        </label>
        <input
        onChange={(e) => {
            setName(e.currentTarget.value)
        }}
          value={name}
          id="name"
          className="text-[#A6A6A6] bg-[#474751] w-80 px-3 py-1 my-1 rounded-sm"
        />

        <label
          htmlFor="about"
          className="font-bold text-[12px] mt-5 w-full text-[#525252]"
        >
          About
        </label>
        <input
        onChange={(e) => {
            setAbout(e.currentTarget.value)
        }}
          value={about}
          id="about"
          className="text-[#A6A6A6] bg-[#474751] w-80 px-3 py-1 my-1 rounded-sm"
        />
        <div className="text-[#A6A6A6] font-bold bg-[#334C81] w-28 h-10 rounded-xl my-6 flex justify-center items-center">
          <h1>Save</h1>
        </div>
      </div>
    </div>
  );
};

export default page;

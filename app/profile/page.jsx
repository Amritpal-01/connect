/** @format */
"use client";
import React, { useRef, useState, useEffect } from "react";
import { redirect } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { getAuth, updateProfile } from "firebase/auth";

const db = getFirestore();
const auth = getAuth();

const page = () => {
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const { currentUser, userData, isLoadingSession } = useAuth();
  const notificationBar = useRef();
  const [Notification, setNotification] = useState("");

  let notify = (message) => {
    setNotification(message);
    notificationBar.current.classList.add("showNotification");
    setTimeout(() => {
      notificationBar.current.classList.remove("showNotification");
    }, 5000);
  };

  useEffect(() => {
    if (userData) {
      setAbout(userData.bio);
    }
    if (currentUser) {
      setName(currentUser.displayName);
    }
    if (!isLoadingSession && !currentUser) {
      redirect("/signin");
    }
  }, [currentUser, isLoadingSession, userData]);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return console.error("User not logged in");

    const userRef = doc(db, "users", user.uid);

    try {
      await updateDoc(userRef, {
        bio: about,
      });
    } catch (error) {notify(error)}

    try {
      await updateProfile(user, {
        displayName: name,
      });
    } catch (error) {notify(error)}
    notify("Profile Updated")
    setTimeout(() => {
      window.location.reload();
    },500)
  };

  if (!currentUser) return <></>;

  return (
    <div className="w-full fadeIn h-[100dvh] flex justify-center relative overflow-hidden">
      <div
        ref={notificationBar}
        className="fixed min-[640px]:top-28 -right-96 max-[640px]:bottom-12 transition-all max-w-xs w-full bg-white border border-blue-400 shadow-lg rounded-xl flex items-center p-4 gap-4 z-50"
      >
        {/* Icon */}
        <div className="text-blue-500 text-xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M12 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z"
            />
          </svg>
        </div>

        {/* Message */}
        <div className="flex-1 text-sm text-gray-800">{Notification}</div>

        {/* Close Button */}
        <button
          onClick={() => {
            notificationBar.current.classList.remove("showNotification");
          }}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
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

      <div className={`w-96 flex flex-col items-center overflow-hidden`}>
        <h2>{userData?userData.username:" "}</h2>
        <div className="aspect-square w-32 bg-[#31313A] relative overflow-hidden rounded-full">
          <Image
            fill
            alt="profilePic"
            src={`${
              currentUser.photoURL ? currentUser.photoURL : "/noProfile.jpg"
            }`}
          />
        </div>
        <button className="py-2 font-bold text-[#6CBD6C]">Edit</button>

        <label
          htmlFor="name"
          className="font-bold text-[12px] ml-16 mt-5 w-full text-[#525252]"
        >
          Name
        </label>
        <input
          onChange={(e) => {
            setName(e.currentTarget.value);
          }}
          value={name}
          id="name"
          className="text-[#A6A6A6] bg-[#474751] w-80 px-3 py-1 my-1 rounded-sm"
        />

        <label
          htmlFor="about"
          className="font-bold text-[12px] ml-16 mt-5 w-full text-[#525252]"
        >
          About
        </label>
        <input
          onChange={(e) => {
            setAbout(e.currentTarget.value);
          }}
          value={about}
          id="about"
          className="text-[#A6A6A6] bg-[#474751] w-80 px-3 py-1 my-1 rounded-sm"
        />
        <div
          onClick={() => {
            handleSave();
          }}
          className="text-[#A6A6A6] font-bold bg-[#334C81] w-28 h-10 rounded-xl my-6 flex justify-center items-center"
        >
          <h1>Save</h1>
        </div>
      </div>
    </div>
  );
};

export default page;

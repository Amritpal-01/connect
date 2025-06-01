/** @format */

"use client";
import React, { useState, useRef, useEffect } from "react";
import { redirect } from "next/navigation";
import { useForm } from "react-hook-form";
import { auth } from "@/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";

const page = () => {
  const signupFormCont = useRef();
  const notificationBar = useRef();
  const [Notification, setNotification] = useState("");

  let notify = (message) => {
    setNotification(message);
    notificationBar.current.classList.add("showNotification");
    setTimeout(() => {
      notificationBar.current.classList.remove("showNotification");
    }, 5000);
  };

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm();



  const onSubmit = async (data) => {
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      notify("Logged in!");
    } catch (error) {
      notify(error.message);
    }
    reset();
  };

 
  return (
    <div
      className="w-full h-[100dvh] bg-[#212227] relative flex flex-col overflow-auto"
    >
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
      <div className="signupFormCont fadeIn" ref={signupFormCont}>
        <h2 className="text-center mt-20">WELCOME BACK</h2>
        <div className="formCont flex flex-row justify-center">
          <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
            <label
              htmlFor="email"
              className="font-bold text-white text-[12px] mt-5"
            >
              EMAIL
            </label>
            <input
              id="email"
              type="email"
              className={`text-[#A6A6A6] bg-[#474751] w-80 px-3 py-1 my-1 rounded-sm `}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Invalid email address",
                },
              })}
            />

            {errors.email && (
              <p className="text-red-500 text-[10px]">{errors.email.message}</p>
            )}

            

            <label
              htmlFor="password"
              className="font-bold text-white text-[12px] mt-5"
            >
              PASSWORD
            </label>
            <input
              id="password"
              className="text-[#A6A6A6] bg-[#474751] w-80 px-3 py-1 my-1 rounded-sm"
              type="password"
              {...register("password", {
                required: "Password is required",
              })}
            />
            {errors.password && (
              <p className="text-red-500 text-[10px]">
                {errors.password.message}
              </p>
            )}

            
            <input
              className="bg-[#32374B] text-[#605D72] cursor-pointer py-2 rounded-md my-4 hover:bg-[#272c40] hover:text-[#94939d]"
              type="submit"
            />
          </form>
        </div>
        <h4 className="text-center">
          DOnt have an Account?{" "}
          <span
            className="text-blue-400 cursor-pointer"
            onClick={() => {
              signupFormCont.current.classList.remove("fadeIn")
              signupFormCont.current.classList.add("fadeAway")
              setTimeout(() => {
                redirect("/signup")
              },300)
            }}
          >
            Register
          </span>
        </h4>
      </div>
    </div>
  );
};

export default page;

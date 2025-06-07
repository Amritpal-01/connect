/** @format */

"use client";
import React, { useState, useRef, useEffect } from "react";
import { redirect } from "next/navigation";
import { useForm } from "react-hook-form";
import { auth } from "@/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";

const page = () => {
  const signinFormCont = useRef();
  const notificationBar = useRef();
  const [Notification, setNotification] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
    } catch (error) {
      notify(error.message);
    }
    
    if(auth){
      redirect("/")
    }else{
      notify("some error occured!!")
    }
    setIsLoading(false);
  };

  return (
    <div
      className="w-full h-[100dvh] relative flex flex-col overflow-auto"
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
      <div className="signinFormCont fadeIn" ref={signinFormCont}>
        <div className="max-w-md w-full mx-auto p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-1">Welcome Back</h2>
            <p className="text-gray-400 text-sm">Sign in to continue chatting</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-0.5"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="w-full px-3 py-1.5 rounded-md bg-gray-800/50 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="mt-0.5 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-0.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                className="w-full px-3 py-1.5 rounded-md bg-gray-800/50 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                {...register("password", {
                  required: "Password is required",
                })}
              />
              {errors.password && (
                <p className="mt-0.5 text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{" "}
              <button
                onClick={() => {
                  signinFormCont.current.classList.remove("fadeIn");
                  signinFormCont.current.classList.add("fadeAway");
                  setTimeout(() => {
                    redirect("/auth/signup");
                  }, 300);
                }}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-300"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;

/** @format */

"use client";
import React, { useState, useRef } from "react";
import { redirect } from "next/navigation";
import { useForm } from "react-hook-form";
import { auth } from "@/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import Image from "next/image";

const page = () => {
  const signupFormCont = useRef();
  const notificationBar = useRef();
  const [Notification, setNotification] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOptionShowwn, setIsOptionShowwn] = useState(false);

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

  function convertToDate(arr) {
    const [month, day, year] = arr;
    const dateString = `${month} ${day}, ${year}`;
    const date = new Date(dateString);

    if (isNaN(date)) {
      return false;
    }

    return date;
  }

  const onSubmit = async (data) => {
    setIsLoading(true);
    let isUserDataSaved = false;

    //got the DOB elements
    let DOBInputs = document.querySelectorAll(".DOBInput");
    let dateArray = [];
    let isDateGood = true;

    //storeing DOB input in array and noting if any inpust is missing
    DOBInputs.forEach((input) => {
      dateArray.push(input.value);
      if (input.value == "") {
        input.focus();
        isDateGood = false;
      }
    });

    if (!isDateGood) {
      notify("Please fill in all date of birth fields");
      setIsLoading(false);
      return;
    }

    let date = convertToDate(dateArray);

    if (!date) {
      notify("Invalid date of birth");
      setIsLoading(false);
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, data.email, data.password);
      let user = auth.currentUser;

      let responce = await fetch("/api/registerUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          displayName: data.name,
          bio: "Hey, I'm " + data.name,
          dob: date,
          username: data.username,
          email: user.email,
          photoURL: user.photoURL,
        }),
      });

      if (!responce.ok) {
        const errorData = await responce.json();
        throw new Error(errorData.Message || "Something went wrong");
      }

      let res = await responce.json();

      if (res.status == 500) {
        throw new Error(res.Message);
      } else if (res.status == 409) {
        throw new Error(res.Message);
      }

      isUserDataSaved = true;
    } catch (error) {
      notify(error.message);
      reset();
    } finally {
      setIsLoading(false);
    }

    if (isUserDataSaved) {
      redirect("/");
    }
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const years = Array.from({ length: 100 }, (_, i) => (new Date().getFullYear() - i).toString());

  const DOBMap = [
    { type: "Month", options: months },
    { type: "Day", options: days },
    { type: "Year", options: years },
  ];

  const resetDOBSelectOptions = () => {
    setIsOptionShowwn(false);
    let options = document.querySelectorAll(".options");
    options.forEach((option) => {
      option.classList.add("hidden");
    });
  };

  const showDOBOptions = (e) => {
    const refer = "#" + e.currentTarget.id + "Options";
    let ele = document.querySelector(refer);
    if (isOptionShowwn) {
      resetDOBSelectOptions();
    }
    setIsOptionShowwn(true);
    ele.classList.remove("hidden");
  };

  const selectDOBOption = (e) => {
    const inputId = "#" + e.currentTarget.id.slice(0, -1) + "Input";
    let input = document.querySelector(inputId);
    input.value = e.currentTarget.innerHTML;
    resetDOBSelectOptions();
  };

  return (
    <div
      onClick={() => {
        if (isOptionShowwn) {
          resetDOBSelectOptions();
        }
      }}
      className="w-full h-[100dvh] relative flex flex-col overflow-auto bg-gradient-to-b from-gray-900 to-gray-800"
    >
      {/* Notification Bar */}
      <div
        ref={notificationBar}
        className="fixed min-[640px]:top-28 -right-96 max-[640px]:bottom-12 transition-all duration-500 ease-in-out max-w-xs w-full bg-white border border-blue-400 shadow-lg rounded-xl flex items-center p-4 gap-4 z-50"
      >
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
        <div className="flex-1 text-sm text-gray-800">{Notification}</div>
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

      {/* Sign Up Form */}
      <div className="signupFormCont fadeIn" ref={signupFormCont}>
        <div className="max-w-md w-full mx-auto p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-1">Create Account</h2>
            <p className="text-gray-400 text-sm">Join us and start chatting with friends</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-300 mb-0.5"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                className="w-full px-3 py-1.5 rounded-md bg-gray-800/50 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                {...register("name", {
                  required: "Name is required",
                })}
              />
              {errors.name && (
                <p className="mt-0.5 text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-300 mb-0.5"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                className="w-full px-3 py-1.5 rounded-md bg-gray-800/50 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                {...register("username", {
                  required: "Username is required",
                  validate: (value) =>
                    !/\s/.test(value) || "Username must not contain spaces",
                })}
              />
              {errors.username && (
                <p className="mt-0.5 text-sm text-red-500">
                  {errors.username.message}
                </p>
              )}
            </div>

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
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
                    message: "Password must be strong",
                  },
                })}
              />
              {errors.password && (
                <p className="mt-0.5 text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-0.5">
                Date of Birth
              </label>
              <div className="flex flex-row justify-between">
                {DOBMap.map((e) => {
                  return (
                    <div
                      onClick={(target) => {
                        showDOBOptions(target);
                      }}
                      type="button"
                      id={e.type}
                      key={e.type}
                      className="relative flex items-center cursor-pointer"
                    >
                      <div
                        id={e.type + "Options"}
                        className="options flex flex-col absolute bottom-10 w-full max-h-48 bg-gray-800 rounded-md scrollbar-thin-custom overflow-y-auto overflow-x-hidden hidden"
                      >
                        {e.options.map((i) => {
                          return (
                            <div
                              onClick={(e) => {
                                selectDOBOption(e);
                              }}
                              className="text-white py-1.5 text-[15px] cursor-pointer px-2 hover:bg-gray-700"
                              id={e.type + "O"}
                              key={i}
                            >
                              {i}
                            </div>
                          );
                        })}
                      </div>
                      <input
                        placeholder={e.type}
                        id={e.type + "Input"}
                        readOnly
                        className="DOBInput text-gray-200 bg-gray-800/50 w-25 border border-gray-700 px-2.5 py-1.5 my-0.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                      />
                      <svg
                        className="absolute right-2"
                        fill="#A6A6A6"
                        height="12px"
                        width="12px"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlnsXlink="http://www.w3.org/1999/xlink"
                        viewBox="0 0 491.996 491.996"
                        xmlSpace="preserve"
                      >
                        <g>
                          <g>
                            <path
                              d="M484.132,124.986l-16.116-16.228c-5.072-5.068-11.82-7.86-19.032-7.86c-7.208,0-13.964,2.792-19.036,7.86l-183.84,183.848
                            L62.056,108.554c-5.064-5.068-11.82-7.856-19.028-7.856s-13.968,2.788-19.036,7.856l-16.12,16.128
                            c-10.496,10.488-10.496,27.572,0,38.06l219.136,219.924c5.064,5.064,11.812,8.632,19.084,8.632h0.084
                            c7.212,0,13.96-3.572,19.024-8.632l218.932-219.328c5.072-5.064,7.856-12.016,7.864-19.224
                            C491.996,136.902,489.204,130.046,484.132,124.986z"
                            />
                          </g>
                        </g>
                      </svg>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating account...</span>
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{" "}
              <button
                onClick={() => {
                  signupFormCont.current.classList.remove("fadeIn");
                  signupFormCont.current.classList.add("fadeAway");
                  setTimeout(() => {
                    redirect("/auth/signin");
                  }, 300);
                }}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-300"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;

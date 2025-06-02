/** @format */

"use client";
import React, { useState, useRef, useEffect } from "react";
import { redirect } from "next/navigation";
import { useForm } from "react-hook-form";
import { auth } from "@/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { updateProfile } from "firebase/auth";
import { doc, setDoc, getFirestore, serverTimestamp } from "firebase/firestore";

const db = getFirestore();


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
    let DOBInputs = document.querySelectorAll(".DOBInput");
    let dateArray = [];
    let isDateGood = true;
    DOBInputs.forEach((input) => {
      dateArray.push(input.value);
      if (input.value == "") {
        input.focus();
        isDateGood = false;
      }
    });
    if (!isDateGood) {
      console.log(dateArray);
      notify("somthing is wrong with DOB!");
      return;
    }
    let date = convertToDate(dateArray);
    if (!date) {
      notify("somthing is wrong with DOB!");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, data.email, data.password);

      
    const user = auth.currentUser;
      
      await updateProfile(user, {
        displayName: data.name,
      });

      await setDoc(doc(db, "users", user.uid), {
      username: data.username,
      dob: date,
      bio: "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });


    } catch (error) {
      notify(error.message);
    }
    redirect("/")
  };

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const years = Array.from({ length: 100 }, (_, i) =>
    (new Date().getFullYear() - i).toString()
  );

  const DOBMap = [
    { type: "Month", options: months },
    { type: "Day", options: days },
    { type: "Year", options: years },
  ];

  const [isOptionShowwn, setIsOptionShowwn] = useState(false);

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
  };
  return (
    <div
      onClick={() => {
        if (isOptionShowwn) {
          resetDOBSelectOptions();
        }
      }}
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
        <h2 className="text-center">CREATE ACCOUNT</h2>
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
              htmlFor="name"
              className="font-bold text-white text-[12px] mt-5"
            >
              DISPLAY NAME
            </label>
            <input
              id="name"
              className="text-[#A6A6A6] bg-[#474751] w-80 px-3 py-1 my-1 rounded-sm"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && (
              <p className="text-red-500 text-[10px]">
                {errors.username.message}
              </p>
            )}
            <label
              htmlFor="username"
              className="font-bold text-white text-[12px] mt-5"
            >
              USERNAME
            </label>
            <input
              id="username"
              className="text-[#A6A6A6] bg-[#474751] w-80 px-3 py-1 my-1 rounded-sm"
              {...register("username", {
                required: "username is required",
                validate: (value) =>
                  !/\s/.test(value) || "Username must not contain spaces",
              })}
            />

            {errors.username && (
              <p className="text-red-500 text-[10px]">
                {errors.username.message}
              </p>
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
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
                  message: "Password must be strong",
                },
              })}
            />
            {errors.password && (
              <p className="text-red-500 text-[10px]">
                {errors.password.message}
              </p>
            )}

            <label className="font-bold text-white text-[12px] mt-5">
              DATE OF BIRTH
            </label>
            <div className="flex flex-row justify-between ">
              {DOBMap.map((e) => {
                return (
                  <div
                    onClick={(target) => {
                      showDOBOptions(target);
                    }}
                    type="button"
                    id={e.type}
                    key={e.type}
                    className="relative flex items-center **:cursor-pointer"
                  >
                    <div
                      id={e.type + "Options"}
                      className="options flex flex-col absolute bottom-10 w-full max-h-56 bg-[#474751] rounded-sm scrollbar-thin-custom overflow-y-auto overflow-x-hidden hidden"
                    >
                      {e.options.map((i) => {
                        return (
                          <div
                            onClick={(e) => {
                              selectDOBOption(e);
                            }}
                            className="text-white py-2 text-[16px] cursor-pointer px-2 hover:bg-[#212227]"
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
                      className="DOBInput text-[#A6A6A6] bg-[#474751] w-25 border focus:border-red-400 px-3 py-1 my-1 rounded-sm "
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
            <input
              className="bg-[#32374B] text-[#605D72] cursor-pointer py-2 rounded-md my-4 hover:bg-[#272c40] hover:text-[#94939d]"
              type="submit"
            />
          </form>
        </div>
        <h4 className="text-center">
          Already have an Account?{" "}
          <span
            className="text-blue-400 cursor-pointer"
            onClick={() => {
              signupFormCont.current.classList.remove("fadeIn");
              signupFormCont.current.classList.add("fadeAway");
              setTimeout(() => {
                redirect("/signin");
              }, 300);
            }}
          >
            sign in
          </span>
        </h4>
      </div>
    </div>
  );
};

export default page;

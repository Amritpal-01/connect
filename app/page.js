/** @format */

"use client";
import { useEffect, useState, useContex, useRef } from "react";
import { auth, db } from "@/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { redirect } from "next/navigation";
import { signOut } from "firebase/auth";

export default function Home() {
  const { currentUser, userData,isLoadingSession } = useAuth();


  useEffect(() => {
    if(!isLoadingSession && !currentUser){
      redirect("/signin")
    }
  },[currentUser,isLoadingSession])

  if (!currentUser) return <></>;

  return (
    <div className="h-[100dvh] flex overflow-hidden">
      <div id="friendSection" className="h-full w-96">
        <header className="flex justify-between m-5">
          <div onClick={() => {
                redirect("/profile")
            }} className="flex gap-2">
            <div className="aspect-square w-10 bg-white rounded-full"></div>
            <svg
              className="mt-auto"
              width="20px"
              height="20px"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21.2799 6.40005L11.7399 15.94C10.7899 16.89 7.96987 17.33 7.33987 16.7C6.70987 16.07 7.13987 13.25 8.08987 12.3L17.6399 2.75002C17.8754 2.49308 18.1605 2.28654 18.4781 2.14284C18.7956 1.99914 19.139 1.92124 19.4875 1.9139C19.8359 1.90657 20.1823 1.96991 20.5056 2.10012C20.8289 2.23033 21.1225 2.42473 21.3686 2.67153C21.6147 2.91833 21.8083 3.21243 21.9376 3.53609C22.0669 3.85976 22.1294 4.20626 22.1211 4.55471C22.1128 4.90316 22.0339 5.24635 21.8894 5.5635C21.7448 5.88065 21.5375 6.16524 21.2799 6.40005V6.40005Z"
                stroke="#474751"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M11 4H6C4.93913 4 3.92178 4.42142 3.17163 5.17157C2.42149 5.92172 2 6.93913 2 8V18C2 19.0609 2.42149 20.0783 3.17163 20.8284C3.92178 21.5786 4.93913 22 6 22H17C19.21 22 20 20.2 20 18V13"
                stroke="#474751"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div
            onClick={() => {
                redirect("/friend/add")
            }}
            id="addFriend"
            className="h-8 aspect-square rounded-full bg-[#1F5B82] flex justify-center items-center"
          >
            <svg
              fill="#fff"
              version="1.1"
              id="Capa_1"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              width="16px"
              height="16px"
              viewBox="0 0 45.902 45.902"
              xmlSpace="preserve"
            >
              <g>
                <g>
                  <path
                    d="M43.162,26.681c-1.564-1.578-3.631-2.539-5.825-2.742c1.894-1.704,3.089-4.164,3.089-6.912
			c0-5.141-4.166-9.307-9.308-9.307c-4.911,0-8.932,3.804-9.281,8.625c4.369,1.89,7.435,6.244,7.435,11.299
			c0,1.846-0.42,3.65-1.201,5.287c1.125,0.588,2.162,1.348,3.066,2.26c2.318,2.334,3.635,5.561,3.61,8.851l-0.002,0.067
			l-0.002,0.057l-0.082,1.557h11.149l0.092-12.33C45.921,30.878,44.936,28.466,43.162,26.681z"
                  />
                  <path
                    d="M23.184,34.558c1.893-1.703,3.092-4.164,3.092-6.912c0-5.142-4.168-9.309-9.309-9.309c-5.142,0-9.309,4.167-9.309,9.309
			c0,2.743,1.194,5.202,3.084,6.906c-4.84,0.375-8.663,4.383-8.698,9.318l-0.092,1.853h14.153h15.553l0.092-1.714
			c0.018-2.514-0.968-4.926-2.741-6.711C27.443,35.719,25.377,34.761,23.184,34.558z"
                  />
                  <path
                    d="M6.004,11.374v3.458c0,1.432,1.164,2.595,2.597,2.595c1.435,0,2.597-1.163,2.597-2.595v-3.458h3.454
			c1.433,0,2.596-1.164,2.596-2.597c0-1.432-1.163-2.596-2.596-2.596h-3.454V2.774c0-1.433-1.162-2.595-2.597-2.595
			c-1.433,0-2.597,1.162-2.597,2.595V6.18H2.596C1.161,6.18,0,7.344,0,8.776c0,1.433,1.161,2.597,2.596,2.597H6.004z"
                  />
                </g>
              </g>
            </svg>
          </div>
        </header>
        <main className="friends h-full w-full flex flex-col items-center">
          <div className="search flex items-center relative mb-5">
            <input
              className="text-[#A6A6A6] bg-[#474751] w-80 pl-9 pr-3 py-1 my-1 rounded-lg "
              type="search"
              placeholder="Search"
            />
            <svg
              className="absolute left-2"
              width="20px"
              height="20px"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14.9536 14.9458L21 21M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                stroke="#A6A6A6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="w-full flex flex-col items-center pb-40 overflow-auto">
            <div className="friend w-full px-[20px] flex flex-row py-3 relative hover:bg-[#323239]">
              <div className="w-[80%] bg-[#a1a1ab] h-[0.5px] absolute -top-0 left-[10%]"></div>
              <div className="aspect-square w-12 bg-white rounded-full"></div>
              <div className="flex flex-col mx-3">
                <h1 className="text-white font-bold">Some Guy</h1>
                <h3 className="text-[#56595F] text-[13px]">Description</h3>
              </div>
              <div className="ml-auto flex flex-col justify-between">
                <h3 className="text-[#56595F] text-sm">8:34 AM</h3>
                <div className="aspect-square w-6 ml-auto rounded-full bg-blue-400 text-center text-white">
                  1
                </div>
              </div>
            </div>
          </div>
          {/* <div className="h-16 w-96 bg-[#313340] absolute bottom-0"></div> */}
        </main>
      </div>
      <div className="w-1 h-full bg-[#474751]"></div>
      <div id="messageSection" className="flex-1 h-full"></div>
    </div>
  );
}

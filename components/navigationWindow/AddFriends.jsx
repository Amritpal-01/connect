/** @format */

import React, { useState } from "react";
import Requests from "./addFriends/Requests";

const AddFriends = () => {
  const [panel, setPanel] = useState("requests");

  return (
    <div className="flex flex-col items-center pt-8 px-4">
      <h2 className="-mt-5">
        Add Friends
      </h2>

      <div className="w-full max-w-md">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setPanel("requests")}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
              panel === "requests"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50"
            }`}
          >
            Friend Requests
          </button>
          <button
            onClick={() => setPanel("search")}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
              panel === "search"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50"
            }`}
          >
            Search Users
          </button>
        </div>

        <div className="w-full">
          <div
            className={`transition-all duration-500 ease-in-out transform ${
              panel === "requests"
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-full absolute"
            }`}
          >
            <Requests />
          </div>
          <div
            className={`transition-all duration-500 ease-in-out transform ${
              panel === "search"
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-full absolute"
            }`}
          >
            <div className="w-full space-y-4">
              <div className="relative">
                <input
                  type="search"
                  placeholder="Search by username"
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-800/50 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 backdrop-blur-sm"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  width="20px"
                  height="20px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14.9536 14.9458L21 21M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="text-center text-gray-400 py-8">
                Search for users to add as friends
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFriends;

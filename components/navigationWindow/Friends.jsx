/** @format */

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import Image from "next/image";

const Friends = ({ setActivePanelMain }) => {
  const { setActiveFriend } = useChat();
  const { currentUser, userData, isLoadingSession } = useAuth();
  const [userFriends, setUserFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (userData) {
      setUserFriends(userData.friends);
    }
  }, [userData]);

  const filteredFriends = userFriends.filter(
    (friend) =>
      friend.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const deleteUnSeenMessages = async (friendName) => {
    let response = await fetch("/api/deleteMessages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        friendname: friendName,
        username: userData.username,
      }),
    });
  };

  return (
    <div className="">
      <main className="friends h-full flex flex-col items-center px-4">
        <h2 className="">Friends</h2>
        <div className="search flex items-center relative mb-5 w-full max-w-md">
          <input
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-800/50 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 backdrop-blur-sm"
            type="search"
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg
            className="absolute left-3 text-gray-400"
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

        <div className="w-full h-90dvh flex flex-1 flex-col items-center pb-40 overflow-auto scrollbar-thin-custom">
          {filteredFriends.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              {searchQuery
                ? "No friends found matching your search"
                : "No friends yet"}
            </div>
          ) : (
            filteredFriends.map((friend) => (
              <div
                key={friend.uid}
                onClick={async () => {
                  setActivePanelMain("room");
                  setActiveFriend(friend);
                }}
                className="friend w-full max-w-md px-4 py-3 flex items-center gap-3 relative hover:bg-gray-800/50 active:bg-gray-800/50 rounded-xl transition-all duration-300 cursor-pointer group"
              >
                <div className="aspect-square w-12 relative overflow-hidden rounded-full ring-2 ring-gray-700 group-hover:ring-blue-500 transition-all duration-300">
                  <Image
                    fill
                    alt="profilePic"
                    src={friend.photoURL || "/noProfile.jpg"}
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-white font-semibold truncate">
                    {friend.displayName}
                  </h1>
                  <h3 className="text-gray-400 text-sm truncate">
                    {friend.lastMessage.text}
                  </h3>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <h3 className="text-gray-400 text-xs">
                    {friend.lastMessage &&
                      new Date(friend.lastMessage.timestamp).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        }
                      )}
                  </h3>
                  {friend.unSeenMessages.length != 0 && (
                    <div className="aspect-square w-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-medium shadow-lg shadow-blue-500/25">
                      {friend.unSeenMessages.length}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Friends;

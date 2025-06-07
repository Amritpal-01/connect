import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

const Requests = () => {
  const { currentUser, userData, isLoadingSession } = useAuth();
  const [addByUsernameToggle, setAddByUsernameToggle] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friendname, setFriendname] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if(userData) setFriendRequests(userData.friendRequests)
  }, [userData])

  const acceptFriendRequest = async (username) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/sendFriendRequest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: userData.username,
          friendname: username,
          typeAccept: true
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to accept friend request");
      }

      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const sendFriendRequest = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/sendFriendRequest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: userData.username,
          friendname: friendname,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send friend request");
      }

      const data = await response.json();
      console.log(data);
      setFriendname("");
      setAddByUsernameToggle(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex justify-center relative">
      {addByUsernameToggle && (
        <button
          onClick={() => setAddByUsernameToggle(false)}
          className="absolute top-6 -left-10 z-20 p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-300 backdrop-blur-sm"
        >
          <svg
              className="text-gray-400 group-hover:text-blue-500 rotate-180 transition-colors duration-300"
              width="20px"
              height="20px"
              viewBox="0 0 42 42"
              fill="currentColor"
            >
              <polygon points="13.933,1 34,21.068 14.431,40.637 9.498,35.704 24.136,21.068 9,5.933" />
            </svg>
        </button>
      )}

      <div className={`w-full max-w-md transition-all duration-500 ease-in-out transform ${addByUsernameToggle ? 'opacity-0 -translate-x-full absolute' : 'opacity-100 translate-x-0'}`}>
        <div className="space-y-6">
          <div
            onClick={() => setAddByUsernameToggle(true)}
            className="w-full bg-gray-800/50 hover:bg-gray-700/50 flex justify-between items-center p-4 rounded-xl cursor-pointer transition-all duration-300 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 group-hover:bg-blue-500/30 transition-all duration-300">
                <span className="text-xl font-bold">@</span>
              </div>
              <h1 className="font-medium text-gray-200">
                Add by Username
              </h1>
            </div>
            <svg
              className="text-gray-400 group-hover:text-blue-500 transition-colors duration-300"
              width="20px"
              height="20px"
              viewBox="0 0 42 42"
              fill="currentColor"
            >
              <polygon points="13.933,1 34,21.068 14.431,40.637 9.498,35.704 24.136,21.068 9,5.933" />
            </svg>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-200">Friend Requests</h2>
            {friendRequests.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                No pending friend requests
              </div>
            ) : (
              friendRequests.map((request) => (
                <div
                  key={request.friendUid}
                  className="w-full bg-gray-800/50 rounded-xl p-4 space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="aspect-square w-12 relative overflow-hidden rounded-full ring-2 ring-gray-700">
                      <Image
                        fill
                        alt="profilePic"
                        src={request.friendPhotoURL || "/noProfile.jpg"}
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h1 className="text-white font-medium">
                        {request.friendDisplayName}
                      </h1>
                      <p className="text-sm text-gray-400">
                        @{request.friendUsername}
                      </p>
                    </div>
                    <button
                      onClick={() => acceptFriendRequest(request.friendUsername)}
                      disabled={isLoading}
                      className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className={`w-full max-w-md transition-all duration-500 ease-in-out transform ${addByUsernameToggle ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full absolute'}`}>
        <div className="space-y-6">
          <h2 className="text-lg font-medium text-gray-200">Add by Username</h2>
          <div className="space-y-4">
            <div className="relative">
              <input
                onChange={(e) => setFriendname(e.target.value)}
                value={friendname}
                id="username"
                placeholder="Enter a username"
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-800/50 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 backdrop-blur-sm"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">@</span>
            </div>
            <button
              onClick={sendFriendRequest}
              disabled={isLoading || !friendname.trim()}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Sending...</span>
                </>
              ) : (
                <span>Send Friend Request</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Requests

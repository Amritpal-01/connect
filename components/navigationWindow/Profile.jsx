/** @format */

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";

const Profile = () => {
  const { currentUser, userData, setUserData, fetchUserData } = useAuth();
  const [isEdited, setIsEdited] = useState(false);
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userData) {
      setName(userData.profile.displayName || "");
      setAbout(userData.profile.bio || "");
    }
  }, [userData]);

  useEffect(() => {
    if (!userData) return;
    const isNameChanged = name !== (userData.profile.displayName || "");
    const isAboutChanged = about !== (userData.profile.bio || "");
    setIsEdited(isNameChanged || isAboutChanged);
  }, [name, about, userData]);

  const updateUserData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/updateProfile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: currentUser.uid,
          displayName: name,
          bio: about
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      await response.json();
      await fetchUserData();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex justify-center items-start pt-8">
      <div className="w-full max-w-md flex flex-col items-center px-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-6">
          {userData.username}
        </h2>
        
        <div className="relative group">
          <div className="aspect-square w-32 relative overflow-hidden rounded-full ring-4 ring-gray-800 group-hover:ring-blue-500 transition-all duration-300">
            <Image
              fill
              alt="profilePic"
              src={userData.profile.photoURL || "/noProfile.jpg"}
              className="object-cover"
            />
          </div>
          <button className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-110">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>

        <div className="w-full space-y-6 mt-8">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-400"
            >
              Display Name
            </label>
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              id="name"
              className="w-full px-4 py-2 rounded-xl bg-gray-800/50 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 backdrop-blur-sm"
              placeholder="Enter your display name"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="about"
              className="block text-sm font-medium text-gray-400"
            >
              About
            </label>
            <textarea
              onChange={(e) => setAbout(e.target.value)}
              value={about}
              id="about"
              rows={3}
              className="w-full px-4 py-2 rounded-xl bg-gray-800/50 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 backdrop-blur-sm resize-none"
              placeholder="Tell us about yourself"
            />
          </div>

          {isEdited && (
            <button
              onClick={updateUserData}
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

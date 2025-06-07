/** @format */

"use client";

// context/authContext.js
import { createContext, useEffect, useState, useContext } from "react";
import { auth } from "@/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { redirect } from "next/navigation";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentChats, setCurrentChats] = useState(null)
  const [currentUser, setCurrentUser] = useState(null); // Firebase Auth user
  const [userData, setUserData] = useState(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setIsLoadingSession(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchUserData = async () => {
      if (!currentUser) return;
      

      let responce = await fetch("/api/getUserData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: currentUser.uid,
        }),
      });

      if (!responce.ok) {
        redirect("/auth/signup");
      } else {
        let res = await responce.json();
        setUserData(res.user);
      }

    };

  useEffect(() => {
    

    fetchUserData();
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, userData, fetchUserData ,isLoadingSession , currentChats, setCurrentChats}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

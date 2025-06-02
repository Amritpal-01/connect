"use client"

// context/authContext.js
import { createContext, useEffect, useState, useContext } from "react";
import { auth, db } from "@/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); // Firebase Auth user
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

    useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;

      const userRef = doc(db, "users", currentUser.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData(data);
      }
    };

    fetchUserData();
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser,userData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

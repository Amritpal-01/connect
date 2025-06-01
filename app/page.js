/** @format */

"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function Home() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUser(user);
      console.log("Auth user:", user);
    });
    return () => unsub();
  }, []);

  // Fetch user-specific Firestore data once we have the user
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData(data);
        console.log("Fetched Firestore user data:", data);
      } else {
        console.log("No such document in Firestore!");
      }
    };

    fetchUserData();
  }, [user]);

  if (!user) return <p>You must log in to view this page.</p>;

  return (
    <div>
      <p>Welcome, {user.email}</p>
      {userData && (
        <div>
          <p><strong>Username:</strong> {userData.username}</p>
          <p><strong>Bio:</strong> {userData.bio}</p>
        </div>
      )}
      <h2
        className="bg-black text-white cursor-pointer p-2 mt-4 inline-block"
        onClick={async () => {
          await signOut(auth);
        }}
      >
        Log out
      </h2>
    </div>
  );
}

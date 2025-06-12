/** @format */

import mongoose from "mongoose";
import { NextResponse } from "next/server";
import UserData from "@/app/models/userData";

export async function POST(request) {
  // accuired data
  let profile = await request.json();

  try {
    // connecting to DB
    await mongoose.connect(`${process.env.MONGODB_URI}connect`);

    // finding user in database
    let currentUser = await UserData.findOne({ username: profile.username });

    //if username does not exist already
    if (!currentUser) {
      const createUserData = new UserData({
        uid: profile.uid,
        username: profile.username,
        profile: {
          displayName: profile.displayName,
          bio: profile.bio,
          dob: profile.dob,
          email: profile.email,
          photoURL: profile.photoURL,
        },
        friendRequests: [],
        friends: [],
      });

      await createUserData.save();

      return NextResponse.json({ Message: "new user created", status: 200 });
    } else {
      return NextResponse.json({
        Message: "username already exists",
        status: 409,
      });
    }
  } catch {
    return NextResponse.json({ Message: "internal server error", status: 500 });
  }
}

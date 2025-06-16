/** @format */

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import UserData from "@/app/models/userData";
// Connect to MongoDB
await mongoose.connect(`${process.env.MONGODB_URI}connect`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

export async function POST(request) {
  try {
    const { userUid, friendUid } = await request.json();

    if (!userUid || !friendUid) {
      return NextResponse.json({ error: "Missing userUid or friendUid" }, { status: 400 });
    }

    // Fetch the friend's latest data
    const friendDoc = await UserData.findOne({ uid: friendUid });
    if (!friendDoc) {
      return NextResponse.json({ error: "Friend user not found" }, { status: 404 });
    }

    const { displayName, photoURL } = friendDoc.profile;

    // Find user who has this friend
    const userDoc = await UserData.findOne({ uid: userUid });
    if (!userDoc) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const friend = userDoc.friends.find((f) => f.uid === friendUid);
    if (!friend) {
      return NextResponse.json({ error: "Friend not in user's friend list" }, { status: 404 });
    }

    // Update the displayName and photoURL
    friend.displayName = displayName;
    friend.photoURL = photoURL;

    await userDoc.save();

    return NextResponse.json({ message: "Friend info updated successfully" }, { status: 200 });

  } catch (error) {
    console.error("Error updating friend info:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

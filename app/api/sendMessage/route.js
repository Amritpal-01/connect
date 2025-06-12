/** @format */

import mongoose from "mongoose";
import { NextResponse } from "next/server";
import UserData from "@/app/models/userData";

export async function POST(request) {
  try {
    // Parse incoming data
    const { friendname, message, username } = await request.json();

    // Validate incoming data
    if (!friendname || !message || !message.text || !message.sender || !username) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await mongoose.connect(`${process.env.MONGODB_URI}connect`);

    // Find the user document of the friend (i.e., the message receiver)
    let friend = await UserData.findOne({ username: friendname });

    if (!friend) {
      return NextResponse.json(
        { error: "Friend not found" },
        { status: 404 }
      );
    }

    // Find the correct 'friend' object in their `friends` array
    let userInFriendList = friend.friends.find(f => f.username === username);

    if (!userInFriendList) {
      return NextResponse.json(
        { error: "Sender not found in friend's friend list" },
        { status: 404 }
      );
    }

    // Add unseen message
    userInFriendList.unSeenMessages.push({
      text: message.text,
      sender: message.sender,
      timestamp: new Date(),
    });

    // Save changes
    await friend.save();

    return NextResponse.json({
      success: true,
      message: "Message added successfully to unseen messages",
    });

  } catch (error) {
    console.error("Error adding message:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

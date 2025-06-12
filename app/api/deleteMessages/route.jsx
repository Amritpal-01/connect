/** @format */

import mongoose from "mongoose";
import { NextResponse } from "next/server";
import UserData from "@/app/models/userData";

export async function POST(request) {
  try {
    const { username, friendname } = await request.json();

    // console.log(username,friendname)

    if (!username || !friendname) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Connect to DB
    await mongoose.connect(`${process.env.MONGODB_URI}connect`);

    // Find the user's own document
    const user = await UserData.findOne({ username });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Find the friend entry in the user's friends array
    const friendEntry = user.friends.find(f => f.username === friendname);

    if (!friendEntry) {
      return NextResponse.json(
        { error: "Friend entry not found in user's friend list" },
        { status: 404 }
      );
    }

    // Clear unSeenMessages
    friendEntry.unSeenMessages = [];

    // Save changes
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Unseen messages cleared from your friend list",
    });

  } catch (error) {
    console.error("Error clearing unseen messages:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

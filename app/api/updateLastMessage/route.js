/** @format */

import mongoose from "mongoose";
import { NextResponse } from "next/server";
import UserData from "@/app/models/userData";

export async function POST(request) {
  let { userUid, friendUid, message } = await request.json();

  // Basic input validation
  if (!userUid || !friendUid || message === undefined) {
    return NextResponse.json({
      message: "Missing required fields: userUid, friendUid, or message",
      status: 400,
    });
  }

  try {
    // Connect to MongoDB
    // Ensure process.env.MONGODB_URI is correctly configured without extra suffixes
    if (mongoose.connection.readyState !== 1) { // Check if already connected
      await mongoose.connect(process.env.MONGODB_URI);
    }

    // Start a Mongoose session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find the user and their friend's document
      const user = await UserData.findOne({ uid: userUid }).session(session);
      const friendUser = await UserData.findOne({ uid: friendUid }).session(session);

      if (!user) {
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json({ message: "User not found", status: 404 });
      }

      if (!friendUser) {
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json({ message: "Friend's user data not found", status: 404 });
      }

      // Find the specific friend entry in the user's friends array
      const userFriendEntry = user.friends.find(
        (f) => f.uid === friendUid // Assuming `friends` array stores `uid` of the friend
      );

      // Find the specific user entry in the friend's friends array (for the reciprocal relationship)
      const friendUserFriendEntry = friendUser.friends.find(
        (f) => f.uid === userUid // Assuming `friends` array stores `uid` of the user
      );

      if (!userFriendEntry || !friendUserFriendEntry) {
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json({
          message: "Friend relationship not found for one or both users",
          status: 404,
        });
      }

      // Update the lastMessage field
      userFriendEntry.lastMessage = message;
      friendUserFriendEntry.lastMessage = message;

      // Save the parent documents after modifying subdocuments
      await user.save({ session });
      await friendUser.save({ session });

      await session.commitTransaction();
      session.endSession();

      return NextResponse.json({ message: "Last message updated successfully", status: 200 });
    } catch (transactionError) {
      await session.abortTransaction();
      session.endSession();
      console.error("Transaction failed:", transactionError);
      return NextResponse.json({
        message: "Failed to update messages due to a transaction error",
        status: 500,
      });
    }
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({
      message: "Internal server error",
      status: 500,
    });
  }
}
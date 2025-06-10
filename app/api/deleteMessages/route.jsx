/** @format */

import mongoose from "mongoose";
import { NextResponse } from "next/server";
import Room from "@/app/models/Room";

export async function POST(request) {
  try {
    const body = await request.json();

    await mongoose.connect(`${process.env.MONGODB_URI}connect`);

    const roomId = [body.userUid, body.friendUid].sort().join("szrad");

    // Find and update the room by clearing messages
    const updatedRoom = await Room.findOneAndUpdate(
      { roomId },
      { $set: { messages: [] } },
      { new: true }
    );

    if (!updatedRoom) {
      return NextResponse.json({ message: "room not found", status: 404 });
    }

    return NextResponse.json({
      message: "All messages deleted",
      status: 200,
      updatedRoom,
    });
  } catch (error) {
    return NextResponse.json({ message: "internal server error", status: 500 });
  }
}

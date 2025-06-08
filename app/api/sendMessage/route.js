/** @format */

// @format

import mongoose from "mongoose";
import { NextResponse } from "next/server";
import Room from "@/app/models/Room"; // Adjust the path based on your file structure

export async function POST(request) {
  try {
    // Parse incoming data
    const { roomId, message } = await request.json();

    // Validate incoming data
    if (!roomId || !message || !message.text || !message.sender) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await mongoose.connect(`${process.env.MONGODB_URI}connect`);

    // Find the room
    let room = await Room.findOne({ roomId });

    // If room doesn't exist, create it
    if (!room) {
      room = new Room({ roomId, messages: [] });
    }

    // Add message with timestamp
    room.messages.push({ //even tho i worte it ignoring the body its still isnt working
      text: message.text,
      sender: message.sender,
      timestamp: new Date(),
    });

    // Save updated room
    await room.save();

    return NextResponse.json({
      success: true,
      message: "Message added successfully",
    });

  } catch (error) {
    console.error("Error adding message:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

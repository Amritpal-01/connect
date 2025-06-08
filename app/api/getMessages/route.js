/** @format */

import mongoose from "mongoose";
import { NextResponse } from "next/server";
import Room from "@/app/models/Room";

export async function POST(request) {
  try {
    //aquiring data
    let body = await request.json();

    await mongoose.connect(`${process.env.MONGODB_URI}connect`);

    // finding user usinf uid
    let currentRoom = await Room.findOne({
      roomId: [body.userUid, body.friendUid].sort().join("szrad")
    });


    // if user not found
    if (!currentRoom) {
      return NextResponse.json({ message: "room not found", status: 404 });
    }


    return NextResponse.json({ status: 200, currentRoom });
  } catch {
    return NextResponse.json({ message: "internal server error", status: 500 });
  }
}

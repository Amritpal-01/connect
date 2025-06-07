/** @format */

import mongoose from "mongoose";
import { NextResponse } from "next/server";
import UserData from "@/app/models/userData";

export async function POST(request) {
  let { uid, displayName, bio } = await request.json();

  try {
    
    await mongoose.connect(`${process.env.MONGODB_URI}connect`);
    console.log("Connecting to DB...");

    await UserData.findOneAndUpdate(
      { uid },
      { displayName, bio },
    );

    console.log("User updated");
    return NextResponse.json({ message: "Updated", status: 200 });
  } catch (error) {
    console.error("Update failed:", error);
    return NextResponse.json({
      message: "Internal server error",
      status: 500,
    });
  }
}

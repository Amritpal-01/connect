/** @format */

import mongoose from "mongoose";
import { NextResponse } from "next/server";
import UserData from "@/app/models/userData";

export async function POST(request) {
  try {
    //aquiring data
    let body = await request.json();

    await mongoose.connect(`${process.env.MONGODB_URI}connect`);
    // finding user usinf uid
    let user = await UserData.findOne({ uid: body.uid });

    // if user not found
    if (!user) {
      await mongoose.disconnect();
      return NextResponse.json({ message: "user not found", status: 404 });
    }


    return NextResponse.json({ status: 200, user });
  } catch {
    return NextResponse.json({ message: "internal server error", status: 500 });
  }
}

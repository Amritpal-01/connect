/** @format */

import mongoose from "mongoose";
import { NextResponse } from "next/server";
import UserData from "@/app/models/userData";

export async function POST(request) {
  try {
    let body = await request.json();

    await mongoose.connect(`${process.env.MONGODB_URI}connect`);

    let user = await UserData.findOne({ username: body.username });
    let friend = await UserData.findOne({ username: body.friendname });

    if (!user) {
      return NextResponse.json({ message: "user not found", status: 500 });
    }

    if (!friend) {
      return NextResponse.json({ message: "friend not found", status: 500 });
    }

    let id = [user.uid, friend.uid].sort().join("szrad");

    const a = await UserData.findOne({
      _id: user._id,
      "friends.username": body.friendname, // assuming 'body.friendname' holds the username
    });

    if (a == null) {
      user.friends.push({
        roomId: id,
        uid: friend.uid,
        username: friend.username,
        displayName: friend.profile.displayName,
        photoURL: friend.profile.photoURL,
        unSeenMessages: [],
        lastMessage: {
          text: null,
          sender: null,
          timestamp: new Date(),
        },
      });
    }

    if (!body.typeAccept) {
      const b = await UserData.findOne({
        _id: friend._id,
        "friendRequests.username": user.username, // assuming 'body.friendname' holds the username
      });

      if (b == null) {
        friend.friendRequests.push({
          uid: user.uid,
          displayName: user.profile.displayName,
          username: user.username,
          photoURL: user.profile.photoURL,
        });
      }

      await friend.save();
    }

    if (body.typeAccept) {
      const result = await UserData.updateOne(
        { _id: user._id },
        {
          $pull: {
            friendRequests: { username: body.friendname }, // make sure this value is correct
          },
        }
      );
    }

    await user.save();

    return NextResponse.json({ status: 200, id: id });
  } catch {
    return NextResponse.json({ message: "internal server error", status: 500 });
  }
}

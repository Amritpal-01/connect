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

    const a = await UserData.findOne({
      _id: user._id,
      "friends.friendUsername": body.friendname, // assuming 'body.friendname' holds the username
    });

    console.log(a);

    if (a == null) {
      user.friends.push({
        friendUid: friend.uid,
        friendDisplayName: friend.displayName,
        friendBio: friend.bio,
        friendDob: friend.dob,
        friendUsername: friend.username,
        friendPhotoURL: friend.photoURL,
      });
    }

    if (!body.typeAccept) {
      const b = await UserData.findOne({
        _id: friend._id,
        "friendRequests.friendUsername": user.username, // assuming 'body.friendname' holds the username
      });

      if(b == null){
        friend.friendRequests.push({
        friendUid: user.uid,
        friendDisplayName: user.displayName,
        friendUsername: user.username,
        friendPhotoURL: user.photoURL,
      });
      }

      await friend.save();
    }

    if (body.typeAccept) {
      const result = await UserData.updateOne(
        { _id: user._id },
        {
          $pull: {
            friendRequests: { friendUsername: body.friendname }, // make sure this value is correct
          },
        }
      );
    }

    await user.save();


    return NextResponse.json({ status: 200 });
  } catch {
    return NextResponse.json({ message: "internal server error", status: 500 });
  }
}

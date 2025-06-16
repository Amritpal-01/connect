/** @format */

import mongoose, { model, Schema } from "mongoose";

const messageSchema = new Schema({
  text: String,
  sender: String,
  timestamp: Date,
});

const requestSchema = new Schema({
  uid: String,
  displayName: String,
  username: String,
  photoURL: String,
});

const friendSchema = new Schema({
  roomId: String,
  uid: String,
  displayName: String,
  username: String,
  photoURL: String,
  unSeenMessages: [messageSchema],
  lastMessage: {
    text: String,
    sender: String,
    timestamp: Date,
  },
});

const UserDataSchema = new Schema({
  uid: String,
  username: String,
  profile: {
    displayName: String,
    bio: String,
    dob: Date,
    email: String,
    photoURL: String,
  },
  friends: [friendSchema],
  friendRequests: [requestSchema],
});

const UserData = mongoose.models.UserData || model("UserData", UserDataSchema);

export default UserData;
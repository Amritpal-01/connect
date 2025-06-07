import mongoose, { model, Schema } from "mongoose";


const friendRequests = new Schema({
    friendUid: String,
    friendDisplayName: String,
    friendUsername : String,
    friendPhotoURL : String,
})

const friendSchema = new Schema({
    friendUid: String,
    friendDisplayName: String,
    friendBio : String,
    friendDob : Date,
    friendUsername : String,
    friendPhotoURL : String,
})


const UserDataSchema = new Schema({
    uid: String,
    displayName: String,
    bio : String,
    dob : Date,
    username : String,
    email : String,
    photoURL : String,
    friends : [friendSchema],
    friendRequests : [friendRequests]
});

const UserData = mongoose.models.UserData || model("UserData", UserDataSchema);

export default UserData;
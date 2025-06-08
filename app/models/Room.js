import mongoose, { model, Schema } from "mongoose";

const messageSchema = new Schema({
    text : String,
    sender : String,
    timestamp : Date
})

const RoomSchema = new Schema({
    roomId : String,
    messages : [messageSchema]
})
const Room = mongoose.models.Room || model("Room", RoomSchema);

export default Room;
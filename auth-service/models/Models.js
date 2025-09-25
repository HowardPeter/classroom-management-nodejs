import mongoose from "mongoose"

const UserSchema = new mongoose.Schema({
  username: { type: String, require: true },
  password: { type: String, require: true }
}, { versionKey: false });

export const User = mongoose.model("User", UserSchema);
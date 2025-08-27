import mongoose from "mongoose"

const UserSchema = new mongoose.Schema({
  username: { type: String, require: true },
  password: { type: String, require: true }
}, { versionKey: false });

const TokenSchema = new mongoose.Schema({
  refreshToken: { type: String, required: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, { versionKey: false });

export const User = mongoose.model("User", UserSchema);
export const Token = mongoose.model("Token", TokenSchema);
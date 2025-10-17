import {
  emailRegex,
  phoneNumberRegex,
  nameRegex,
  usernameRegex,
} from "@/app/utils/regex";
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      unique: true,
      match: [emailRegex, "Email is invalid"],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      unique: true,
      match: [usernameRegex, "Username is invalid"],
    },
    firstname: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      match: [nameRegex, "First name is invalid"],
    },
    lastname: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      match: [nameRegex, "Last name is invalid"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [phoneNumberRegex, "Phone number is invalid"],
      unique: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);

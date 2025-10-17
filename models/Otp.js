import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema(
  {
    identifier: {
      type: String,
      required: [true, "identifier is required"],
      trim: true,
    },
    code: {
      type: String,
      required: [true, "code is required"],
    },
    kind: {
      type: Number,
      required: [true, "kind is required"],
      default: 1,
      enum: [1, 2, 3, 4],
      comment: "1 for register, 2 for login ,3 for activate , 4 for edit",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    expiresAt: {
      type: Date,
      required: [true, "expiresAt is required"],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Otp || mongoose.model("Otp", OtpSchema);

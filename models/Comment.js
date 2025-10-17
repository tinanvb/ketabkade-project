import mongoose from "mongoose";
import moment from "moment-jalaali";

const CommentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    commentText: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    productName: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    type: {
      type: String,
      enum: ["product", "site"],
      default: "product",
    },
    approved: {
      type: Boolean,
      default: false,
    },
    reply: {
      type: String,
      default: null,
      trim: true,
    },
    createdAtJalali: {
      type: String,
      default: () => moment().format("jYYYY/jMM/jDD HH:mm:ss"),
      immutable: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Comment ||
  mongoose.model("Comment", CommentSchema);

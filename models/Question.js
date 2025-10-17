import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "سوال الزامی است"],
      trim: true,
    },
    answer: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
      min: [0, "ترتیب نمی‌تواند منفی باشد"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);
const Question =
  mongoose.models.Question || mongoose.model("Question", questionSchema);

export default Question;

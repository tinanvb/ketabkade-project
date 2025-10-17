import mongoose from "mongoose";

const productFileSchema = new mongoose.Schema(
  {
    fileUrl: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ["pdf", "zip", "docx", "jpg", "png", "mp3", "wav", "other"],
      default: "other",
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.ProductFile ||
  mongoose.model("ProductFile", productFileSchema);

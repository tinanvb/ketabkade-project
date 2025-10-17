import mongoose from "mongoose";

const menuSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    url: { type: String, required: true },
    type: {
      type: String,
      enum: ["internal", "external", "page"],
      required: true,
    },
    order: { type: Number, default: 0 },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Menu",
      default: null,
    },
    isActive: { type: Boolean, default: true },
    icon: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Menu || mongoose.model("Menu", menuSchema);

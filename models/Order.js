import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        discountedPrice: {
          type: Number,
          default: 0,
          min: [0, "قیمت تخفیفی نمی‌تواند منفی باشد"],
        },
      },
    ],
    discountPrice: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true },
    totalDiscountedPrice: {
      type: Number,
      default: 0,
      min: [0, "مجموع تخفیف‌های کالا نمی‌تواند منفی باشد"],
    },
    finalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "cancelled"],
      default: "pending",
    },
    trackingCode: { type: String },
    authority: { type: String },
    paymentMethod: {
      type: String,
      enum: ["gateway", "wallet"],
      default: "gateway",
    },
    isDownloadable: { type: Boolean, default: false },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);

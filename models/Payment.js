import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    transactionId: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
      validate: {
        validator: function (v) {
          return this.type === "productPayment" ? v.length > 0 : true;
        },
        message: "برای پرداخت محصول، حداقل یک محصول باید انتخاب شود",
      },
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "مبلغ پرداخت نمی‌تواند منفی باشد"],
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "cancelled"],
      default: "pending",
    },
    method: { type: String, enum: ["wallet", "zarinpal"], required: true },
    type: {
      type: String,
      enum: ["productPayment", "walletPayment"],
      default: "productPayment",
    },
    authority: { type: String },
    trackingCode: { type: String },
    paidAt: { type: Date },
    cardNumberMasked: {
      type: String,
      default: "",
      match: [/^(\*{4}-\*{4}-\*{4}-\d{4})?$/, "فرمت شماره کارت نامعتبر است"],
    },
    ipAddress: { type: String, default: "" },
    gatewayResponse: { type: String, default: "" },
    errorMessage: { type: String, default: "" },
  },
  { timestamps: true }
);

PaymentSchema.index({ user: 1, status: 1, createdAt: -1 });

export default mongoose.models.Payment ||
  mongoose.model("Payment", PaymentSchema);

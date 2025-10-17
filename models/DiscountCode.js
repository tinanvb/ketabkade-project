import mongoose from "mongoose";

const DiscountCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "وارد کردن کد تخفیف الزامی است"],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z0-9]+$/, "کد تخفیف فقط باید شامل حروف بزرگ انگلیسی و اعداد باشد"],
    },
    discountType: {
      type: String,
      enum: ["percent", "fixed"],
      required: [true, "نوع تخفیف الزامی است"],
    },
    discountAmount: {
      type: Number,
      required: [true, "مقدار تخفیف الزامی است"],
      min: [0, "مقدار تخفیف نمی‌تواند منفی باشد"],
    },
    expiryDate: {
      type: Date,
      required: [true, "تاریخ انقضا الزامی است"],
      validate: {
        validator: function (value) {
          return value >= new Date();
        },
        message: "تاریخ انقضا نمی‌تواند قبل از امروز باشد",
      },
    },
    status: {
      type: Boolean,
      default: true, // true یعنی فعال
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.DiscountCode ||
  mongoose.model("DiscountCode", DiscountCodeSchema);

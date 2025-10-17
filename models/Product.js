import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "نام محصول الزامی است"],
      trim: true,
      minlength: [3, "نام محصول باید حداقل ۳ حرف باشد"],
      maxlength: [50, "نام محصول نباید بیشتر از ۵۰ حرف باشد"],
    },
    author: {
      type: String,
      trim: true,
      minlength: [3, "نام نویسنده باید حداقل ۳ حرف باشد"],
      maxlength: [50, "نام نویسنده نباید بیشتر از ۵۰ حرف باشد"],
    },

    imageUrl: {
      type: String,
      required: [true, "آدرس تصویر محصول الزامی است"],
    },
    fileUrl: {
      type: String,
      required: [true, "آدرس فایل محصول الزامی است"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "توضیحات محصول الزامی است"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "دسته‌بندی محصول الزامی است"],
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
    fileType: {
      type: String,
      enum: {
        values: ["pdf", "zip", "mp3", "wav"],
        message: "نوع فایل فقط می‌تواند pdf، zip، mp3 یا wav باشد",
      },
      required: [true, "نوع فایل الزامی است"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    saleStatus: {
      type: Boolean,
      default: true,
    },
    price: {
      type: Number,
      default: 0,
      min: [0, "قیمت نمی‌تواند منفی باشد"],
    },
    discountedPrice: {
      type: Number,
      default: 0,
      min: [0, "قیمت تخفیفی نمی‌تواند منفی باشد"],
      validate: {
        validator: function (value) {
          return value == null || value === 0 || value <= this.price;
        },
        message:
          "قیمت تخفیفی نباید بیشتر از قیمت اصلی باشد (مگر اینکه صفر باشد)",
      },
    },

  },
  { timestamps: true }
);

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);

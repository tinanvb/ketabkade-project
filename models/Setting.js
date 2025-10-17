import mongoose from "mongoose";

const socialSchema = new mongoose.Schema({
  instagram: { type: String, default: "" },
  telegram: { type: String, default: "" },
  whatsapp: { type: String, default: "" },
});

const contactInfoSchema = new mongoose.Schema({
  phone: { type: String, default: "" },
  email: { type: String, default: "" },
  address: { type: String, default: "" },
});

const paymentMethodsSchema = new mongoose.Schema({
  gateway: { type: Boolean, default: true },
  wallet: { type: Boolean, default: false },
  bank: { type: Boolean, default: false },
});

const settingSchema = new mongoose.Schema(
  {
    logo: { type: String, default: "" },
    siteTitle: { type: String, default: "سایت من" },

    // اطلاعات تماس
    contactInfo: { type: contactInfoSchema, default: () => ({}) },

    // شبکه‌های اجتماعی
    social: { type: socialSchema, default: () => ({}) },

    // روش‌های پرداخت
    paymentMethods: { type: paymentMethodsSchema, default: () => ({}) },

    // متون و اطلاعات سایت
    about: { type: String, default: "" },
    rules: { type: String, default: "" },
    privacy: { type: String, default: "" },
    shoppingGuide: { type: String, default: "" },
    employ: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Setting ||
  mongoose.model("Setting", settingSchema);

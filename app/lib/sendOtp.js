import connectToDatabase from "@/app/lib/db";
import Otp from "@/models/Otp";
import crypto from "crypto";
import { hashOtp } from "../utils/hashOtp";
import User from "../../models/User";
import { sendSms } from "./melipayamak";
import { emailRegex, phoneNumberRegex } from "../utils/regex";
import emailServices from "./emailService";

const otpRequests = new Map();

export default async function sendOtp(
  identifier,
  field = "",
  type,
  currentUserId = null
) {
  try {
    await connectToDatabase();

    if (!identifier || typeof identifier !== "string") {
      return { success: false, message: "شناسه وارد نشده است." };
    }

    const isPhone = phoneNumberRegex.test(identifier);
    const isEmail = emailRegex.test(identifier);
    const queryField = isPhone ? "phoneNumber" : isEmail ? "email" : null;

    if (!queryField) {
      return { success: false, message: "شناسه معتبر نیست." };
    }

    const kindMap = {
      register: 1,
      login: 2,
      activate: 3,
      editProfile: 4,
    };
    const kind = kindMap[type] ?? 0;

    const now = Date.now();
    const lastSent = otpRequests.get(identifier);
    if (lastSent && now - lastSent < 120 * 1000) {
      return {
        success: false,
        message: "لطفاً کمی صبر کنید و دوباره تلاش کنید.",
      };
    }

    let user = null;
    let exist = null;

    switch (type) {
      case "register":
        user = await User.findOne({ [queryField]: identifier });
        if (!user) {
          return {
            success: false,
            message: "کاربری با این اطلاعات وجود ندارد.",
          };
        }
        break;

      case "login":
      case "activate":
        user = await User.findOne({ [queryField]: identifier });
        break;

      case "editProfile":
        if (!["email", "phoneNumber"].includes(field)) {
          return { success: false, message: "فیلد نامعتبر است." };
        }

        if (!currentUserId) {
          return { success: false, message: "احراز هویت نشده‌اید." };
        }
        exist = await User.findOne({ [field]: identifier });
        if (exist) {
          return {
            success: false,
            message: `${
              field === "email" ? "ایمیل" : "شماره موبایل"
            } قبلاً ثبت شده است.`,
          };
        }
        // کاربر فعلی را با مقدار قدیمی از سشن پیدا کن
        user = await User.findOne({ _id: currentUserId });
        if (!user) {
          return { success: false, message: "کاربر فعلی یافت نشد." };
        }

        break;

      default:
        return { success: false, message: "نوع درخواست معتبر نیست." };
    }

    // Update last sent time
    otpRequests.set(identifier, now);

    const otpCode = crypto.randomInt(100000, 999999).toString();
    const hashedOtp = hashOtp(otpCode);
    const expiresAt = new Date(now + 10 * 60 * 1000);

    await Otp.findOneAndUpdate(
      { identifier, kind },
      {
        identifier,
        kind,
        code: hashedOtp,
        userId: user?._id || null,
        expiresAt,
      },
      { upsert: true, new: true }
    );

    // Message
    let smsMessage = `کد تایید شما: ${otpCode}`;
    switch (type) {
      case "register":
        smsMessage = `کد ثبت‌نام شما: ${otpCode}`;
        break;
      case "login":
        smsMessage = `کد ورود شما: ${otpCode}`;
        break;
      case "activate":
        smsMessage = `کد فعال‌سازی حساب: ${otpCode}`;
        break;
      case "editProfile":
        smsMessage = `کد تایید برای ویرایش اطلاعات: ${otpCode}`;
        break;
    }

    if (isPhone) {
      await sendSms(identifier, smsMessage);
      console.log(`📲 OTP sent to ${identifier}: ${otpCode}`);
    } else if (isEmail) {
      await emailServices(identifier, smsMessage);
      console.log(`📧 OTP sent to ${identifier}: ${otpCode}`);
    }

    return { success: true, message: "کد تایید برای شما ارسال شد." };
  } catch (err) {
    console.error("❌ Error in sendOtp:", err);
    return { success: false, message: "خطایی رخ داده است." };
  }
}

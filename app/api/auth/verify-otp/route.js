import connectToDatabase from "@/app/lib/db";
import { emailRegex, otpRegex, phoneNumberRegex } from "@/app/utils/regex";
import Otp from "@/models/Otp";
import User from "@/models/User";
import { hashOtp } from "@/app/utils/hashOtp";

export async function POST(request) {
  await connectToDatabase();

  try {
    const {
      identifier = "",
      otpCode = "",
      type = "",
      field,
    } = await request.json();
    const kindMap = {
      register: 1,
      login: 2,
      activate: 3,
      editProfile: 4,
    };
    const kind = kindMap[type] ?? 0;

    const trimmedIdentifier = identifier.trim();
    const trimmedOtp = otpCode.trim();
    const trimmedType = type.trim();

    if (!trimmedIdentifier || !trimmedOtp || !trimmedType) {
      return Response.json({ message: "اطلاعات ناقص است" }, { status: 400 });
    }

    const isPhone = phoneNumberRegex.test(trimmedIdentifier);
    const isEmail = emailRegex.test(trimmedIdentifier);
    const queryField = isPhone ? "phoneNumber" : isEmail ? "email" : null;

    if (!queryField) {
      return Response.json({ message: "شناسه نامعتبر است" }, { status: 400 });
    }

    const validTypes = ["register", "login", "activate", "editProfile"];
    if (!validTypes.includes(trimmedType)) {
      return Response.json(
        { message: "نوع درخواست نامعتبر است" },
        { status: 400 }
      );
    }

    if (!otpRegex.test(trimmedOtp)) {
      return Response.json(
        { message: "کد وارد شده نامعتبر است" },
        { status: 400 }
      );
    }

    if (trimmedType === "editProfile") {
      if (!field || !["email", "phoneNumber"].includes(field)) {
        return Response.json(
          { message: "فیلد تغییر نامعتبر است" },
          { status: 400 }
        );
      }
    }

    const hashedOtp = hashOtp(trimmedOtp);

    const otp = await Otp.findOne({
      identifier: trimmedIdentifier,
      code: hashedOtp,
      kind: kind,
    });

    if (!otp || otp.expiresAt < new Date()) {
      return Response.json(
        { message: "کد وارد شده نامعتبر یا منقضی شده است." },
        { status: 400 }
      );
    }

    let user;

    if (["register", "activate"].includes(trimmedType)) {
      user = await User.findOneAndUpdate(
        { [queryField]: trimmedIdentifier },
        { isActive: true },
        { new: true }
      );
    } else if (trimmedType === "login") {
      user = await User.findOne({ [queryField]: trimmedIdentifier });
    } else if (trimmedType === "editProfile") {
      const exists = await User.findOne({ [queryField]: trimmedIdentifier });
      if (exists) {
        return Response.json(
          {
            message: `${
              field === "email" ? "ایمیل" : "شماره موبایل"
            } قبلاً ثبت شده است.`,
          },
          { status: 409 }
        );
      }

      user = await User.findOneAndUpdate(
        { _id: otp.userId },
        { [field]: trimmedIdentifier },
        { new: true }
      );
    }

    if (!user) {
      return Response.json({ message: "کاربر یافت نشد" }, { status: 404 });
    }

    // await Otp.deleteOne({ _id: otp._id });

    return Response.json({ message: "کد تایید شد." }, { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ message: "خطا در تایید کد" }), {
      status: 500,
    });
  }
}

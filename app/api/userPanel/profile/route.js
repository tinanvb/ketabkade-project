import connectToDatabase from "@/app/lib/db";
import User from "@/models/User";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { emailRegex, nameRegex, phoneNumberRegex } from "@/app/utils/regex";

function isInvalidId(id) {
  return !mongoose.Types.ObjectId.isValid(id);
}

export async function GET(request, { params }) {
  await connectToDatabase();

  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const userId = session.user.id;
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return new Response(
        JSON.stringify({ message: "کاربر مورد نظر پیدا نشد" }),
        { status: 404 }
      );
    }
    return new Response(JSON.stringify(user), { status: 200 });
  } catch (err) {
    console.error("Error in GET /api/userPanel/profile:", err);
    return new Response(JSON.stringify({ message: err.message }), {
      status: 500,
    });
  }
}

export async function PUT(request) {
  await connectToDatabase();

  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const userId = session.user.id;
    const { field, value, isOtpVerified = false } = await request.json();

    // بررسی اینکه فیلد ارسالی مجاز است یا خیر
    const allowedFields = ["firstname", "lastname", "email", "phoneNumber"];
    if (!allowedFields.includes(field)) {
      return new Response(
        JSON.stringify({ message: "فیلد ارسالی مجاز نیست." }),
        { status: 400 }
      );
    }

    // بررسی مقدار خالی یا نامعتبر
    if (!value || typeof value !== "string" || value.trim() === "") {
      return new Response(
        JSON.stringify({ message: "مقدار ارسالی نامعتبر است." }),
        { status: 400 }
      );
    }

    const trimmedValue = value.trim();

    // اعتبارسنجی خاص برای هر فیلد با استفاده از regex
    if (field === "email" && !emailRegex.test(trimmedValue)) {
      return new Response(
        JSON.stringify({
          message: "ایمیل باید معتبر باشد. مثل example@mail.com",
        }),
        { status: 400 }
      );
    }

    if (field === "phoneNumber" && !phoneNumberRegex.test(trimmedValue)) {
      return new Response(
        JSON.stringify({
          message: "شماره موبایل باید با 09 شروع شود و 11 رقم باشد.",
        }),
        { status: 400 }
      );
    }

    if (field === "firstname" && !nameRegex.test(trimmedValue)) {
      return new Response(
        JSON.stringify({
          message:
            "نام باید فقط شامل حروف فارسی باشد و حداقل ۲ حرف داشته باشد.",
        }),
        { status: 400 }
      );
    }

    if (field === "lastname" && !nameRegex.test(trimmedValue)) {
      return new Response(
        JSON.stringify({
          message:
            "نام خانوادگی باید فقط شامل حروف فارسی باشد و حداقل ۲ حرف داشته باشد.",
        }),
        { status: 400 }
      );
    }

    // پیدا کردن کاربر
    const user = await User.findById(userId).select(field);
    if (!user) {
      return new Response(JSON.stringify({ message: "کاربر یافت نشد." }), {
        status: 404,
      });
    }

    // لاگ برای دیباگ
    console.log("Comparing values:", {
      field,
      current: user[field],
      new: trimmedValue,
      equal: user[field] === trimmedValue,
      isOtpVerified,
    });

    // اگه OTP تأیید شده و مقدار جدید با فعلی برابر بود، خطا نده
    if (user[field] === trimmedValue && isOtpVerified) {
      console.log("Value already updated by verify-otp, returning success");
      return new Response(
        JSON.stringify({ message: "با موفقیت ذخیره شد.", user }),
        { status: 200 }
      );
    }

    // بررسی تغییر نکردن مقدار (برای درخواست‌های بدون OTP)
    if (user[field] === trimmedValue && !isOtpVerified) {
      return new Response(
        JSON.stringify({ message: "مقدار جدید با مقدار فعلی یکسان است." }),
        { status: 400 }
      );
    }

    // بررسی منحصربه‌فرد بودن ایمیل و شماره موبایل
    if (field === "email" || field === "phoneNumber") {
      const existingUser = await User.findOne({ [field]: trimmedValue });
      if (existingUser && existingUser._id.toString() !== userId) {
        return new Response(
          JSON.stringify({
            message: `${
              field === "email" ? "ایمیل" : "شماره موبایل"
            } قبلاً ثبت شده است.`,
          }),
          { status: 409 }
        );
      }
    }

    // آپدیت سند
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { [field]: trimmedValue },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return new Response(JSON.stringify({ message: "خطا در آپدیت کاربر" }), {
        status: 500,
      });
    }

    console.log("User updated:", updatedUser);

    return new Response(
      JSON.stringify({ message: "با موفقیت ذخیره شد.", user: updatedUser }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in PUT /api/userPanel/profile:", error);
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
    });
  }
}
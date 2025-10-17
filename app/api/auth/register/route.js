import connectToDatabase from "@/app/lib/db";
import {
  emailRegex,
  nameRegex,
  passwordRegex,
  phoneNumberRegex,
  usernameRegex,
} from "@/app/utils/regex";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import sendOtp from "@/app/lib/sendOtp";

export async function POST(request) {
  await connectToDatabase();

  try {
    const { email, phoneNumber, username, firstname, lastname, password } =
      await request.json();

    // اعتبارسنجی (validation)
    if (!phoneNumber.trim() || !phoneNumberRegex.test(phoneNumber.trim())) {
      return Response.json(
        { success: false, message: "شماره موبایل وارد شده معتبر نیست." },
        { status: 400 }
      );
    }

    if (!email.trim() || !emailRegex.test(email.trim())) {
      return Response.json(
        { success: false, message: "ایمیل وارد شده معتبر نیست." },
        { status: 400 }
      );
    }

    if (!username.trim() || !usernameRegex.test(username.trim())) {
      return Response.json(
        {
          success: false,
          message:
            "نام کاربری باید بین ۳ تا ۲۰ کاراکتر و فقط شامل حروف انگلیسی، عدد و آندرلاین (_) باشد.",
        },
        { status: 400 }
      );
    }

    if (!firstname.trim() || !nameRegex.test(firstname.trim())) {
      return Response.json(
        {
          success: false,
          message:
            "نام باید فقط شامل حروف فارسی باشد و حداقل ۲ حرف داشته باشد.",
        },
        { status: 400 }
      );
    }

    if (!lastname.trim() || !nameRegex.test(lastname.trim())) {
      return Response.json(
        {
          success: false,
          message:
            "نام خانوادگی باید فقط شامل حروف فارسی باشد و حداقل ۲ حرف داشته باشد.",
        },
        { status: 400 }
      );
    }

    if (!password.trim() || !passwordRegex.test(password.trim())) {
      return Response.json(
        {
          success: false,
          message:
            "رمز عبور باید حداقل ۸ کاراکتر، شامل حروف، عدد و یک کاراکتر خاص مانند !@#$ باشد.",
        },
        { status: 400 }
      );
    }

    // بررسی تکراری بودن
    const [existingEmail, existingPhone, existingUsername] = await Promise.all([
      User.findOne({ email }),
      User.findOne({ phoneNumber }),
      User.findOne({ username }),
    ]);

    if (existingEmail) {
      return Response.json(
        { success: false, message: "این ایمیل قبلاً ثبت شده است." },
        { status: 400 }
      );
    }

    if (existingPhone) {
      return Response.json(
        { success: false, message: "این شماره موبایل قبلاً ثبت شده است." },
        { status: 400 }
      );
    }

    if (existingUsername) {
      return Response.json(
        { success: false, message: "این نام کاربری قبلاً ثبت شده است." },
        { status: 400 }
      );
    }

    // ساخت کاربر جدید
    const hashedPassword = await bcrypt.hash(password, 5);
    const newUser = new User({
      email,
      phoneNumber,
      username,
      firstname,
      lastname,
      password: hashedPassword,
    });
    await newUser.save();

    // ارسال کد تایید
    await sendOtp(phoneNumber, "phoneNumber", "register");

    return Response.json(
      { success: true, message: "ثبت نام با موفقیت انجام شد." },
      { status: 201 }
    );
  } catch (err) {
    return Response.json(
      { success: false, message: "خطا در ثبت نام. لطفاً دوباره تلاش کنید." },
      { status: 500 }
    );
  }
}

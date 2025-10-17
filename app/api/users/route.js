import connectToDatabase from "@/app/lib/db";
import { emailRegex, phoneNumberRegex } from "@/app/utils/regex";
import User from "@/models/User";

export async function GET(request) {
  await connectToDatabase();
  const users = await User.find({}, "-password"); // حذف فیلد رمز عبور
  return new Response(JSON.stringify(users), { status: 200 });
}

export async function POST(request) {
  await connectToDatabase();
  try {
    const body = await request.json();
    const {
      firstname,
      lastname,
      username,
      phoneNumber,
      email,
      password,
      role = "user",
    } = body;

    // اعتبارسنجی اولیه
    if (!firstname || firstname.length < 2)
      return new Response(
        JSON.stringify({ message: "نام باید حداقل ۲ کاراکتر باشد" }),
        { status: 400 }
      );

    if (!lastname || lastname.length < 2)
      return new Response(
        JSON.stringify({ message: "نام خانوادگی باید حداقل ۲ کاراکتر باشد" }),
        { status: 400 }
      );

    if (!phoneNumber || !phoneNumberRegex.test(phoneNumber))
      return new Response(
        JSON.stringify({ message: "شماره موبایل باید ۱۱ رقمی باشد" }),
        { status: 400 }
      );

    if (!password || password.length < 6)
      return new Response(
        JSON.stringify({ message: "رمز عبور باید حداقل ۶ کاراکتر باشد" }),
        { status: 400 }
      );

    if (email && !emailRegex.test(email))
      return new Response(
        JSON.stringify({ message: "ایمیل معتبر نمی‌باشد" }),
        { status: 400 }
      );

    if (!["user", "admin"].includes(role))
      return new Response(
        JSON.stringify({ message: "نقش کاربر نامعتبر است" }),
        { status: 400 }
      );

    // بررسی یکتا بودن ایمیل و شماره
    const existingUser = await User.findOne({
      $or: [
        { email: email || null },
        { phoneNumber },
      ],
    });

    if (existingUser) {
      return new Response(
        JSON.stringify({ message: "ایمیل یا شماره موبایل تکراری است" }),
        { status: 409 }
      );
    }

    const newUser = await User.create({
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      username:username.trim(),
      phoneNumber: phoneNumber.trim(),
      email: email?.trim() || null,
      password,
      role,
    });

    // حذف پسورد از خروجی
    const userObj = newUser.toObject();
    delete userObj.password;

    return new Response(JSON.stringify(userObj), { status: 201 });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "خطای سرور: " + error.message }),
      { status: 500 }
    );
  }
}

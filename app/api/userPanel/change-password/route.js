import connectToDatabase from "@/app/lib/db";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { passwordRegex } from "@/app/utils/regex";
import bcrypt from "bcryptjs";

export async function PUT(request) {
  await connectToDatabase();

  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const { currentPassword, newPassword } = await request.json();

    // اعتبارسنجی رمز عبورها
    if (
      !passwordRegex.test(currentPassword) ||
      !passwordRegex.test(newPassword)
    ) {
      return new Response(
        JSON.stringify({
          message:
            "رمز عبورها معتبر نیستند. باید حداقل ۸ کاراکتر و شامل حرف، عدد و کاراکتر خاص باشند.",
        }),
        { status: 400 }
      );
    }
    if (currentPassword === newPassword) {
      return new Response(
        JSON.stringify({ message: "رمز جدید نباید با رمز قبلی یکسان باشد." }),
        {
          status: 400,
        }
      );
    }
    const user = await User.findById(session.user.id);
    if (!user) {
      return new Response(JSON.stringify({ message: "کاربر یافت نشد." }), {
        status: 404,
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return new Response(
        JSON.stringify({ message: "رمز عبور فعلی نادرست است" }),
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return new Response(
      JSON.stringify({ message: "رمز عبور با موفقیت تغییر یافت" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("خطا در تغییر رمز عبور:", error);
    return new Response(JSON.stringify({ message: "خطایی در سرور رخ داد" }), {
      status: 500,
    });
  }
}

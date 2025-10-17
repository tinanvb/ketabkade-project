import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import sendOtp from "@/app/lib/sendOtp";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    // در صورت نیاز به احراز هویت (مثلا ویرایش پروفایل)
    // یا اجازه بده بدون سشن ادامه دهد (مثلا ثبت نام یا ورود با OTP)
  }

  const { identifier, field, type } = await request.json();

  let currentUserId = null;
  if (session && session.user) {
    currentUserId = session.user.id;
  }
  const result = await sendOtp(identifier, field, type, currentUserId);

  return new Response(JSON.stringify(result), {
    status: result.success ? 200 : 400,
  });
}

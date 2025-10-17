import connectToDatabase from "@/app/lib/db";
import User from "@/models/User";
import { emailRegex, phoneNumberRegex } from "@/app/utils/regex";

export async function POST(request) {
  const { identifier } = await request.json();
  if (
    !identifier ||
    (!emailRegex.test(identifier) && !phoneNumberRegex.test(identifier))
  ) {
    return new Response(JSON.stringify({ error: "شناسه نامعتبر است" }), {
      status: 400,
    });
  }

  await connectToDatabase();
  try {
    let user = null;

    if (emailRegex.test(identifier)) {
      user = await User.findOne({ email: identifier });
    } else if (phoneNumberRegex.test(identifier)) {
      user = await User.findOne({ phoneNumber: identifier });
    }

    if (!user) {
      return new Response(
        JSON.stringify({ exists: true, phoneNumber: null, isActive: false }),
        { status: 200 }
      );
    }

    return new Response(
      JSON.stringify({
        exists: true,
        phoneNumber: user.phoneNumber,
        isActive: user.isActive,
      }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: "خطا در اتصال به سرور" }), {
      status: 500,
    });
  }
}

import connectToDatabase from "@/app/lib/db";
import { tagNameRegex } from "@/app/utils/regex";
import Tag from "@/models/Tag";

export async function GET(request) {
  await connectToDatabase();
  const tags = await Tag.find({});
  return new Response(JSON.stringify(tags), { status: 200 });
}
export async function POST(request) {
  await connectToDatabase();
  try {
    const body = await request.json();
    if (
      !body.name ||
      typeof body.name !== "string" ||
      body.name.trim() === ""
    ) {
      return new Response(
        JSON.stringify({ message: "نام برچسب الزامی میباشد" }),
        { status: 400 }
      );
    }
    if (!tagNameRegex.test(body.name)) {
      return new Response(
        JSON.stringify({
          message: "نام برچسب باید بین ۳ تا ۱۰۰ کاراکتر باشد",
        }),
        { status: 400 }
      );
    }
    if (typeof body.isActive !== "boolean") {
      return new Response(
        JSON.stringify({
          message: " وضعیت باید true یا false باشد ",
        }),
        { status: 400 }
      );
    }

    // بررسی تکراری بودن نام برچسب
    const existingTag = await Tag.findOne({ name: body.name.trim() });
    if (existingTag) {
      return new Response(
        JSON.stringify({ message: "این نام برچسب قبلاً ثبت شده است" }),
        { status: 400 }
      );
    }

    // ایجاد برچسب جدید
    const tag = await Tag.create({
      name: body.name.trim(),
      isActive: body.isActive,
    });
    return new Response(JSON.stringify(tag), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "خطای سرور: " + error.message }),
      { status: 500 }
    );
  }
}

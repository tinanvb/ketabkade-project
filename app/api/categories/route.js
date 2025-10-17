import connectToDatabase from "@/app/lib/db";
import { categoriesNameRegex } from "@/app/utils/regex";
import Category from "@/models/Category";

//  دریافت تمام دسته‌بندی‌ها
export async function GET(request) {
  await connectToDatabase();
  const categories = await Category.find({}).sort({ name: 1 });
  return new Response(JSON.stringify(categories), { status: 200 });
}

//  ایجاد دسته‌بندی جدید
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
        JSON.stringify({ message: "نام دسته بندی الزامی میباشد" }),
        {
          status: 400,
        }
      );
    }
    if (!categoriesNameRegex.test(body.name.trim())) {
      return new Response(
        JSON.stringify({
          message: "نام دسته بندی باید بین ۳ تا ۳۰ کاراکتر باشد",
        }),
        {
          status: 400,
        }
      );
    }
    const existingCategory = await Category.findOne({ name: body.name.trim() });
    if (existingCategory) {
      return new Response(
        JSON.stringify({ message: "این نام دسته بندی قبلاً ثبت شده است" }),
        { status: 400 }
      );
    }
    if (typeof body.isActive !== "boolean") {
      return new Response(
        JSON.stringify({
          message: " وضعیت باید true یا false باشد ",
        }),
        {
          status: 400,
        }
      );
    }
    
    const category = await Category.create(body);
    return new Response(JSON.stringify(category), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
    });
  }
}

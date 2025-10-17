import connectToDatabase from "@/app/lib/db";
import { categoriesNameRegex } from "@/app/utils/regex";
import Category from "@/models/Category";

// دریافت یک دسته‌بندی بر اساس شناسه
export async function GET(request, { params }) {
  await connectToDatabase();
  const { id } = await params;
  try {
    const category = await Category.findById(id);
    if (!category) {
      return new Response(
        JSON.stringify({ message: "دسته بندی مورد نظر پیدا نشد" }),
        {
          status: 404,
        }
      );
    }
    return new Response(JSON.stringify(category), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
    });
  }
}
// به‌روزرسانی دسته‌بندی بر اساس شناسه
export async function PUT(request, { params }) {
  await connectToDatabase();
  try {
    const { id } = await params;
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
    // اعمال تغییرات و بازگرداندن نسخه جدید
    const category = await Category.findByIdAndUpdate(id, body, {
      new: true,
    });
    return new Response(JSON.stringify(category), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
    });
  }
}
// حذف یک دسته‌بندی بر اساس شناسه
export async function DELETE(request, { params }) {
  await connectToDatabase();
  try {
    const { id } = await params;
    await Category.findByIdAndDelete(id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
    });
  }
}

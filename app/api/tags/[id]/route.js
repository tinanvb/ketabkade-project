import connectToDatabase from "@/app/lib/db";
import { tagNameRegex } from "@/app/utils/regex";
import Tag from "@/models/Tag";
// دریافت یک برچسب خاص بر اساس شناسه
export async function GET(request, { params }) {
  await connectToDatabase();
  const { id } = await params;
  try {
    const tag = await Tag.findById(id);
    if (!tag) {
      return new Response(
        JSON.stringify({ message: "برچسب مورد نظر پیدا نشد" }),
        {
          status: 404,
        }
      );
    }
    return new Response(JSON.stringify(tag), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
    }); 
  }
}
// ویرایش یک برچسب بر اساس شناسه
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
        JSON.stringify({ message: "نام برچسب الزامی میباشد" }),
        {
          status: 400,
        }
      );
    }
    if (!tagNameRegex.test(body.name)) {
      return new Response(
        JSON.stringify({
          message: "نام برچسب باید بین ۳ تا ۱۰۰ کاراکتر باشد",
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
    const tag = await Tag.findByIdAndUpdate(id, body, {
      new: true,
    });
    return new Response(JSON.stringify(tag), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
    });
  }
}
// حذف یک برچسب بر اساس شناسه
export async function DELETE(request, { params }) {
  await connectToDatabase();
  try {
    const { id } = await params;
    await Tag.findByIdAndDelete(id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
    });
  }
}

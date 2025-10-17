import connectToDatabase from "@/app/lib/db";
import User from "@/models/User";
import mongoose from "mongoose";
// تغییر نقش کاربر (PATCH)
export async function PATCH(request, { params }) {
  await connectToDatabase();

  const { id } = await params;
  if (!id) {
    return new Response(JSON.stringify({ message: "شناسه نامعتبر است" }), {
      status: 400,
    });
  }

  try {
    const { role } = await request.json();

    if (!["user", "admin"].includes(role)) {
      return new Response(JSON.stringify({ message: "نقش نامعتبر است" }), {
        status: 400,
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return new Response(JSON.stringify({ message: "کاربر پیدا نشد" }), {
        status: 404,
      });
    }
    // به‌روزرسانی نقش و ذخیره
    user.role = role;
    await user.save();
    // حذف رمز عبور از پاسخ
    const userObj = user.toObject();
    delete userObj.password;

    return new Response(JSON.stringify(userObj), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
    });
  }
}
// حذف کاربر (DELETE)
export async function DELETE(request, { params }) {
  await connectToDatabase();
  const { id } = await params;

  if (!id) {
    return new Response(JSON.stringify({ message: "شناسه نامعتبر است" }), {
      status: 400,
    });
  }

  try {
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return new Response(JSON.stringify({ message: "کاربر یافت نشد" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({ message: "کاربر با موفقیت حذف شد" }), {
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "خطای سرور: " + error.message }),
      { status: 500 }
    );
  }
}

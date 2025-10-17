import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/app/lib/db";
import User from "@/models/User";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("avatar");

  if (!file || !file.name || !file.type.startsWith("image/")) {
    return new Response(JSON.stringify({ message: "فایل معتبر نیست" }), { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = path.extname(file.name); // مثل: .png یا .jpg
  const fileName = uuidv4() + ext;
  const uploadDir = path.join(process.cwd(), "public/uploads/avatars");

  try {
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    await connectToDatabase();

    // یافتن کاربر و مسیر عکس قبلی
    const user = await User.findById(session.user.id);
    const previousAvatar = user.avatar;

    // بروزرسانی کاربر با عکس جدید
    user.avatar = `/uploads/avatars/${fileName}`;
    await user.save();

    // حذف عکس قبلی (اگر قبلاً عکس آپلود کرده باشد)
    if (previousAvatar) {
      const previousPath = path.join(process.cwd(), "public", previousAvatar);
      try {
        await unlink(previousPath);
      } catch (err) {
        console.warn("خطا در حذف عکس قبلی:", err.message);
      }
    }

    return new Response(JSON.stringify({ avatar: user.avatar }), {
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "خطا در ذخیره عکس", error: error.message }),
      { status: 500 }
    );
  }
}
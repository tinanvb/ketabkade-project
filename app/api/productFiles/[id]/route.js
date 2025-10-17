import connectToDatabase from "@/app/lib/db";
import Product from "@/models/Product";
import ProductFile from "@/models/ProductFile";
import mongoose from "mongoose";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// دریافت فایل محصول با شناسه
export async function GET(request, { params }) {
  await connectToDatabase();
  const { id } = await params;

  try {
    const fileItem = await ProductFile.findById(id);
    if (!fileItem) {
      return new Response(JSON.stringify({ message: "فایل محصول پیدا نشد" }), {
        status: 404,
      });
    }
    return new Response(JSON.stringify(fileItem), { status: 200 });
  } catch (error) {
    console.error("GET ProductFile Error:", error);
    return new Response(
      JSON.stringify({ message: "خطا در دریافت فایل محصول" }),
      { status: 500 }
    );
  }
}

// بروزرسانی فایل محصول (و امکان تنظیم به‌عنوان فایل اصلی محصول)
export async function PUT(request, { params }) {
  const { id } =await params;
  if (!id) {
    return new Response(JSON.stringify({ message: "شناسه فایل معتبر نیست" }), {
      status: 400,
    });
  }

  try {
    await connectToDatabase();
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return new Response(JSON.stringify({ message: "فایل الزامی است" }), {
        status: 400,
      });
    }

    // ذخیره فایل جدید
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadDir = join(process.cwd(), "public/uploads");
    const filePath = join(uploadDir, file.name);
    await writeFile(filePath, buffer);
    if (existsSync(filePath)) {
      return new Response(JSON.stringify({
        message: "فایلی با این نام وجود دارد",
      }), { status: 409 });
    }

    const newFileUrl = `/uploads/${file.name}`;
    const fileItem = await ProductFile.findById(id);
    if (!fileItem) {
      return new Response(JSON.stringify({ message: "فایل یافت نشد" }), {
        status: 404,
      });
    }

    // حذف فایل قبلی از فایل سیستم
    const oldFilePath = join(process.cwd(), "public", fileItem.fileUrl);
    await unlink(oldFilePath).catch(() => console.log("فایل قبلی حذف نشد"));

    // بروزرسانی مسیر فایل
    fileItem.fileUrl = newFileUrl;
    fileItem.fileType = file.name.split(".").pop().toLowerCase();
    await fileItem.save();

    return new Response(JSON.stringify(fileItem), { status: 200 });
  } catch (err) {
    console.error("خطا در بروزرسانی فایل محصول:", err);
    return new Response(JSON.stringify({ message: "خطای داخلی سرور" }), {
      status: 500,
    });
  }
}

// حذف فایل محصول از دیتابیس و فایل سیستم
export async function DELETE(request, { params }) {
  const { id } = await params;

  try {
    await connectToDatabase();
    const fileItem = await ProductFile.findByIdAndDelete(id);

    if (!fileItem) {
      return new Response(JSON.stringify({ message: "فایل پیدا نشد" }), {
        status: 404,
      });
    }

    // حذف فایل از مسیر public/uploads
    const filePath = join(process.cwd(), "public", fileItem.fileUrl);
    await unlink(filePath).catch(() =>
      console.log("فایل پیدا نشد یا قبلاً حذف شده")
    );

    return new Response(JSON.stringify({ message: "با موفقیت حذف شد" }), {
      status: 200,
    });
  } catch (err) {
    console.error("DELETE ProductFile Error:", err);
    return new Response(JSON.stringify({ message: err.message }), {
      status: 500,
    });
  }
}

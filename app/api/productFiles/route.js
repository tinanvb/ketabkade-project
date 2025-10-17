import connectToDatabase from "@/app/lib/db";
import { NextResponse } from "next/server";
import { join } from "path";
import { writeFile } from "fs/promises";
import ProductFile from "@/models/ProductFile";
import mongoose from "mongoose";


// دریافت فایل‌های مربوط به یک محصول 
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ message: "شناسه محصول الزامی است" }, { status: 400 });
  }
  try {
    await connectToDatabase();
    const files = await ProductFile.find({ product: productId }).select("fileUrl fileType");
    return NextResponse.json(files, { status: 200 });
  } catch (error) {
    console.error("GET ProductFiles Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// افزودن فایل
export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get("file");       
    const productId = data.get("productId");

    if (!file || !productId) {
      return NextResponse.json(
        { success: false, message: "فایل و شناسه محصول الزامی است" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadDir = join(process.cwd(), "public/uploads");
    const filePath = join(uploadDir, file.name);

    const fileUrl = `/uploads/${file.name.toLowerCase()}`;

    await writeFile(filePath, buffer);
    await connectToDatabase();

    // چک فایل تکراری برای محصول
    const existingFile = await ProductFile.findOne({
      product: productId,
      fileUrl: fileUrl,
    });

    if (existingFile) {
      return NextResponse.json(
        { success: false, message: "این فایل قبلاً ثبت شده است" },
        { status: 409 }
      );
    }

    const newFile = await ProductFile.create({
      product: productId, 
      fileUrl,
      fileType: file.name.split(".").pop().toLowerCase(),
    });

    return NextResponse.json(newFile, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

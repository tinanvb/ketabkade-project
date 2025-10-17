import connectToDatabase from "@/app/lib/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";
import { join } from "path";
import { writeFile } from "fs/promises";
import { existsSync } from "fs";
import mongoose from "mongoose";
import "@/models/Tag";
import "@/models/Category";

// دریافت لیست تمام محصولات با اطلاعات مرتبط (دسته‌بندی و تگ‌ها)
export async function GET(request) {
  try {
    await connectToDatabase();
    const products = await Product.find({});
    return new Response(JSON.stringify(products), {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("خطا در دریافت محصولات:", error);
    return new Response(JSON.stringify({ message: "خطا در دریافت محصولات" }), {
      status: 500,
    });
  }
}
// ایجاد محصول جدید با آپلود فایل و اعتبارسنجی مقادیر
export async function POST(request) {
  try {
    const data = await request.formData();
    const name = data.get("name");
    const image = data.get("image");
    const file = data.get("file");
    const description = data.get("description");
    const price = parseFloat(data.get("price"));
    const category = data.get("category");
    const fileType = data.get("fileType");
    const saleStatus = data.get("saleStatus") === "true";
    const isActive = data.get("isActive") === "true";
    const discountedPrice = parseFloat(data.get("discountedPrice")) || 0;
    const author = data.get("author");

    if (discountedPrice < 0 || discountedPrice > price) {
      return new Response(
        JSON.stringify({
          message: "قیمت تخفیفی باید عددی مثبت و کمتر از قیمت اصلی باشد",
        }),
        { status: 400 }
      );
    }

    let tagsRaw = data.getAll("tags");
    if (!Array.isArray(tagsRaw)) {
      tagsRaw = tagsRaw ? [tagsRaw] : [];
    }

    const tags = tagsRaw
      .map((tagId) =>
        mongoose.Types.ObjectId.isValid(tagId)
          ? new mongoose.Types.ObjectId(tagId)
          : null
      )
      .filter(Boolean);

    if (!name || name.trim().length < 3 || name.trim().length > 50) {
      return new Response(
        JSON.stringify({
          message: "نام محصول باید بین ۳ تا ۵۰ کاراکتر باشد",
        }),
        { status: 400 }
      );
    }

    if (!description || description.trim().length < 3) {
      return new Response(
        JSON.stringify({
          message: "توضیحات محصول باید حداقل ۳ کاراکتر باشد",
        }),
        { status: 400 }
      );
    }

    if (isNaN(price) || price <= 0) {
      return new Response(
        JSON.stringify({
          message: "قیمت محصول باید عددی مثبت باشد",
        }),
        { status: 400 }
      );
    }

    if (!category) {
      return new Response(
        JSON.stringify({
          message: "دسته‌بندی محصول الزامی است",
        }),
        { status: 400 }
      );
    }

    if (!author || author.trim().length === 0) {
      return new Response(
        JSON.stringify({
          message: "نام نویسنده الزامی است",
        }),
        { status: 400 }
      );
    }

    if (!image || !image.name) {
      return new Response(
        JSON.stringify({
          message: "تصویر محصول الزامی است",
        }),
        { status: 400 }
      );
    }

    if (!file || !file.name) {
      return new Response(
        JSON.stringify({
          message: "فایل محصول الزامی است",
        }),
        { status: 400 }
      );
    }

    if (!/\.(jpg|jpeg|png|webp|gif)$/i.test(image.name)) {
      return new Response(
        JSON.stringify({
          message: "فرمت تصویر باید jpg، jpeg، png، webp یا gif باشد",
        }),
        { status: 400 }
      );
    }

    if (!/\.(pdf|zip|mp3|wav)$/i.test(file.name)) {
      return new Response(
        JSON.stringify({
          message: "فرمت فایل باید pdf، zip، mp3 یا wav باشد",
        }),
        { status: 400 }
      );
    }
    if (!["pdf", "zip", "mp3", "wav"].includes(fileType)) {
      return new Response(
        JSON.stringify({
          message: "نوع فایل باید pdf، zip، mp3 یا wav باشد",
        }),
        { status: 400 }
      );
    }
    const existingProduct = await Product.findOne({ name: name.trim() });
    if (existingProduct) {
      return new Response(
        JSON.stringify({ message: "محصولی با این نام قبلاً ثبت شده است" }),
        { status: 409 }
      );
    }
    const saveUploadedFile = async (file, type) => {
      const fileName = file.name.toLowerCase();
      const filePath = join(process.cwd(), "public/uploads", fileName);

      if (existsSync(filePath)) {
        throw new Error(
          `${type === "image" ? "تصویری" : "فایلی"} با نام " ${
            file.name
          } " قبلاً آپلود شده است.`
        );
      }
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);
      return `/uploads/${fileName}`;
    };

    await connectToDatabase();

    const imageUrl = await saveUploadedFile(image, "image");
    const fileUrl = await saveUploadedFile(file, "file");
    // ایجاد و ذخیره محصول جدید در دیتابیس
    const newProduct = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price,
      discountedPrice,
      category,
      imageUrl,
      fileUrl,
      fileType,
      tags,
      saleStatus,
      isActive,
      author: author.trim(),
    });

    return new Response(JSON.stringify(newProduct), { status: 201 });
  } catch (error) {
    console.error("خطا در ایجاد محصول:", error);
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
    });
  }
}
import connectToDatabase from "@/app/lib/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";
import { join } from "path";
import { unlink, writeFile } from "fs/promises";
import mongoose from "mongoose";
import { existsSync } from "fs";
// دریافت محصول بر اساس شناسه
export async function GET(request, { params }) {
  await connectToDatabase();
  const { id } = await params;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return new Response(JSON.stringify({ message: "محصول پیدا نشد" }), {
        status: 404,
      });
    }
    return new Response(JSON.stringify(product), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
    });
  }
}
// ویرایش کامل اطلاعات محصول
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { message: "شناسه محصول معتبر نیست" },
        { status: 400 }
      );
    }

    const data = await request.formData();
    await connectToDatabase();
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ message: "محصول یافت نشد" }, { status: 404 });
    }
    // دریافت مقادیر
    const name = data.get("name");
    const image = data.get("image");
    const file = data.get("file");
    const description = data.get("description");
    const price = parseFloat(data.get("price"));
    const discountedPrice = parseFloat(data.get("discountedPrice")) || 0;
    const category = data.get("category");
    const fileType = data.get("fileType");
    const saleStatus = data.get("saleStatus") || "available";
    const isActive = data.get("isActive") === "true";
    const author = data.get("author"); // اضافه کردن نویسنده

    // اعتبارسنجی‌ها
    if (discountedPrice < 0 || discountedPrice > price) {
      return new Response(
        JSON.stringify({
          message: "قیمت تخفیفی باید عددی مثبت و کمتر از قیمت اصلی باشد",
        }),
        { status: 400 }
      );
    }

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

    if (isNaN(price) || price < 0) {
      return new Response(
        JSON.stringify({
          message: "قیمت محصول نمی‌تواند منفی باشد",
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

    if (!["pdf", "zip", "mp3", "wav"].includes(fileType)) {
      return new Response(
        JSON.stringify({
          message: "نوع فایل باید pdf، zip، mp3 یا wav باشد",
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

    const existingProduct = await Product.findOne({ name: name.trim() });
    if (existingProduct && existingProduct._id.toString() !== id) {
      return new Response(
        JSON.stringify({ message: "محصولی با این نام قبلاً ثبت شده است" }),
        { status: 409 }
      );
    }

    const uploadDir = join(process.cwd(), "public/uploads");
    let imageUrl = product.imageUrl;
    let fileUrl = product.fileUrl;

    if (image && image.name) {
      const imageName = image.name.toLowerCase();
      const imagePath = join(uploadDir, imageName);
      if (existsSync(imagePath)) {
        return NextResponse.json(
          { message: "تصویری با این نام قبلاً وجود دارد" },
          { status: 400 }
        );
      }
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(imagePath, buffer);
      imageUrl = `/uploads/${imageName}`;
      if (product.imageUrl) {
        const oldImagePath = join(process.cwd(), "public", product.imageUrl);
        await unlink(oldImagePath).catch(() => {});
      }
    }
    if (file && file.name) {
      const validExtensions = /\.(pdf|zip|mp3|wav)$/i;
      if (!validExtensions.test(file.name)) {
        return NextResponse.json(
          { message: "فرمت فایل باید pdf، zip، mp3 یا wav باشد" },
          { status: 400 }
        );
      }

      const fileName = file.name.toLowerCase();
      const filePath = join(uploadDir, fileName);
      if (existsSync(filePath)) {
        return NextResponse.json(
          { message: "فایلی با این نام قبلاً وجود دارد" },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);
      fileUrl = `/uploads/${fileName}`;
      if (product.fileUrl) {
        const oldFilePath = join(process.cwd(), "public", product.fileUrl);
        await unlink(oldFilePath).catch(() => {});
      }
    }

    // بروزرسانی محصول
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name,
        description,
        price,
        discountedPrice,
        category,
        tags,
        imageUrl,
        fileUrl,
        saleStatus,
        fileType,
        isActive,
        author: author.trim(),
      },
      { new: true }
    );

    return new Response(JSON.stringify(updatedProduct), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("خطا در PUT:", error);
    return NextResponse.json(
      { message: "خطا در ویرایش محصول" },
      { status: 500 }
    );
  }
}
// حذف محصول

export async function DELETE(request, { params }) {
  await connectToDatabase();

  try {
    const { id } = await params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "شناسه معتبر نیست" },
        { status: 400 }
      );
    }

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ message: "محصول یافت نشد" }, { status: 404 });
    }

    const imagePath = join(process.cwd(), "public", product.imageUrl || "");
    await unlink(imagePath).catch(() => {
      console.log("خطا در حذف تصویر قبلی");
    });
    const filePath = join(process.cwd(), "public", product.fileUrl || "");
    await unlink(filePath).catch(() => {
      console.log("خطا در حذف فایل محصول");
    });

    await Product.findByIdAndDelete(id);

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("خطا در DELETE:", error);
    return NextResponse.json({ message: "خطا در حذف محصول" }, { status: 500 });
  }
}
// بروزرسانی جزئی با PATCH
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "شناسه معتبر نیست" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const updates = await request.json();

    if (!Object.keys(updates).length) {
      return NextResponse.json(
        { message: "مقداری برای بروزرسانی ارسال نشده است" },
        { status: 400 }
      );
    }
    if (updates.price !== undefined) {
      const parsedPrice = parseFloat(updates.price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return NextResponse.json(
          { message: "قیمت محصول نمی‌تواند منفی باشد" },
          { status: 400 }
        );
      }
      updates.price = parsedPrice;
    }
    
    if (updates.discountedPrice !== undefined) {
      const parsedDiscount = parseFloat(updates.discountedPrice);
      if (isNaN(parsedDiscount) || parsedDiscount < 0) {
        return NextResponse.json(
          { message: "قیمت تخفیفی نمی‌تواند منفی باشد" },
          { status: 400 }
        );
      }
      if (
        updates.price !== undefined &&
        parsedDiscount > updates.price
      ) {
        return NextResponse.json(
          { message: "قیمت تخفیفی نمی‌تواند بیشتر از قیمت اصلی باشد" },
          { status: 400 }
        );
      }
      updates.discountedPrice = parsedDiscount;
    }
    

    const allowedFields = [
      "name",
      "description",
      "price",
      "discountedPrice",
      "category",
      "tags",
      "fileType",
      "saleStatus",
      "isActive",
      "fileUrl",
      "author",
    ];

    const updateData = {};
    for (const key of allowedFields) {
      if (key in updates) {
        updateData[key] = updates[key];
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedProduct) {
      return new Response(JSON.stringify({ message: "محصول یافت نشد" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(updatedProduct), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("خطا در PATCH:", error);
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
    });
  }
}

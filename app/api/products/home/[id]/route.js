import connectToDatabase from "@/app/lib/db";
import Product from "@/models/Product";
import Comment from "@/models/Comment";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(req, { params }) {
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "آیدی نامعتبر" }, { status: 400 });
  }

  await connectToDatabase();

  try {
    const product = await Product.findById(id)
      .populate("category")
      .populate("author");

    if (!product) {
      return NextResponse.json({ error: "محصول یافت نشد" }, { status: 404 });
    }

    // 🔹 اینجا اصلاح شد: استفاده از productName
    const comments = await Comment.find({ productName: id }).select("rating");

    const averageRating =
      comments.length > 0
        ? comments.reduce((sum, c) => sum + c.rating, 0) / comments.length
        : 0;

    const productData = {
      ...product.toObject(),
      averageRating,
      totalReviews: comments.length,
    };

    return NextResponse.json({ product: productData });
  } catch (error) {
    console.error("خطا در دریافت محصول:", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

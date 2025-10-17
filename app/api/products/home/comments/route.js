import mongoose from "mongoose";
import connectToDatabase from "@/app/lib/db";
import Comment from "@/models/Comment";
import { NextResponse } from "next/server";

// گرفتن لیست نظرات
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("product");

  await connectToDatabase();

  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
  }

  try {
    const comments = await Comment.find({
      productName: new mongoose.Types.ObjectId(productId),
      approved: true,
    })
      .populate("user", "firstname lastname") // اینجا اسم و فامیل رو می‌آره
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Comments API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ثبت نظر جدید
export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();

    if (!body.product || !mongoose.Types.ObjectId.isValid(body.product)) {
      return NextResponse.json(
        { error: "شناسه محصول نامعتبر است" },
        { status: 400 }
      );
    }

    if (!body.userId || !mongoose.Types.ObjectId.isValid(body.userId)) {
      return NextResponse.json(
        { error: "شناسه کاربر نامعتبر است یا کاربر وارد نشده" },
        { status: 401 }
      );
    }

    const newComment = await Comment.create({
      productName: new mongoose.Types.ObjectId(body.product),
      user: new mongoose.Types.ObjectId(body.userId),
      rating: body.rating,
      commentText: body.commentText,
      approved: true,
    });

    const populatedComment = await Comment.findById(newComment._id)
      .populate("user", "firstname lastname")
      .lean();

    await updateProductRating(body.product); // به‌روزرسانی امتیاز محصول

    return NextResponse.json(populatedComment);
  } catch (error) {
    console.error("خطا در ثبت نظر:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// تابع به‌روزرسانی امتیاز محصول
const updateProductRating = async (productId) => {
  const comments = await Comment.find({
    productName: productId,
    approved: true,
  });
  const averageRating =
    comments.length > 0
      ? comments.reduce((sum, c) => sum + c.rating, 0) / comments.length
      : 0;

  await Product.findByIdAndUpdate(productId, {
    averageRating,
    totalReviews: comments.length,
  });
};

import connectToDatabase from "@/app/lib/db";
import Product from "@/models/Product";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("categoryId");
  const productId = searchParams.get("productId"); // اضافه کردن شناسه محصول جاری

  await connectToDatabase();

  try {
    let query = {};

    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
      query.category = new mongoose.Types.ObjectId(categoryId);
    }

    // حذف محصول جاری از نتایج
    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      query._id = { $ne: new mongoose.Types.ObjectId(productId) };
    }

    const relatedProducts = await Product.find(query)
      .limit(8)
      .select("name price imageUrl author");

    return NextResponse.json(relatedProducts);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "خطا در دریافت محصولات" },
      { status: 500 }
    );
  }
}

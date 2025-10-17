import { NextResponse } from "next/server";
import connectToDatabase from "@/app/lib/db";
import Product from "@/models/Product";
import Tag from "@/models/Tag";

export async function GET(request) {
  await connectToDatabase();
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q || q.trim().length < 1) {
    return NextResponse.json({ message: "تگ الزامی است" }, { status: 400 });
  }

  try {
    // پیدا کردن تگ فعال
    const tag = await Tag.findOne({ name: q.trim(), isActive: true });
    if (!tag) {
      return NextResponse.json([]);
    }

    // پیدا کردن محصولات فعال که شامل این تگ هستند
    const products = await Product.find({
      tags: tag._id,
      saleStatus: true,
      isActive: true,
    })
      .select("_id name author imageUrl price fileType description discountedPrice")
      .lean();

    return NextResponse.json(products);
  } catch (err) {
    console.error("Tag API Error:", err);
    return NextResponse.json(
      { message: "خطا در دریافت محصولات بر اساس تگ" },
      { status: 500 }
    );
  }
}

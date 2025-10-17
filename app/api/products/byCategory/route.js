import { NextResponse } from "next/server";
import connectToDatabase from "@/app/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { unslugify } from "@/app/utils/slugify";

export async function GET(request) {
  await connectToDatabase();

  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get("q");
  const q =unslugify(rawQuery.trim()) ;
  // تبدیل slug به نام اصلی
  // q = unslugify(q);
  console.log("Query param q:", q);

  if (!q || q.trim().length < 1) {
    console.log("دسته بندی الزامی است");
    return NextResponse.json(
      { message: "دسته بندی الزامی است" },
      { status: 400 }
    );
  }
  try {
    const category = await Category.findOne({ name: q.trim(), isActive: true });
    if (!category) {
      return NextResponse.json([]);
    }
    const products = await Product.find({
      category: { $in: [category._id] },
      saleStatus: true,
      isActive: true,
    })
      .select(
        "_id name author imageUrl price fileType tags description discountedPrice"
      )
      .lean();

    return NextResponse.json(products);
  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json(
      { message: "خطا در دریافت محصولات" },
      { status: 500 }
    );
  }
}

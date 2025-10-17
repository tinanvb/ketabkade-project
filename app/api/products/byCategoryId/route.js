import connectToDatabase from "@/app/lib/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";


export async function GET(req) {
  await connectToDatabase();

  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("id");

  if (!categoryId) {
    return NextResponse.json(
      { message: "شناسه دسته بندی الزامی است" },
      { status: 400 }
    );
  }

  try {
    const products = await Product.find({
      category: categoryId,
      saleStatus: true,
      isActive: true,
    })
      .select("_id name author imageUrl price fileType description discountedPrice")
      .lean()
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json(products);
  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json(
      { message: "خطا در دریافت محصولات" },
      { status: 500 }
    );
  }
}

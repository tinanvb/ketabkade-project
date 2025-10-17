import { NextResponse } from "next/server";
import connectToDatabase from "@/app/lib/db";
import Product from "@/models/Product";

export async function GET(request) {
  await connectToDatabase();
  const { searchParams } = new URL(request.url);
  const authorQuery = searchParams.get("q");

  if (!authorQuery || authorQuery.trim().length < 1) {
    return NextResponse.json(
      { message: "نام نویسنده الزامی است" },
      { status: 400 }
    );
  }

  const regex = new RegExp(authorQuery.trim(), "i");

  try {
    const products = await Product.find({
      isActive: true,
      saleStatus: true,
      author: regex,
    })
      .select("_id name author imageUrl price description tags fileType discountedPrice")
      .lean();

    return NextResponse.json(products);
  } catch (err) {
    console.error("Author API Error:", err);
    return NextResponse.json(
      { message: "خطا در دریافت محصولات نویسنده" },
      { status: 500 }
    );
  }
}

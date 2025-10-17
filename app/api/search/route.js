import { NextResponse } from "next/server";
import connectToDatabase from "@/app/lib/db";
import Tag from "@/models/Tag";
import Product from "@/models/Product";

export async function GET(request) {
  await connectToDatabase();
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q || q.trim().length < 1) {
    return NextResponse.json(
      { message: "عبارت جست‌وجو الزامی است" },
      { status: 400 }
    );
  }

  const regex = new RegExp(q.trim(), "i");

  try {
    // گرفتن محصولات
    const products = await Product.find({
      isActive: true,
      saleStatus: true,
      name: regex,
    })
      .select("_id name")
      .lean();

    const authors = await Product.find({
      author: regex,
    })
      .select("_id author")
      .lean();

    const tags = await Tag.find({ name: regex }).select("_id name").lean();

    const result = [
      ...products.map(({ _id, name }) => ({
        id: `product-${_id}`,
        _id,
        label: name,
        type: "product",
      })),
      ...authors.map(({ _id, author }) => ({
        id: `author-${_id}`,
        _id,
        label: author,
        author,
        type: "author",
      })),
      ...tags.map(({ _id, name }) => ({
        id: `tag-${_id}`,
        _id,
        label: name,
        type: "tag",
      })),
    ];
    return NextResponse.json(result);
  } catch (err) {
    console.error("Search API error:", err);
    return NextResponse.json(
      { message: "خطا در پردازش جست‌وجو" },
      { status: 500 }
    );
  }
}

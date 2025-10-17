import connectToDatabase from "@/app/lib/db";
import { NextResponse } from "next/server";
import Order from "@/models/Order";
import mongoose from "mongoose";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export async function GET(req) {
  try {
    await connectToDatabase();
    const session = await getServerSession({ req, ...authOptions });
    if (!session?.user) {
      return NextResponse.json({ error: "لاگین کنید" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    if (!productId || !mongoose.isValidObjectId(productId)) {
      return NextResponse.json({ error: "شناسه محصول نامعتبر است" }, { status: 400 });
    }

    const hasPurchased = await Order.exists({
      user: session.user.id,
      "items.product": productId,
      status: "completed",
    });

    return NextResponse.json({ hasPurchased: !!hasPurchased }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/order/check:", error);
    return NextResponse.json({ error: "خطا در چک خرید" }, { status: 500 });
  }
}
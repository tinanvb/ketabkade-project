import connectToDatabase from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import Order from "@/models/Order";
import Product from "@/models/Product";

export async function GET(req) {
  try {
    await connectToDatabase();

    const session = await getServerSession({ req, ...authOptions });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "لطفا ابتدا وارد حساب شوید" },
        { status: 401 }
      );
    }

    const orders = await Order.find({ user: session.user.id })
      .populate({
        path: "items.product",
        select: "name imageUrl price fileUrl",
      })
      .sort({ createdAt: -1 });

    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

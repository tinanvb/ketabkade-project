import connectToDatabase from "@/app/lib/db";
import Payment from "@/models/Payment";
import "@/models/User";
import "@/models/Product";
import "@/models/Category";
import { getToken } from "next-auth/jwt";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== "admin") {
    return new Response(
      JSON.stringify({ message: "دسترسی غیرمجاز" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    await connectToDatabase();

    // دریافت پارامترهای فیلتر از query
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || null;
    const method = searchParams.get("method") || null;

    // ساخت شرط‌های فیلتر
    const filter = {};
    if (status) filter.status = status;
    if (method) filter.method = method;

    // دریافت تمام پرداخت‌ها
    const payments = await Payment.find(filter)
      .sort({ createdAt: -1 })
      .populate("user", "username firstname lastname email phoneNumber role")
      .populate({
        path: "products",
        select: "name imageUrl price discountedPrice category",
        populate: {
          path: "category",
          select: "name",
        },
      })
      .lean();

    return new Response(
      JSON.stringify({ success: true, data: { payments } }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("خطا در دریافت پرداخت‌ها:", {
      message: err.message,
      stack: err.stack,
    });
    return new Response(
      JSON.stringify({ message: "خطا در دریافت اطلاعات پرداخت‌ها", error: err.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
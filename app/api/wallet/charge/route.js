import Transaction from "@/models/Transaction";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { createPayment } from "@/app/lib/zarinpal";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { amount } = await req.json();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // ساخت پرداخت از زرین پال
    const payment = await createPayment(
      amount,
      `شارژ کیف پول کاربر ${session.user.id}`,
      `${process.env.NEXTAUTH_URL}/api/wallet/verify` // بدون id اینجا
    );
    console.log("Payment response:", payment);
    if (!payment.authority) {
      throw new Error("Authority not received from Zarinpal");
    }

    // ساخت تراکنش و ذخیره authority (trackingCode در verify تنظیم می‌شود)
    const newTransaction = await Transaction.create({
      userId: session.user.id,
      amount,
      type: "charge",
      status: "pending",
      authority: payment.authority, // ذخیره کد طولانی
    });

    return NextResponse.json({ url: payment.url });
  } catch (err) {
    console.error("Charge API Error:", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
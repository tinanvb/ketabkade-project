import { NextResponse } from "next/server";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { verifyPayment } from "@/app/lib/zarinpal";

export async function GET(req) {
  const baseUrl = process.env.NEXTAUTH_URL;
  const { searchParams } = new URL(req.url);
  const Authority = searchParams.get("Authority");
  const Status = searchParams.get("Status");

  // پیدا کردن تراکنش با authority (نه trackingCode)
  const transaction = await Transaction.findOne({ authority: Authority });
  if (!transaction) {
    return NextResponse.redirect(`${baseUrl}/user/wallet/fail`);
  }

  // اگر قبلا موفق بوده -> مستقیماً به success هدایت کن
  if (transaction.status === "completed") {
    // status را completed کردم برای سازگاری
    return NextResponse.redirect(
      new URL(
        `${baseUrl}/user/wallet/success?ref=${transaction.trackingCode}&amount=${transaction.amount}`
      )
    );
  }

  // اگر وضعیت OK نیست -> fail
  if (Status !== "OK") {
    transaction.status = "failed";
    await transaction.save();
    return NextResponse.redirect(new URL(`${baseUrl}/user/wallet/fail`));
  }

  // تایید پرداخت از زرین پال
  const result = await verifyPayment(Authority, transaction.amount);

  if (result.status === "success") {
    transaction.status = "completed"; // completed برای سازگاری
    transaction.trackingCode = result.ref_id.toString(); // ref_id به عنوان trackingCode (عدد چندرقمی)
    await transaction.save();

    const updatedUser = await User.findByIdAndUpdate(
      transaction.userId,
      {
        $inc: { balance: transaction.amount },
      },
      { new: true }
    );

    return NextResponse.redirect(
      new URL(
        `${baseUrl}/user/wallet/success?ref=${transaction.trackingCode}&amount=${transaction.amount}`
      )
    );
  } else {
    transaction.status = "failed";
    await transaction.save();
    return NextResponse.redirect(new URL(`${baseUrl}/user/wallet/fail`));
  }
}

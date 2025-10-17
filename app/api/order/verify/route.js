import connectToDatabase from "@/app/lib/db";
import { NextResponse } from "next/server";
import Order from "@/models/Order";
import Payment from "@/models/Payment";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { verifyPayment } from "@/app/lib/zarinpal";
import Cart from "@/models/Cart";
import invoiceEmailService from "@/app/lib/invoiceEmailService";

export async function GET(req) {
  try {
    await connectToDatabase();

    const { Authority, Status, orderId } = Object.fromEntries(
      new URL(req.url).searchParams
    );

    if (!Authority || !Status || !orderId)
      return NextResponse.json(
        { error: "پارامترهای درخواست ناقص هستند" },
        { status: 400 }
      );

    const order = await Order.findById(orderId);
    if (!order)
      return NextResponse.json({ error: "سفارش پیدا نشد" }, { status: 404 });

    const user = await User.findById(order.user);
    if (!user)
      return NextResponse.json(
        { error: "کاربر مربوطه پیدا نشد" },
        { status: 404 }
      );

    const productIds = order.items.map((item) => item.product);

    // استخراج ipAddress
    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.socket?.remoteAddress ||
      "";

    if (Status === "NOK") {
      order.status = "cancelled";
      await order.save();

      await Payment.findOneAndUpdate(
        { authority: Authority },
        {
          status: "cancelled",
          errorMessage: "کاربر پرداخت را لغو کرد",
          ipAddress,
        },
        { new: true }
      );

      await Transaction.findOneAndUpdate(
        { authority: Authority },
        { status: "cancelled" }
      );

      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/cart/fail`);
    }

    const paymentResult = await verifyPayment(Authority, order.finalPrice);

    if (paymentResult.status === "success") {
      const trackingCode = paymentResult.ref_id.toString();

      order.status = "completed";
      order.trackingCode = trackingCode;
      await order.save();

      await Transaction.findOneAndUpdate(
        { authority: Authority },
        {
          status: "completed",
          trackingCode,
        }
      );

      const updatedPayment = await Payment.findOneAndUpdate(
        { authority: Authority },
        {
          status: "completed",
          amount: order.finalPrice,
          products: productIds,
          trackingCode,
          paidAt: new Date(),
          cardNumberMasked: paymentResult.card_pan || "****-****-****-****",
          gatewayResponse: JSON.stringify(paymentResult),
          ipAddress,
        },
        { new: true }
      ).populate("products");

      // ساخت شیء payment برای ارسال ایمیل
      const paymentForEmail = {
        trackingCode,
        amount: order.finalPrice,
        status: "completed",
        method: "zarinpal",
        paidAt: new Date(),
        user: {
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
        },
        products: updatedPayment.products.map((product) => ({
          _id: product._id,
          name: product.name,
          price: product.price,
          discountedPrice: product.discountedPrice || 0,
        })),
      };

      // ارسال ایمیل فاکتور
      try {
        await invoiceEmailService(user.email, paymentForEmail);
        console.log("ایمیل فاکتور با موفقیت ارسال شد");
      } catch (emailError) {
        console.error("خطا در ارسال ایمیل فاکتور:", emailError);
        // خطا در ارسال ایمیل نباید فرآیند را متوقف کند
      }

      await Cart.updateOne(
        { user: user._id },
        { $set: { items: [], discountPrice: 0 } }
      );

      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/cart/success?ref=${trackingCode}&amount=${order.finalPrice}`
      );
    } else {
      order.status = "failed";
      await order.save();

      await Payment.findOneAndUpdate(
        { authority: Authority },
        {
          status: "failed",
          errorMessage: paymentResult.error || "خطای ناشناخته در درگاه پرداخت",
          ipAddress,
        },
        { new: true }
      );

      await Transaction.findOneAndUpdate(
        { authority: Authority },
        { status: "failed" }
      );

      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/cart/fail`);
    }
  } catch (error) {
    console.error("Error in GET /api/order/verify:", error);
    return NextResponse.json(
      { error: error.message || "خطا در تأیید پرداخت" },
      { status: 500 }
    );
  }
}

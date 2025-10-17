import connectToDatabase from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import Order from "@/models/Order";
import Payment from "@/models/Payment";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { authOptions } from "../auth/[...nextauth]/route";
import { createPayment } from "@/app/lib/zarinpal";
import generateTrackingCode from "@/app/utils/generateTrackingCode";

export async function POST(req) {
  try {
    await connectToDatabase();
    const session = await getServerSession({ req, ...authOptions });
    if (!session?.user)
      return NextResponse.json(
        { error: "برای ثبت سفارش باید وارد شوید" },
        { status: 401 }
      );

    if (session.user.role === "admin")
      return NextResponse.json(
        { error: "ادمین‌ها نمی‌توانند سفارش ثبت کنند" },
        { status: 403 }
      );

    const {
      items,
      totalPrice,
      totalDiscountedPrice,
      appliedDiscount,
      paymentMethod,
    } = await req.json();

    if (!items || items.length === 0)
      return NextResponse.json(
        { error: "سبد خرید شما خالی است" },
        { status: 400 }
      );

    const cart = await Cart.findOne({ user: session.user.id }).populate({
      path: "items.product",
      select: "name price discountedPrice imageUrl fileType",
    });

    if (!cart || cart.items.length === 0)
      return NextResponse.json(
        { error: "سبد خرید شما خالی است" },
        { status: 400 }
      );

    // فیلتر محصولات حذف‌شده
    cart.items = cart.items.filter((item) => item.product);
    await cart.save();

    // اعتبارسنجی محصولات
    const validatedItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product)
          throw new Error(`محصول با شناسه ${item.product} یافت نشد`);
        return {
          product: product._id,
          name: product.name,
          price: product.price,
          discountedPrice: product.discountedPrice || 0,
        };
      })
    );

    const serverTotalPrice = cart.items.reduce(
      (total, item) => total + (item.product?.price || 0),
      0
    );
    const serverTotalDiscountedPrice = cart.items.reduce(
      (total, item) => total + (item.product?.discountedPrice || 0),
      0
    );
    const serverDiscountPrice = cart.discountPrice || 0;
    const serverFinalPrice =
      serverTotalPrice - serverTotalDiscountedPrice - serverDiscountPrice;

    if (
      serverTotalPrice !== totalPrice ||
      serverTotalDiscountedPrice !== totalDiscountedPrice ||
      serverDiscountPrice !== appliedDiscount ||
      serverFinalPrice !== totalPrice - totalDiscountedPrice - appliedDiscount
    ) {
      return NextResponse.json(
        { error: "داده‌های ارسالی نامعتبر هستند" },
        { status: 400 }
      );
    }

    const isDownloadable = cart.items.every((item) =>
      ["pdf", "zip", "mp3", "wav"].includes(item.product?.fileType)
    );

    // استخراج ipAddress
    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.socket?.remoteAddress ||
      "";
    // ایجاد سفارش
    const newOrder = await Order.create({
      user: session.user.id,
      items: validatedItems,
      totalPrice: serverTotalPrice,
      totalDiscountedPrice: serverTotalDiscountedPrice,
      discountPrice: serverDiscountPrice,
      finalPrice: serverFinalPrice,
      status: paymentMethod === "gateway" ? "pending" : "completed",
      paymentMethod: paymentMethod === "gateway" ? "gateway" : "wallet",
      isDownloadable,
    });

    const productIds = validatedItems.map((item) => item.product);

    // --- پرداخت با کیف پول ---
    if (paymentMethod === "wallet") {
      const user = await User.findById(session.user.id);
      if (user.balance < serverFinalPrice)
        return NextResponse.json(
          { error: "موجودی کیف پول کافی نیست" },
          { status: 400 }
        );

      user.balance -= serverFinalPrice;
      await user.save();

      const trackingCode = await generateTrackingCode();

      await Transaction.create({
        userId: user._id,
        amount: serverFinalPrice,
        type: "walletPayment",
        status: "completed",
        trackingCode,
      });

      await Payment.create({
        transactionId: `wallet-${newOrder._id}`,
        user: user._id,
        products: productIds,
        amount: serverFinalPrice,
        method: "wallet",
        type: "productPayment",
        status: "completed",
        trackingCode,
        paidAt: new Date(),
        ipAddress,
      });

      newOrder.status = "completed";
      newOrder.trackingCode = trackingCode;
      await newOrder.save();

      await Cart.updateOne(
        { user: session.user.id },
        { $set: { items: [], discountPrice: 0 } }
      );

      return NextResponse.json({
        message: "سفارش شما با موفقیت پرداخت شد",
        orderId: newOrder._id,
        trackingCode,
        amount: serverFinalPrice,
        newBalance: user.balance,
      });
    }

    // --- پرداخت با درگاه بانکی ---
    if (paymentMethod === "gateway") {
      const payment = await createPayment(
        serverFinalPrice,
        `پرداخت سفارش ${newOrder._id}`,
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/order/verify?orderId=${newOrder._id}`
      );

     await Payment.create({
        transactionId: payment.authority,
        user: session.user.id,
        products: productIds,
        amount: serverFinalPrice,
        method: "zarinpal",
        type: "productPayment",
        status: "pending",
        authority: payment.authority,
        ipAddress,
      });

      await Transaction.create({
        userId: session.user.id,
        amount: serverFinalPrice,
        type: "productPayment",
        status: "pending",
        authority: payment.authority,
      });

      newOrder.authority = payment.authority;
      await newOrder.save();

      return NextResponse.json({
        message: "در حال انتقال به درگاه...",
        paymentUrl: payment.url,
        orderId: newOrder._id,
      });
    }

    return NextResponse.json(
      { error: "روش پرداخت نامعتبر است" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in POST /api/order:", error);
    return NextResponse.json(
      { error: error.message || "خطایی در ثبت سفارش رخ داده است" },
      { status: 500 }
    );
  }
}

import connectToDatabase from "@/app/lib/db";
import { NextResponse } from "next/server";
import DiscountCode from "@/models/DiscountCode";
import { discountCodeRegex } from "@/app/utils/regex";

// GET - لیست تمام کدهای تخفیف
export async function GET() {
  try {
    await connectToDatabase();
    const discounts = await DiscountCode.find().sort({ code: 1 });
    return NextResponse.json(discounts);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "خطا در دریافت کدهای تخفیف" },
      { status: 500 }
    );
  }
}

// POST - افزودن کد تخفیف جدید
export async function POST(req) {
  try {
    await connectToDatabase();

    const {
      code,
      discountAmount,
      discountType,
      expiryDate,
      status,
    } = await req.json();

    // بررسی فیلدهای الزامی
    if (!code || !discountAmount || !discountType || !expiryDate) {
      return NextResponse.json(
        { error: "تمام فیلدهای الزامی را وارد کنید" },
        { status: 400 }
      );
    }

    // الگوی مجاز برای کد
    if (!discountCodeRegex.test(code)) {
      return NextResponse.json(
        { error: "کد فقط شامل حروف بزرگ لاتین و اعداد باشد" },
        { status: 400 }
      );
    }

    // ساخت و ذخیره کد تخفیف
    const newDiscount = new DiscountCode({
      code: code.trim(),
      discountAmount,
      discountType,
      expiryDate: new Date(expiryDate),
      status: Boolean(status),
    });

    await newDiscount.save();

    return NextResponse.json({
      message: "کد تخفیف با موفقیت ایجاد شد",
      discount: newDiscount,
    });
  } catch (error) {
    console.error(error);

    // بررسی تکراری بودن کد
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "این کد تخفیف قبلاً ثبت شده است" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: error.message || "خطا در ایجاد کد تخفیف",
      },
      { status: 500 }
    );
  }
}

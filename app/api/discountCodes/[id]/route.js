import connectToDatabase from "@/app/lib/db";
import DiscountCode from "@/models/DiscountCode";
import { NextResponse } from "next/server";

// دریافت یک کد تخفیف بر اساس شناسه
export async function GET(req, { params }) {
  await connectToDatabase();
  const { id } = await params;

  try {
    const discount = await DiscountCode.findById(id);
    if (!discount)
      return NextResponse.json({ error: "کد تخفیف یافت نشد" }, { status: 404 });
    return NextResponse.json(discount);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "خطا در دریافت اطلاعات" },
      { status: 500 }
    );
  }
}

// ویرایش یک کد تخفیف
export async function PUT(req, { params }) {
  await connectToDatabase();
  const { id } = await params;

  try {
    const { code, discountAmount, discountType, expiryDate, status } =
      await req.json();

    // اعتبارسنجی 
    if (!code || !discountAmount || !discountType || !expiryDate) {
      return NextResponse.json(
        { error: "همه فیلدها باید وارد شوند" },
        { status: 400 }
      );
    }

    if (!["percent", "fixed"].includes(discountType)) {
      return NextResponse.json(
        { error: "نوع تخفیف معتبر نیست" },
        { status: 400 }
      );
    }

    const amount = Number(discountAmount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "مقدار تخفیف باید عددی مثبت باشد" },
        { status: 400 }
      );
    }

    const exp = new Date(expiryDate);
    if (isNaN(exp.getTime()) || exp <= new Date()) {
      return NextResponse.json(
        { error: "تاریخ انقضا باید معتبر و در آینده باشد" },
        { status: 400 }
      );
    }

    // بررسی تکراری نبودن کد (به جز خودش)
    const existing = await DiscountCode.findOne({ code: code.trim() });
    if (existing && existing._id.toString() !== id) {
      return NextResponse.json(
        { error: "کدی با این عنوان قبلاً ثبت شده است" },
        { status: 409 }
      );
    }

    const updated = await DiscountCode.findByIdAndUpdate(
      id,
      {
        code: code.trim(),
        discountAmount: amount,
        discountType,
        expiryDate: exp,
        status: Boolean(status),
      },
      { new: true }
    );

    if (!updated)
      return NextResponse.json({ error: "کد یافت نشد" }, { status: 404 });

    return NextResponse.json({
      message: "کد با موفقیت بروزرسانی شد",
      discount: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "خطا در بروزرسانی" },
      { status: 500 }
    );
  }
}

// حذف کد تخفیف
export async function DELETE(req, { params }) {
  await connectToDatabase();
  const { id } = await params;

  try {
    const deleted = await DiscountCode.findByIdAndDelete(id);
    if (!deleted)
      return NextResponse.json({ error: "کد تخفیف یافت نشد" }, { status: 404 });

    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "خطا در حذف کد" }),
      { status: 500 }
    );
  }
}

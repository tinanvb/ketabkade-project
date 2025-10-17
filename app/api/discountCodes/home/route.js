import connectToDatabase from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import DiscountCode from "@/models/DiscountCode";
import Cart from "@/models/Cart";
import Product from "@/models/Product";

export async function POST(req) {
  try {
    await connectToDatabase();

    const session = await getServerSession({ req, ...authOptions });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "برای اعمال کد تخفیف باید وارد شوید" },
        { status: 401 }
      );
    }

    const { code } = await req.json();

    if (!code || code.trim() === "") {
      return NextResponse.json(
        { error: "کد تخفیف را وارد کنید" },
        { status: 400 }
      );
    }

    const discount = await DiscountCode.findOne({
      code: code.trim(),
      status: true,
    });

    if (!discount) {
      return NextResponse.json(
        { error: "کد تخفیف وارد شده معتبر نیست" },
        { status: 400 }
      );
    }

    if (new Date() > new Date(discount.expiryDate)) {
      return NextResponse.json(
        { error: "کد تخفیف وارد شده منقضی شده است" },
        { status: 400 }
      );
    }

    let cart = await Cart.findOne({ user: session.user.id }).populate(
      "items.product"
    );

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: "سبد خرید شما خالی است" },
        { status: 400 }
      );
    }

    const totalPrice = cart.items.reduce((total, item) => {
      return total + (item.product.price || 0) * item.quantity;
    }, 0);

    if (totalPrice === 0) {
      return NextResponse.json(
        { error: "سبد خرید شما خالی است" },
        { status: 400 }
      );
    }

    let discountAmount = 0;
    if (discount.discountType === "percent") {
      discountAmount = (totalPrice * discount.discountAmount) / 100;
    } else {
      discountAmount = discount.discountAmount; // مبلغ ثابت
    }

    cart.discountPrice = discountAmount;
    await cart.save();

    const updatedCart = await Cart.findOne({ user: session.user.id });

    return NextResponse.json({
      discountAmount: discount.discountAmount,
      discountPrice: updatedCart.discountPrice,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "مشکلی در اعمال کد تخفیف پیش آمده است" },
      { status: 500 }
    );
  }
}

import crypto from "crypto";
import connectToDatabase from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import Cart from "@/models/Cart";

export async function POST(req) {
  try {
    await connectToDatabase();
    const session = await getServerSession({ req, ...authOptions });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "شما وارد نشده‌اید" },
        { status: 401 }
      );
    }

    if (session.user.role === "admin") {
      return NextResponse.json(
        { error: "ادمین‌ها نمی‌توانند سبد خرید ادغام کنند" },
        { status: 403 }
      );
    }

    const guestSessionId = req.cookies.get("guestSessionId")?.value;

    if (!guestSessionId) {
      return NextResponse.json(
        { message: "سبد خرید موقت یافت نشد" },
        { status: 200 }
      );
    }

    const userId = session.user.id;

    const [guestCart, userCart] = await Promise.all([
      Cart.findOne({ guestSessionId }).populate({
        path: "items.product",
        select: "name price discountedPrice imageUrl",
      }),
      Cart.findOne({ user: userId }).populate({
        path: "items.product",
        select: "name price discountedPrice imageUrl",
      }),
    ]);


    if (!guestCart) {
      return NextResponse.json(
        { message: "سبد خرید موقت خالی است" },
        { status: 200 }
      );
    }

    if (guestCart) {
      guestCart.items = guestCart.items.filter((item) => item.product);
      await guestCart.save();
    }
    if (userCart) {
      userCart.items = userCart.items.filter((item) => item.product);
      await userCart.save();
    }

    if (!userCart) {
      guestCart.user = userId;
      guestCart.guestSessionId = null;
      await guestCart.save();
    } else {
      const existingProductIds = userCart.items.map((item) =>
        item.product.toString()
      );
      const newItems = guestCart.items.filter(
        (item) => !existingProductIds.includes(item.product.toString())
      );

      userCart.items.push(...newItems);
      userCart.discountPrice = Math.max(
        userCart.discountPrice || 0,
        guestCart.discountPrice || 0
      );
      await userCart.save();
      await Cart.deleteOne({ guestSessionId });
    }

    const updatedCart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      select: "name price discountedPrice imageUrl",
    });

    const response = NextResponse.json(updatedCart || { items: [], discountPrice: 0 });
    response.cookies.set("guestSessionId", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      path: "/",
      sameSite: "lax",
    });
    return response;
  } catch (error) {
    console.error("Error in POST /api/cart/merge:", error.message, error.stack);
    return NextResponse.json(
      { error: "خطایی در ادغام سبد خرید رخ داده است" },
      { status: 500 }
    );
  }
}
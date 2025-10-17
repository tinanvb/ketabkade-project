import crypto from "crypto";
import connectToDatabase from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import Cart from "@/models/Cart";
import Product from "@/models/Product";

const getOrCreateGuestSessionId = (req) => {
  let guestSessionId = req.cookies.get("guestSessionId")?.value;
  if (!guestSessionId) {
    guestSessionId = crypto.randomUUID();
  }
  return guestSessionId;
};

export async function GET(req) {
  try {
    await connectToDatabase();
    const session = await getServerSession({ req, ...authOptions });

    let cart;
    let response = NextResponse.json({}); // پاسخ اولیه
    let guestSessionId = null;

    if (session && session.user) {
      if (session.user.role === "admin") {
        return NextResponse.json(
          { error: "ادمین‌ها نمی‌توانند سبد خرید داشته باشند" },
          { status: 403 }
        );
      }
      cart = await Cart.findOne({ user: session.user.id }).populate({
        path: "items.product",
        select: "name price discountedPrice imageUrl fileType",
      });
    } else {
      guestSessionId = getOrCreateGuestSessionId(req);
      cart = await Cart.findOne({ guestSessionId }).populate({
        path: "items.product",
        select: "name price discountedPrice imageUrl fileType",
      });
    }

    if (!cart) {
      cart = new Cart({
        user: session?.user?.id || null,
        guestSessionId: !session?.user ? guestSessionId : null,
        items: [],
        discountPrice: 0,
      });
      await cart.save();
    }

    if (cart) {
      cart.items = cart.items.filter((item) => item.product);
      await cart.save();
    }

    response = NextResponse.json(cart);
    if (!session?.user && guestSessionId) {
      response.cookies.set("guestSessionId", guestSessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
        sameSite: "lax",
      });
    }

    return response;
  } catch (error) {
    console.error("Error in GET /api/cart:", error.message, error.stack);
    return NextResponse.json(
      { error: "خطایی در دریافت سبد خرید رخ داده است" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectToDatabase();
    const session = await getServerSession({ req, ...authOptions });

    let cart;
    let response = NextResponse.json({});
    let guestSessionId = null;

    if (session && session.user) {
      if (session.user.role === "admin") {
        return NextResponse.json(
          { error: "ادمین‌ها نمی‌توانند به سبد خرید اضافه کنند" },
          { status: 403 }
        );
      }
      cart = await Cart.findOne({ user: session.user.id });
    } else {
      guestSessionId = getOrCreateGuestSessionId(req);
      cart = await Cart.findOne({ guestSessionId });
    }

    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json(
        { error: "شناسه محصول الزامی است" },
        { status: 400 }
      );
    }

    console.log(productId);

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { error: "محصول مورد نظر یافت نشد" },
        { status: 404 }
      );
    }
    console.log(product);

    if (!cart) {
      cart = new Cart({
        user: session?.user?.id || null,
        guestSessionId: !session?.user ? guestSessionId : null,
        items: [],
        discountPrice: 0,
      });
    }

    const existingItem = cart.items.find(
      (item) => item.product?.toString() === productId
    );
    if (existingItem) {
      return NextResponse.json(
        { error: "این کتاب قبلاً به سبد خرید اضافه شده است" },
        { status: 400 }
      );
    }

    cart.items.push({ product: productId });
    await cart.save();

    const updatedCart = await Cart.findOne(
      session?.user ? { user: session.user.id } : { guestSessionId }
    ).populate({
      path: "items.product",
      select: "name price discountedPrice imageUrl fileType",
    });
    if (updatedCart) {
      updatedCart.items = updatedCart.items.filter((item) => item.product);
      await updatedCart.save();
    }

    response = NextResponse.json(updatedCart);
    if (!session?.user && guestSessionId) {
      response.cookies.set("guestSessionId", guestSessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
        sameSite: "lax",
      });
    }

    return response;
  } catch (error) {
    console.error("Error in POST /api/cart:", error.message, error.stack);
    return NextResponse.json(
      { error: "خطایی در افزودن به سبد خرید رخ داده است" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    await connectToDatabase();
    const session = await getServerSession({ req, ...authOptions });

    let cart;
    let response = NextResponse.json({});
    let guestSessionId = null;

    if (session && session.user) {
      if (session.user.role === "admin") {
        return NextResponse.json(
          { error: "ادمین‌ها نمی‌توانند سبد خرید داشته باشند" },
          { status: 403 }
        );
      }
      cart = await Cart.findOne({ user: session.user.id });
    } else {
      guestSessionId = getOrCreateGuestSessionId(req);
      cart = await Cart.findOne({ guestSessionId });
    }

    if (!cart) {
      return NextResponse.json(
        { error: "سبد خرید شما خالی است" },
        { status: 404 }
      );
    }

    const { productId, clearAll } = await req.json();
    if (clearAll) {
      cart.items = [];
      cart.discountPrice = 0;
    } else if (productId) {
      cart.items = cart.items.filter(
        (item) => item.product.toString() !== productId
      );
      if (cart.items.length === 0) {
        cart.discountPrice = 0;
      }
    } else {
      return NextResponse.json(
        { error: "درخواست نامعتبر است" },
        { status: 400 }
      );
    }

    await cart.save();

    const updatedCart = await Cart.findOne(
      session?.user ? { user: session.user.id } : { guestSessionId }
    ).populate({
      path: "items.product",
      select: "name price discountedPrice imageUrl fileType",
    });
    if (updatedCart) {
      updatedCart.items = updatedCart.items.filter((item) => item.product);
      await updatedCart.save();
    }

    response = NextResponse.json(updatedCart || cart);
    if (!session?.user && guestSessionId) {
      response.cookies.set("guestSessionId", guestSessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
        sameSite: "lax",
      });
    }

    return response;
  } catch (error) {
    console.error("Error in DELETE /api/cart:", error.message, error.stack);
    return NextResponse.json(
      { error: "خطایی در حذف محصول از سبد خرید رخ داده است" },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  try {
    await connectToDatabase();
    const session = await getServerSession({ req, ...authOptions });

    let cart;
    let response = NextResponse.json({});
    let guestSessionId = null;

    if (session && session.user) {
      if (session.user.role === "admin") {
        return NextResponse.json(
          { error: "ادمین‌ها نمی‌توانند سبد خرید داشته باشند" },
          { status: 403 }
        );
      }
      cart = await Cart.findOne({ user: session.user.id });
    } else {
      guestSessionId = getOrCreateGuestSessionId(req);
      cart = await Cart.findOne({ guestSessionId });
    }

    const { discountPrice } = await req.json();
    if (typeof discountPrice !== "number" || discountPrice < 0) {
      return NextResponse.json(
        { error: "مقدار تخفیف نامعتبر است" },
        { status: 400 }
      );
    }

    if (!cart) {
      cart = new Cart({
        user: session?.user?.id || null,
        guestSessionId: !session?.user ? guestSessionId : null,
        items: [],
        discountPrice: 0,
      });
    }

    cart.discountPrice = discountPrice;
    await cart.save();

    const updatedCart = await Cart.findOne(
      session?.user ? { user: session.user.id } : { guestSessionId }
    ).populate({
      path: "items.product",
      select: "name price discountedPrice imageUrl fileType",
    });
    if (updatedCart) {
      updatedCart.items = updatedCart.items.filter((item) => item.product);
      await updatedCart.save();
    }

    response = NextResponse.json(updatedCart || cart);
    if (!session?.user && guestSessionId) {
      response.cookies.set("guestSessionId", guestSessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
        sameSite: "lax",
      });
    }

    return response;
  } catch (error) {
    console.error("Error in PATCH /api/cart:", error.message, error.stack);
    return NextResponse.json(
      { error: "خطایی در به‌روزرسانی سبد خرید رخ داده است" },
      { status: 500 }
    );
  }
}

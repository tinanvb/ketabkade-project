"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { FaCartPlus, FaCheck, FaHeadphones, FaUser } from "react-icons/fa";
import { useCart } from "@/app/context/CartContext";
import { useSession } from "next-auth/react";

const ProductCard = ({ product }) => {
  const { cart, addToCart } = useCart();
  const { data: session } = useSession();
  const [localError, setLocalError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);

  // چک کردن سبد خرید

  useEffect(() => {
    if (
      cart &&
      Array.isArray(cart.items) &&
      cart.items.every((item) => item.product)
    ) {
      setIsInCart(
        cart.items.some((item) => item.product?._id === product?._id)
      );
    } else {
      setIsInCart(false);
    }
  }, [cart, product?._id]);

  // چک کردن خرید قبلی
  useEffect(() => {
    if (session?.user && session.user.role !== "admin") {
      const checkPurchase = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/order/check?productId=${product._id}`, {
            credentials: "include",
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          setHasPurchased(data.hasPurchased);
        } catch (error) {
          console.error("Error checking purchase:", error);
          setLocalError("خطا در بررسی وضعیت خرید");
        } finally {
          setLoading(false);
        }
      };
      checkPurchase();
    }
  }, [session, product._id]);

  const hasDiscount =
    typeof product.discountedPrice === "number" &&
    product.discountedPrice > 0 &&
    product.discountedPrice < product.price;

  const finalPrice = hasDiscount
    ? product.price - product.discountedPrice
    : product.price;

  const handleAddToCart = async () => {
    if (session?.user?.role === "admin") {
      setLocalError("ادمین‌ها نمی‌توانند به سبد خرید اضافه کنند");
      return;
    }

    console.log("Product ID:", product._id); // لاگ برای دیباگ
    setLocalError(null);
    setCartLoading(true);
    try {
      await addToCart({
        id: product._id,
        name: product.name,
        price: product.price,
        discountedPrice: product.discountedPrice || 0,
        imageUrl: product.imageUrl,
      });
    } catch (err) {
      setLocalError(err.message || "افزودن به سبد خرید با خطا مواجه شد");
      console.error("Add to cart error:", err.message);
    } finally {
      setCartLoading(false);
    }
  };
  let buttonContent;
  if (hasPurchased) {
    buttonContent = (
      <Link className="link-product" href="/orders">
        <button
          className="product-card-btn add-to-order-btn mt-2"
          disabled={loading}
          title="رفتن به سفارشات و خواندن"
          aria-label="رفتن به سفارشات و خواندن"
        >
          رفتن به سفارشات و خواندن
        </button>
      </Link>
    );
  } else if (isInCart) {
    buttonContent = (
      <button
        className="product-card-btn added-to-cart-btn mt-2 "
        disabled={loading || cartLoading}
        title="به سبد خرید افزوده شد "
        aria-label="افزوده شد "
      >
        افزوده شد <FaCheck />
      </button>
    );
  } else {
    buttonContent = (
      <button
        onClick={handleAddToCart}
        disabled={loading || cartLoading || session?.user?.role === "admin"}
        className="product-card-btn mt-2 "
        title="افزودن به سبد خرید"
        aria-label="افزودن به سبد خرید"
      >
        {cartLoading ? "در حال افزودن..." : <FaCartPlus />}
      </button>
    );
  }

  return (
    <section className="item">
      <section className="lazyload-item-wrapper">
        <section className="product flex flex-column items-center align-items-center">
          <Link
            className="product-link w-full"
            href={`/products/${product._id}`}
          >
            <section className="product-image relative">
              <Image
                src={product.imageUrl}
                alt={product.name || "محصول"}
                width={200}
                height={250}
                className="object-cover w-full"
                priority
              />
              {(product.fileType === "mp3" || product.fileType === "wav") && (
                <FaHeadphones
                  className="audio-icon absolute top-2 right-2"
                  title="محصول صوتی"
                  aria-label="محصول صوتی"
                />
              )}
            </section>
            <section className="mt-3">
              <h6 className="product-name">
                {product.name.length > 25
                  ? product.name.slice(0, 25) + "..."
                  : product.name}
              </h6>
              <p className="product-author flex items-center justify-center gap-1">
                <FaUser className="mx-1" title="نویسنده" aria-label="نویسنده" />
                {product.author ? product.author : "ناشناس"}
              </p>
            </section>
            <section className="product-price-wrapper flex items-center justify-center gap-2 mt-1">
              {hasDiscount ? (
                <>
                  <span className="product-price old-price line-through text-gray-500">
                    {product.price.toLocaleString()} تومان
                  </span>
                  <span className="product-price discounted-price font-bold text-red-600">
                    {finalPrice.toLocaleString()} تومان
                  </span>
                </>
              ) : (
                <span className="product-price font-bold">
                  {finalPrice === 0
                    ? "رایگان"
                    : `${finalPrice.toLocaleString()} تومان`}
                </span>
              )}
            </section>
          </Link>
          {buttonContent}
          {localError && <p className="text-danger mt-2">{localError}</p>}
        </section>
      </section>
    </section>
  );
};

export default ProductCard;

"use client";
import { useCart } from "@/app/context/CartContext";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FaCartPlus, FaCheck } from "react-icons/fa";

const AddToCartButton = ({ productId, productDetails }) => {
  const { cart, addToCart, error } = useCart();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [isInCart, setIsInCart] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);

  // چک کردن سبد خرید
  useEffect(() => {
    console.log("Cart in AddToCartButton:", cart);
    if (cart && Array.isArray(cart.items)) {
      setIsInCart(cart.items.some((item) => item.product?._id === productId));
    } else {
      setIsInCart(false);
    }
  }, [cart, productId]);

  // چک کردن خرید قبلی
  useEffect(() => {
    if (status === "authenticated" && session?.user && session.user.role !== "admin") {
      const checkPurchase = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/order/check?productId=${productId}`, {
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
  }, [session, status, productId]);

  const handleAddToCart = async () => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      setLocalError("ادمین‌ها نمی‌توانند به سبد خرید اضافه کنند");
      return;
    }

    setLoading(true);
    setLocalError(null);

    try {
      await addToCart({
        id: productId,
        name: productDetails.name,
        price: productDetails.price,
        discountedPrice: productDetails.discountedPrice || 0,
        imageUrl: productDetails.imageUrl,
      });
    } catch (err) {
      setLocalError(err.message || "خطا در افزودن به سبد خرید");
    } finally {
      setLoading(false);
    }
  };

  let buttonContent;
  if (status === "loading") {
    buttonContent = (
      <button
        className="product-card-btn mt-2"
        disabled
        title="در حال بارگذاری..."
        aria-label="در حال بارگذاری"
      >
        در حال بارگذاری...
      </button>
    );
  } else if (hasPurchased) {
    buttonContent = (
      <Link href="/orders">
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
        className="product-card-btn added-to-cart-btn mt-2"
        disabled={loading}
        title="به سبد خرید افزوده شد"
        aria-label="افزوده شد"
      >
        افزوده شد <FaCheck />
      </button>
    );
  } else {
    const isAdmin = status === "authenticated" && session?.user?.role === "admin";
    buttonContent = (
      <button
        onClick={handleAddToCart}
        disabled={loading || isAdmin}
        className="product-card-btn mt-2 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
        title={isAdmin ? "ادمین‌ها نمی‌توانند به سبد خرید اضافه کنند" : "افزودن به سبد خرید"}
        aria-label={isAdmin ? "غیرفعال برای ادمین" : "افزودن به سبد خرید"}
      >
        {loading ? "در حال افزودن..." : <FaCartPlus />}
      </button>
    );
  }

  return (
    <section>
      {buttonContent}
      {localError && <p className="text-danger mt-2">{localError}</p>}
      {error && <p className="text-danger mt-2">{error}</p>}
    </section>
  );
};

export default AddToCartButton;
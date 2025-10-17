"use client";
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], discountPrice: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingItem, setUpdatingItem] = useState(null);
  const isUpdating = useRef(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return; 
    async function fetchCart() {
      if (status === "authenticated" && session?.user?.role === "admin") {
        console.log("Admin user, skipping cart fetch");
        setCart({ items: [], discountPrice: 0 });
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const res = await fetch("/api/cart", { credentials: "include" });
        if (!res.ok) {
          const errorData = await res.json();
          setError(errorData.error || "لطفا وارد حساب کاربری خود شوید");
          setCart({ items: [], discountPrice: 0 });
          return;
        }

        const data = await res.json();
        setCart({
          items: Array.isArray(data.items) ? data.items : [],
          discountPrice: data.discountPrice || 0,
        });
      } catch (error) {
        setError("خطایی در دریافت سبد خرید رخ داده است");
        setCart({ items: [], discountPrice: 0 });
      } finally {
        setLoading(false);
      }
    }

    async function mergeCart() {
      if (status === "authenticated" && session?.user?.role !== "admin") {
        try {
          const res = await fetch("/api/cart/merge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });
          if (res.ok) {
            const updatedCart = await res.json();
            setCart(updatedCart);
          } else {
            const errorData = await res.json();
            setError(errorData.error || "خطایی در ادغام سبد خرید رخ داده است");
          }
        } catch (error) {
          setError("خطایی در ادغام سبد خرید رخ داده است");
        }
      }
    }

    if (status !== "loading") {
      fetchCart();
      if (status === "authenticated" && session?.user?.role !== "admin") {
        mergeCart();
      }
    }
  }, [status, session?.user?.role]);

  // ... بقیه کدها بدون تغییر
  async function updateCart() {
    if (isUpdating.current) return;
    isUpdating.current = true;
    try {
      const res = await fetch("/api/cart", { credentials: "include" });
      if (res.ok) {
        const updatedCart = await res.json();
        if (
          !updatedCart.items ||
          !updatedCart.items.every((item) => item.product)
        ) {
          throw new Error("داده‌های سبد خرید ناقص است");
        }
        setCart(updatedCart);
      } else {
        setError("خطا در دریافت اطلاعات سبد خرید از سرور");
      }
    } catch (error) {
      setError(error.message || "خطایی در به‌روزرسانی سبد خرید رخ داده است");
    } finally {
      isUpdating.current = false;
    }
  }

async function addToCart(product) {
  if (isUpdating.current) return;
  isUpdating.current = true;

  try {
    setUpdatingItem(product.id);
    setError(null);

    // اعتبارسنجی product.id
    if (!product.id || typeof product.id !== "string") {
      throw new Error("شناسه محصول نامعتبر است");
    }

    const newItem = {
      product: {
        _id: product.id,
        name: product.name,
        price: product.price,
        discountedPrice: product.discountedPrice || 0,
        imageUrl: product.imageUrl,
      },
    };

    setCart((prev) => {
      const items = Array.isArray(prev.items) ? prev.items : [];
      const exists = items.find((i) => i.product?._id === product.id);
      if (exists) {
        return prev;
      }
      return {
        ...prev,
        items: [...items, newItem],
      };
    });

    console.log("Sending request to /api/cart with productId:", product.id);
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id }),
      credentials: "include",
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Server error:", errorData);
      throw new Error(errorData.error || "مشکلی در اضافه کردن به سبد خرید پیش آمده است");
    }

    const updatedCart = await res.json();
    setCart({
      items: Array.isArray(updatedCart.items) ? updatedCart.items : [],
      discountPrice: updatedCart.discountPrice || 0,
    });
  } catch (error) {
    setError(error.message || "مشکلی در اضافه کردن به سبد خرید پیش آمده است");
    setCart((prev) => ({
      ...prev,
      items: (Array.isArray(prev.items) ? prev.items : []).filter(
        (item) => item.product?._id !== product.id
      ),
    }));
  } finally {
    setUpdatingItem(null);
    isUpdating.current = false;
  }
}
  async function removeFromCart(productId) {
    if (isUpdating.current) return;
    isUpdating.current = true;

    try {
      setUpdatingItem(productId);
      setError(null);

      setCart((prev) => {
        const newItems = prev.items.filter(
          (item) => item.product?._id !== productId
        );
        return {
          ...prev,
          items: newItems,
          discountPrice: newItems.length === 0 ? 0 : prev.discountPrice,
        };
      });

      const res = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "مشکلی در حذف محصول پیش آمده است");
      }

      const updatedCart = await res.json();
      setCart(updatedCart);
    } catch (error) {
      setError(error.message || "مشکلی در حذف محصول پیش آمده است");
      await updateCart();
    } finally {
      setUpdatingItem(null);
      isUpdating.current = false;
    }
  }

  async function clearCart() {
    if (isUpdating.current) return;
    isUpdating.current = true;

    try {
      setCart({ items: [], discountPrice: 0 });

      const res = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clearAll: true }),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error || "مشکلی در خالی کردن سبد پیش آمده است"
        );
      }

      const updatedCart = await res.json();
      setCart(updatedCart);
    } catch (error) {
      setError(error.message || "مشکلی در خالی کردن سبد پیش آمده است");
      await updateCart();
    } finally {
      isUpdating.current = false;
    }
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        error,
        setError,
        loading,
        updatingItem,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

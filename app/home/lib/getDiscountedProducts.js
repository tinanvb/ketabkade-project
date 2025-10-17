export async function getDiscountedProducts(filters = {}, sortOrder = "asc") {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products`, {
    cache: "no-cache",
  });

  if (!res.ok) {
    throw new Error("خطا در دریافت محصولات تخفیف‌دار");
  }

  let products = await res.json();

  if (!Array.isArray(products)) {
    throw new Error("فرمت داده‌ها نامعتبر است");
  }

  // فیلتر کردن محصولات
  products = products.filter((product) => {
    // فقط محصولات تخفیف‌دار معتبر
    if (!product.saleStatus) return false;
    if (!product.discountedPrice || product.discountedPrice <= 0) return false;
    if (product.discountedPrice >= product.price) return false;

    // ✅ فیلتر قیمت
    if (filters.minPrice && product.price < Number(filters.minPrice)) return false;
    if (filters.maxPrice && product.price > Number(filters.maxPrice)) return false;

    // ✅ فیلتر تگ (پشتیبانی هم از name هم از id)
    if (filters.tag) {
      const tagMatch = product.tags?.some(
        (t) => t === filters.tag || t._id === filters.tag
      );
      if (!tagMatch) return false;
    }

    // ✅ فیلتر نویسنده (پشتیبانی از رشته یا آرایه)
    if (filters.author) {
      if (Array.isArray(product.author)) {
        if (!product.author.some((a) => a.includes(filters.author))) return false;
      } else {
        if (!product.author?.includes(filters.author)) return false;
      }
    }

    return true;
  });

  return products;
}

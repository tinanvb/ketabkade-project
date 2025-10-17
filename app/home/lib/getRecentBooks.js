export async function getRecentBooks(filters = {}, sortOrder = "asc") {
  try {
    const [productsRes, categoriesRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products`, {
        cache: "no-cache",
      }),
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/categories`),
    ]);

    if (!productsRes.ok) throw new Error("خطا در دریافت کتاب‌ها");
    if (!categoriesRes.ok) throw new Error("خطا در دریافت دسته‌ها");

    const [products, categories] = await Promise.all([
      productsRes.json(),
      categoriesRes.json(),
    ]);

    if (!Array.isArray(products))
      throw new Error("فرمت داده‌های کتاب‌ها نامعتبر است");
    if (!Array.isArray(categories))
      throw new Error("فرمت داده‌های دسته‌ها نامعتبر است");

    // پیدا کردن دسته صوتی
    const audioCategory = categories.find(
      (cat) => cat.name.trim() === "صوتی" || cat.name.trim() === "کتاب صوتی"
    );

    // فیلتر اولیه
    let filtered = products.filter((book) => {
      const categoryId =
        typeof book.category === "object" ? book.category?._id : book.category;

      if (!book.saleStatus) return false;
      if (audioCategory && String(categoryId) === String(audioCategory._id))
        return false;
      if (filters.minPrice && book.price < Number(filters.minPrice))
        return false;
      if (filters.maxPrice && book.price > Number(filters.maxPrice))
        return false;
      if (filters.tag && !book.tags?.includes(filters.tag)) return false;
      if (
        filters.author &&
        (!book.author || !book.author.includes(filters.author))
      )
        return false;

      return true;
    });
    return filtered;
  } catch (error) {
    console.error("خطا در دریافت کتاب‌های اخیر:", error);
    throw error;
  }
}

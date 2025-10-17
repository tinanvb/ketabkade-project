export async function getCategories() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/categories`,
    {
      cache: "force-cache",
    }
  );

  if (!res.ok) {
    throw new Error("خطا در دریافت دسته‌ها");
  }

  const categories = await res.json();

  if (!Array.isArray(categories)) {
    throw new Error("فرمت داده‌های دسته‌بندی نامعتبر است");
  }

  return categories;
}

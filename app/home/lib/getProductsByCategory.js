// /app/home/lib/getProductsByCategory.js
export async function getProductsByCategory(filters = {}, sortOrder = "") {
  const queryParams = new URLSearchParams();

  // اضافه کردن category و سایر فیلترها
  Object.keys(filters).forEach((key) => {
    if (filters[key] != null) queryParams.append(key, filters[key]);
  });

  if (sortOrder) queryParams.append("sortOrder", sortOrder);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/categories`,
    {
      cache: "force-cache",
    }
  );

  if (!res.ok) throw new Error("خطا در دریافت محصولات");

  const data = await res.json();
  if (!Array.isArray(data)) throw new Error("فرمت داده‌های محصول نامعتبر است");

  return data;
}

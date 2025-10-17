export async function getRelatedProducts(categoryId) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/byCategoryId?id=${categoryId}`,
      { cache: "no-cache" }
    );

    if (!res.ok) throw new Error("خطا در دریافت محصولات مرتبط");

    return res.json();
  } catch (error) {
    console.error("Error in getRelatedProducts:", error);
    return [];
  }
}

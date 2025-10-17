export async function getFeaturedProducts() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/featured`,
    {
      cache: "force-cache",
    }
  );

  if (!res.ok) {
    throw new Error("مشکلی در دریافت محصولات پربازدید رخ داده است");
  }

  return res.json();
}

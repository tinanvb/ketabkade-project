export const getAudioBooks = async (filters = {}, sortOrder = "asc") => {
  const res = await fetch("/api/products"); // یا مسیر مناسب
  if (!res.ok) throw new Error("خطا در دریافت محصولات");
  let products = await res.json();

  let filtered = products.filter((book) => {
    if (!book.saleStatus) return false;
    if (book.fileType !== "mp3" && book.fileType !== "wav") return false;
    if (filters.minPrice && book.price < Number(filters.minPrice)) return false;
    if (filters.maxPrice && book.price > Number(filters.maxPrice)) return false;
    if (filters.tag && !book.tags?.includes(filters.tag)) return false;
    if (
      filters.author &&
      (!book.author || !book.author.includes(filters.author))
    )
      return false;

    return true;
  });
  return filtered;
};
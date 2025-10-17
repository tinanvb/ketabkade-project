const getProductsByTag = async (tag, filters = {}) => {
  const res = await fetch(`/api/products/byTag?q=${encodeURIComponent(tag)}`);
  if (!res.ok) throw new Error("خطا در دریافت محصولات");
  let products = await res.json();

  return products.filter((p) => {
    if (!p.saleStatus) return false;
    if (filters.minPrice && p.price < Number(filters.minPrice)) return false;
    if (filters.maxPrice && p.price > Number(filters.maxPrice)) return false;
    if (filters.author && (!p.author || !p.author.includes(filters.author))) return false;
    return true;
  });
};

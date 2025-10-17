const getProductsByAuthor = async (author, filters = {}) => {
    const res = await fetch(`/api/products/byAuthor?q=${encodeURIComponent(author)}`);
    if (!res.ok) throw new Error("خطا در دریافت محصولات");
  
    let products = await res.json();
  
    return products.filter((p) => {
      if (!p.saleStatus) return false;
      if (filters.minPrice && p.price < Number(filters.minPrice)) return false;
      if (filters.maxPrice && p.price > Number(filters.maxPrice)) return false;
      if (filters.tag && !p.tags?.includes(filters.tag)) return false;
      return true;
    });
  };
  
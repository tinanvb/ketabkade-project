"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
import ProductCard from "@/app/components/home/ProductCard";
import ProductPageWrapper from "@/app/components/home/ProductPageWrapper";
import Pagination from "@/app/components/home/Pagination";
import { usePageLoader } from "@/app/context/PageLoaderProvider";
import { Col, Row } from "react-bootstrap";

// فانکشن کمکی برای گرفتن محصولات بر اساس تگ
const getProductsByTag = async (tag, filters = {}) => {
  const res = await fetch(`/api/products/byTag?q=${encodeURIComponent(tag)}`);
  if (!res.ok) throw new Error("خطا در دریافت محصولات");

  let products = await res.json();

  if (!Array.isArray(products)) return [];

  // اعمال فیلترهای اضافی (مثل قیمت، نویسنده و غیره)
  products = products.filter((p) => {
    if (filters.minPrice && p.price < Number(filters.minPrice)) return false;
    if (filters.maxPrice && p.price > Number(filters.maxPrice)) return false;
    if (filters.author && (!p.author || !p.author.includes(filters.author)))
      return false;
    return true;
  });

  return products;
};

const ProductsByTag = () => {
  const { startLoading, stopLoading } = usePageLoader();
  const searchParams = useSearchParams();
  const tagQuery = searchParams.get("q") || "";

  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 9;
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  useEffect(() => {
    const fetchProducts = async () => {
      startLoading();
      setLoading(true);

      if (!tagQuery.trim()) {
        setProducts([]);
        setLoading(false);
        stopLoading();
        return;
      }

      try {
        const data = await getProductsByTag(tagQuery, filters);
        setProducts(data);
        setCurrentPage(1);
      } catch (err) {
        console.error("خطا در دریافت محصولات:", err);
        setProducts([]);
      } finally {
        setLoading(false);
        stopLoading();
      }
    };

    fetchProducts();
  }, [tagQuery, filters]);

  if (loading) {
    return (
      <ProductPageWrapper>
        <p className="text-center p-6">در حال بارگذاری...</p>
      </ProductPageWrapper>
    );
  }

  return (
    <div className="d-flex flex-column flex-md-row mt-4">

      <Col md={3}>
        <ProductPageWrapper
          fetchFunction={() => getProductsByTag(tagQuery, filters)}
          onProductsChange={setProducts}
          initialFilters={filters}
          showAuthor={true}
          showCategory={false}
          onFilterChange={setFilters}
        />
      </Col>
      <Col md={9}>
        <section className="books-container">
          <section className="content-wrapper p-3">
            <section className="books-header">
              <h5 className="content-header-title">
                محصولات با برچسب:{" "}
                <span className="custom-name-query">{tagQuery}</span>
              </h5>
              <Link href="/" className="viwe">
                <span>بازگشت به صفحه اصلی</span> <FaArrowRight />
              </Link>
            </section>

            {products.length === 0 ? (
              <p className="status-message">محصولی با این برچسب یافت نشد.</p>
            ) : (
              <>
                <section className="books-grid">
                  {currentProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </section>
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            )}
          </section>
        </section>
      </Col>
    </div>
  );
};

export default ProductsByTag;

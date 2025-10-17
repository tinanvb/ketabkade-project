"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
import ProductCard from "@/app/components/home/ProductCard";
import ProductPageWrapper from "@/app/components/home/ProductPageWrapper";
import Pagination from "@/app/components/home/Pagination";
import { Col, Row } from "react-bootstrap";
import { usePageLoader } from "@/app/context/PageLoaderProvider";

// فانکشن کمکی برای گرفتن محصولات بر اساس نویسنده
const getProductsByAuthor = async (author, filters = {}) => {
  const res = await fetch(`/api/products/byAuthor?q=${encodeURIComponent(author)}`);
  if (!res.ok) throw new Error("خطا در دریافت محصولات");

  let products = await res.json();
  if (!Array.isArray(products)) return [];

  // اعمال فیلترهای اضافی (مثل قیمت، تگ و غیره)
  products = products.filter((p) => {
    if (filters.minPrice && p.price < Number(filters.minPrice)) return false;
    if (filters.maxPrice && p.price > Number(filters.maxPrice)) return false;
    if (filters.tag && !p.tags?.includes(filters.tag)) return false;
    return true;
  });

  return products;
};

const ProductsByAuthor = () => {
  const { startLoading, stopLoading } = usePageLoader();
  const searchParams = useSearchParams();
  const authorQuery = searchParams.get("q") || "";

  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  useEffect(() => {
    if (!authorQuery.trim()) return;

    const fetchProducts = async () => {
      startLoading();
      try {
        const data = await getProductsByAuthor(authorQuery, filters);
        setProducts(data);
        
        setCurrentPage(1);
      } catch (err) {
        console.error("خطا در دریافت محصولات:", err);
        setProducts([]);
      } finally {
        stopLoading();
      }
    };

    fetchProducts();
  }, [authorQuery, filters]);

  return (
    <div className="d-flex flex-column flex-md-row mt-4">
      <Col md={3}>
        <ProductPageWrapper
          fetchFunction={() => getProductsByAuthor(authorQuery, filters)}
          onProductsChange={setProducts}
          initialFilters={filters}
          showAuthor={false}
          showCategory={true}
          onFilterChange={setFilters}
        />
      </Col>

      <Col md={9} >
        <section className="books-container">
          <section className="content-wrapper p-3">
            <section className="books-header">
              <h5 className="content-header-title">
                محصولات نویسنده: <span className="custom-name-query">{authorQuery}</span>
              </h5>
              <Link href="/" className="viwe">
                <span>بازگشت به صفحه اصلی</span> <FaArrowRight />
              </Link>
            </section>

            {products.length === 0 ? (
              <p>هیچ محصولی از این نویسنده یافت نشد.</p>
            ) : (
              <>
                <section className="books-grid">
                  {currentProducts.map((product) => (
                    <div key={product._id} className="col">
                      <ProductCard product={product} />
                    </div>
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

export default ProductsByAuthor;

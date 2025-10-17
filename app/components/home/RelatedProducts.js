"use client";
import React, { useEffect, useRef, useState } from "react";
import ProductCard from "./ProductCard";
import { getRelatedProducts } from "@/app/home/lib/getRelatedProducts";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { usePageLoader } from "@/app/context/PageLoaderProvider";

const RelatedProducts = ({ categoryId, categoryName }) => {
  const { startLoading, stopLoading } = usePageLoader();
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!categoryId || hasFetched.current) return; // اگر قبلاً fetch شده بود رد کن

    hasFetched.current = true;

    startLoading();

    const fetchRelatedProducts = async () => {
      try {
        const data = await getRelatedProducts(categoryId);
        setRelatedProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        stopLoading();
      }
    };

    fetchRelatedProducts();
  }, [categoryId]);
  
  const scroll = (direction) => {
    const container = scrollRef.current;
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === "right" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (error) return <div>خطا در بارگذاری محصولات مرتبط: {error}</div>;

  return (
    <section className="mb-3">
      <section className="container-xxl">
        <section className="row">
          <section className="col">
            <section className="content-wrapper p-3">
              <section className="content-header">
                <h2 className="content-header-title">
                  <span>محصولات مرتبط</span>
                </h2>
                <div className="text-center mt-4">
                  <Link
                    href={`/products/categories?q=${encodeURIComponent(
                      categoryName
                    )}`}
                    className="text-decoration-none"
                  >
                    <p className="viwe">
                      مشاهده همه <FaArrowLeft />
                    </p>
                  </Link>
                </div>
              </section>

              <div className="position-relative">
                <button
                  onClick={() => scroll("left")}
                  className="scroll-btn scroll-btn-right"
                >
                  {">"}
                </button>

                <div
                  className="books-scroll d-flex overflow-auto py-2"
                  ref={scrollRef}
                >
                  {relatedProducts.length ? (
                    relatedProducts.map((product) => (
                      <div
                        key={product._id}
                        style={{ minWidth: "200px", flexShrink: 0 }}
                      >
                        <ProductCard product={product} />
                      </div>
                    ))
                  ) : (
                    <div>محصولی یافت نشد</div>
                  )}
                </div>

                <button
                  onClick={() => scroll("right")}
                  className="scroll-btn scroll-btn-left"
                >
                  {"<"}
                </button>
              </div>
            </section>
          </section>
        </section>
      </section>
    </section>
  );
};

export default RelatedProducts;

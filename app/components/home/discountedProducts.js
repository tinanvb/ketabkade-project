"use client";
import React, { useEffect, useRef, useState } from "react";
import ProductCard from "./ProductCard";
import { getDiscountedProducts } from "@/app/home/lib/getDiscountedProducts";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { usePageLoader } from "@/app/context/PageLoaderProvider";

const DiscountedProducts = () => {
  const { startLoading, stopLoading } = usePageLoader();

  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    startLoading();

    const fetchDiscountedProducts = async () => {
      try {
        const data = await getDiscountedProducts();
        if (!Array.isArray(data)) {
          throw new Error("داده‌های دریافتی معتبر نیستند");
        }
        const sorted = data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 10);

        setProducts(sorted);
      } catch (err) {
        setError(err);
      } finally {
        stopLoading();
      }
    };

    fetchDiscountedProducts();
  }, []);

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
  if (error)
    return (
      <div className="status-message">خطا در بارگذاری محصولات تخفیف‌دار</div>
    );
  return (
    <section className="mb-3">
      <section className="container-xxl">
        <section className="row">
          <section className="col">
            <section className="content-wrapper p-3 ">
              <section className="content-header">
                <h2 className="content-header-title">کتاب‌های تخفیف‌دار</h2>
                <div className="text-center mt-4">
                  <Link
                    href="/products/discount"
                    className="text-decoration-none"
                  >
                    <p className="viwe">
                      مشاهده همه <FaArrowLeft />
                    </p>
                  </Link>
                </div>
              </section>

              <div className="position-relative">
                {/* دکمه سمت راست (رفتن به عقب) */}
                <button
                  onClick={() => scroll("left")}
                  className="scroll-btn scroll-btn-right"
                >
                  {">"}
                </button>

                {/* لیست محصولات */}
                <div
                  className="books-scroll d-flex overflow-auto py-2"
                  ref={scrollRef}
                >
                  {products.map((product) => (
                    <div key={product._id} className="product-item">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>

                {/* دکمه سمت چپ (رفتن به جلو) */}
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

export default DiscountedProducts;

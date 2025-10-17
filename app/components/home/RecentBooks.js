"use client";
import React, { useEffect, useRef, useState } from "react";
import ProductCard from "./ProductCard";
import { getRecentBooks } from "@/app/home/lib/getRecentBooks";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { usePageLoader } from "@/app/context/PageLoaderProvider";

const RecentBooks = () => {
  const { startLoading, stopLoading } = usePageLoader();

  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    startLoading();

    const fetchRecentBooks = async () => {
      try {
        const data = await getRecentBooks();

        const sorted = data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 10);

        setBooks(sorted);
      } catch (err) {
        setError(err);
      } finally {
        stopLoading();
      }
    };

    fetchRecentBooks();
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

  if (error) return <div className="status-message">خطا در بارگذاری کتاب‌ها</div>;

  return (
    <section className="mb-3">
      <section className="container-xxl">
        <section className="row">
          <section className="col">
            <section className="content-wrapper p-3  ">
              <section className="content-header">
              <h2 className="content-header-title">جدیدترین کتاب‌ها</h2>
                <div className="text-center mt-4">
                  <Link
                    href="/products/newest"
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
                  {books.map((book) => (
                    <div
                      key={book._id}
                      style={{ minWidth: "200px", flexShrink: 0 }}
                    >
                      <ProductCard product={book} />
                    </div>
                  ))}
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

export default RecentBooks;

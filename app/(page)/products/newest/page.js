"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
import { Col, Row } from "react-bootstrap";
import ProductCard from "@/app/components/home/ProductCard";
import ProductPageWrapper from "@/app/components/home/ProductPageWrapper";
import Pagination from "@/app/components/home/Pagination";
import { getRecentBooks } from "@/app/home/lib/getRecentBooks";

const NewBooks = () => {
  const [books, setBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({});
  const [sortOrder, setSortOrder] = useState("desc"); // جدیدترین‌ها
  const itemsPerPage = 9;

  // دریافت کتاب‌ها و اعمال فیلتر/مرتب‌سازی
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const data = await getRecentBooks(filters, sortOrder);
        setBooks(data);
        setCurrentPage(1);
      } catch (err) {
        console.error("خطا در دریافت کتاب‌ها:", err);
        setBooks([]);
      }
    };
    fetchBooks();
  }, [filters, sortOrder]);

  const totalPages = Math.ceil(books.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBooks = books.slice(startIndex, endIndex);

  return (
    <div className="d-flex flex-column flex-md-row mt-4">
      <Col md={3}>
        <ProductPageWrapper
          fetchFunction={getRecentBooks}
          onProductsChange={setBooks}
          initialFilters={filters}
          showCategory={true}
          showAuthor={true}
        />
      </Col>
      <Col md={9}>
        <section className="books-container">
          <section className="content-wrapper p-3">
            <section className="books-header">
              <h2 className="content-header-title">جدیدترین کتاب‌ها</h2>
              <Link href="/" className="viwe">
                <span>بازگشت به صفحه اصلی</span> <FaArrowRight />
              </Link>
            </section>

            {books.length === 0 ? (
              <p>هیچ کتابی یافت نشد.</p>
            ) : (
              <>
                <section className="books-grid">
                  {currentBooks.map((book) => (
                    <ProductCard key={book._id} product={book} />
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

export default NewBooks;
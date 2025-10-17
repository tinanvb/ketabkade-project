"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
import { Col, Row } from "react-bootstrap";
import ProductCard from "@/app/components/home/ProductCard";
import ProductPageWrapper from "@/app/components/home/ProductPageWrapper";
import Pagination from "@/app/components/home/Pagination";
import { getAudioBooks } from "@/app/home/lib/getAudioBooks";

const AudioBooks = () => {
  const [books, setBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({});
  const itemsPerPage = 9;

  useEffect(() => {
    const fetchBooks = async () => {
      const data = await getAudioBooks();
      const filtered = data.filter(
        (item) => item.fileType === "mp3" || item.fileType === "wav"
      );
      const sorted = filtered.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setBooks(sorted);
    };
    fetchBooks();
  }, []);
  const totalPages = Math.ceil(books.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBooks = books.slice(startIndex, endIndex);

  return (
    <div className="d-flex flex-column flex-md-row mt-4">
      <Col md={3}>
        
        <ProductPageWrapper
          fetchFunction={getAudioBooks}
          onProductsChange={setBooks}
          initialFilters={filters}
          showAuthor={true}
          showCategory={true}
        />
      </Col>

      <Col md={9}>
        <section className="books-container">
          <section className="content-wrapper p-3">
            <section className="books-header">
              <h2 className="content-header-title">
                <p>کتاب‌های صوتی</p>
              </h2>
              <Link href="/" className="viwe">
                <span>بازگشت به صفحه اصلی</span> <FaArrowRight />
              </Link>
            </section>

            {books.length === 0 ? (
              <p>هیچ کتاب صوتی یافت نشد.</p>
            ) : (
              <>
                <section className="books-grid">
                  {currentBooks.map((book) => (
                    <div className="col" key={book._id}>
                      <ProductCard product={book} />
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

export default AudioBooks;
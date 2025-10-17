"use client";

import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <section className="pagination">
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className="pagination-button"
      >
        {"<<"}
      </button>

      <span className="pagination-info">
        صفحه {currentPage} از {totalPages}
      </span>

      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="pagination-button"
      >
        {">>"}
      </button>
    </section>
  );
};

export default Pagination;

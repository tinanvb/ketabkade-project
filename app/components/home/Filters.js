"use client";
import React, { useState } from "react";

const Filters = ({
  tags = [],
  onFilterChange,
  showCategory = true,
  showAuthor = true,
}) => {
  const [author, setAuthor] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [tag, setTag] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange({
      author: showAuthor ? author : "", // ✅ فقط وقتی showAuthor فعال باشه
      minPrice,
      maxPrice,
      tag: showCategory ? tag : "", // ✅ فقط وقتی showCategory فعال باشه
    });
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded p-3">
      {/* ✅ فیلتر نویسنده فقط وقتی showAuthor فعال باشه */}
      {showAuthor && (
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="نویسنده"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </div>
      )}

      {showCategory && (
        <div className="mb-3">
          <select
            className="form-select"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
          >
            <option value="">فیلتر محصول</option>
            {tags.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* فیلتر قیمت */}
      <div className="mb-3 mt-4">
        <label className="form-label">محدوده قیمت:</label>
        <div className="mb-3 mt-2">
          <div className="mb-3 d-flex">
            <input
              type="text"
              className="form-control text-center me-3"
              placeholder="حداقل قیمت"
              value={minPrice ? Number(minPrice).toLocaleString() : ""}
              onChange={(e) => {
                const value = e.target.value.replace(/,/g, "");
                if (!isNaN(value)) setMinPrice(value);
              }}
            />
            <span className="mt-1">تومان</span>
          </div>
          <div className="d-flex">
            <input
              type="text"
              className="form-control text-center me-3"
              placeholder="حداکثر قیمت"
              value={maxPrice ? Number(maxPrice).toLocaleString() : ""}
              onChange={(e) => {
                const value = e.target.value.replace(/,/g, "");
                if (!isNaN(value)) setMaxPrice(value);
              }}
            />
            <span className="mt-1">تومان</span>
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="bg-cart text-white text-decoration-none text-center border-0 w-100 p-2 rounded-2 mt-2"
      >
        اعمال فیلتر
      </button>
    </form>
  );
};

export default Filters;
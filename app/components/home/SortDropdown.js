import React from "react";
import { BiSortAlt2 } from "react-icons/bi";

const SortDropdown = ({ onSortChange }) => {
  const handleChange = (e) => {
    onSortChange(e.target.value);
  };

  return (
    <div className="d-flex flex-sm-row flex-md-column flex-xl-row align-items-start align-items-sm-center gap-2 mb-3">
      <div className="d-flex align-items-center gap-2">
        <BiSortAlt2 />
        <label className="mb-0 header-text">
          <strong>مرتب‌سازی</strong>
        </label>
      </div>
      <select
        className="form-select w-auto px-5 mt-2 mt-sm-0 me-0 me-sm-3 border-2"
        onChange={handleChange}
      >
        <option value="">انتخاب کنید</option>
        <option value="discount">تخفیف دار</option>
        <option value="priceAsc">ارزان‌ترین</option>
        <option value="priceDesc">گران‌ترین</option>
        <option value="newest">جدیدترین</option>
        <option value="alphabet">حروف الفبا</option>
      </select>
    </div>
  );
};

export default SortDropdown;

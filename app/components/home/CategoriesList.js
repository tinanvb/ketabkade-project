"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import * as FaIcons from "react-icons/fa";
import { usePageLoader } from "@/app/context/PageLoaderProvider";

const allowedCategories = [
  "صوتی",
  "رمان",
  "سرگرمی",
  "زبان خارجی",
  "کودک و نوجوان",
  "داستان کوتاه",
];

const iconMap = {
  صوتی: FaIcons.FaHeadphonesAlt,
  رمان: FaIcons.FaPenFancy,
  سرگرمی: FaIcons.FaGamepad,
  "زبان خارجی": FaIcons.FaLanguage,
  "داستان کوتاه": FaIcons.FaBookOpen,
  "کودک و نوجوان": FaIcons.FaChild,
  "کتاب درسی": FaIcons.FaGraduationCap,
};

const CategoriesList = () => {
  const { startLoading, stopLoading } = usePageLoader();
  const [categories, setCategories] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const router = useRouter();

  // بارگذاری دسته‌ها
  useEffect(() => {
    startLoading();
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        const filtered = data.filter((cat) =>
          allowedCategories.includes(cat.name)
        );
        setCategories(filtered);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        stopLoading();
      }
    };
    fetchCategories();
  }, []);

  // اسلاید خودکار دسته‌ها
  useEffect(() => {
    if (categories.length < 1 || isPaused) return;

    const interval = setInterval(() => {
      setStartIndex((prevIndex) => (prevIndex + 5) % categories.length);
    }, 2000); // هر 2 ثانیه تغییر کند

    return () => clearInterval(interval);
  }, [categories, isPaused]);

  const handleCategoryClick = (name) => {
    router.push(`/products/categories?q=${encodeURIComponent(name)}`);
  };

  // دسته‌های قابل نمایش (برای اسلاید بی‌نهایت)
  const visibleCategories = useMemo(() => {
    return [...categories, ...categories].slice(startIndex, startIndex + 5);
  }, [categories, startIndex]);

  if (categories.length === 0) return null;

  return (
    <div className="content-wrapper categories-list py-4 px-4 rounded-2 mx-3">
    <h6 className="text-center header-style" >
        دسته بندی منتخب
      </h6>
      <div
        style={{
          display: "flex",
          gap: "7rem",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {visibleCategories.length > 0 ? (
          visibleCategories.map((cat, idx) => {
            const Icon = iconMap[cat.name] || FaIcons.FaBook;
            return (
              <button
                key={`${cat._id}-${idx}`}
                onClick={() => handleCategoryClick(cat.name)}
                className="category-button"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                <div className="icon-wrapper">
                  <Icon size={48} />
                </div>
                <span className="category-label">{cat.name}</span>
              </button>
            );
          })
        ) : (
          <p className="status-message">در حال بارگذاری...</p>
        )}
      </div>
    </div>
  );
};

export default CategoriesList;

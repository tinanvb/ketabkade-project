"use client";

import React, { useEffect, useState } from "react";
import { usePageLoader } from "@/app/context/PageLoaderProvider";

function formatJalali(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);
  try {
    const formatter = new Intl.DateTimeFormat("fa-IR-u-nu-latn", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return formatter.format(date);
  } catch {
    return date.toLocaleDateString();
  }
}

const Rules = () => {
  const { startLoading, stopLoading } = usePageLoader();

  const [rulesHtml, setRulesHtml] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    startLoading();
    fetch("/api/settings")
      .then((res) => {
        if (!res.ok) throw new Error("خطا در دریافت اطلاعات");
        return res.json();
      })
      .then((data) => {
        setRulesHtml(data.rules || "<p>محتوایی یافت نشد.</p>");
        setUpdatedAt(data.updatedAt || null);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        stopLoading();
      });
  }, []);

  if (error) return <p className="text-center py-5 text-danger">{error}</p>;

  return (
    <div className="rules pb-5 px-4 px-md-5">
      {updatedAt && (
        <p className="text-sm text-gray-500 mt-md-5 mb-md-4 mt-4 mb-3">
          آخرین بروز رسانی : {formatJalali(updatedAt)}
        </p>
      )}
      <h1 className="font-bold mb-4">شرایط استفاده از خدمات</h1>

      <div dangerouslySetInnerHTML={{ __html: rulesHtml }} />
    </div>
  );
};

export default Rules;

"use client";
import React, { useEffect, useState } from "react";
import { usePageLoader } from "@/app/context/PageLoaderProvider";

const Privacy = () => {
  const { startLoading, stopLoading } = usePageLoader();

  const [privacyHtml, setPrivacyHtml] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    startLoading();
    fetch("/api/settings")
      .then((res) => {
        if (!res.ok) throw new Error("خطا در دریافت اطلاعات");
        return res.json();
      })
      .then((data) => {
        setPrivacyHtml(data.privacy || "<p>محتوایی یافت نشد.</p>");
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
    <div className="privacy pb-5 px-4 px-md-5">
      <h1 className="font-bold mb-4 mt-5">حریم خصوصی</h1>

      <div dangerouslySetInnerHTML={{ __html: privacyHtml }} />
    </div>
  );
};

export default Privacy;

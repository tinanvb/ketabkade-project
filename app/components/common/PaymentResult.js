// components/common/PaymentResult.js
"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function PaymentResult({
  status,
  amount,
  ref,
  transactionType = "order", // پیش‌فرض order
  redirectTo = "/user/wallet",
}) {
  const isSuccess = status === "success";

  // تنظیم متن‌ها بر اساس transactionType
  const title = isSuccess
    ? transactionType === "order"
      ? "پرداخت سفارش موفق"
      : "شارژ کیف پول موفق"
    : transactionType === "order"
      ? "پرداخت سفارش ناموفق"
      : "شارژ کیف پول ناموفق";

  const message = isSuccess
    ? transactionType === "order"
      ? "سفارش شما با موفقیت پرداخت شد."
      : "کیف پول شما با موفقیت شارژ شد."
    : transactionType === "order"
      ? "متاسفانه پرداخت سفارش شما انجام نشد."
      : "متاسفانه شارژ کیف پول شما انجام نشد.";

  const textClass = isSuccess ? "text-success" : "text-danger";
  const btnClass = isSuccess ? "btn btn-success w-100" : "btn btn-danger w-100";
  const buttonText = transactionType === "order" ? "مشاهده سفارش‌ها" : "بازگشت به کیف پول";

  useEffect(() => {
    // جلوگیری از بازگشت به صفحه قبلی
    window.history.replaceState(null, "", window.location.href);

    const preventBack = () => {
      window.location.replace(redirectTo);
    };

    window.addEventListener("popstate", preventBack);

    return () => {
      window.removeEventListener("popstate", preventBack);
    };
  }, [redirectTo]);

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div
        className="card shadow-sm border-0 p-4"
        style={{ maxWidth: "500px", width: "100%" }}
      >
        <div className="text-center mb-3">
          <h2 className={`fw-bold ${textClass}`}>{title}</h2>
          <p className="mb-2">{message}</p>
          {isSuccess && ref && (
            <p className="mb-1">
              کد رهگیری: <strong>{ref}</strong>
            </p>
          )}
          {isSuccess && amount && (
            <p className="mb-3">
              مبلغ: {Number(amount).toLocaleString()} تومان
            </p>
          )}
        </div>
        <Link href={redirectTo} className={btnClass}>
          {buttonText}
        </Link>
      </div>
    </div>
  );
}
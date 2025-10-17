"use client";
import GeneralError from "@/app/components/ui/GeneralError";
import GeneralLoading from "@/app/components/ui/GeneralLoading";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Table, Modal, Button } from "react-bootstrap";
import { Card, Badge } from "react-bootstrap";
import {
  FaDownload,
  FaHashtag,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaEye,
} from "react-icons/fa";

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/userPanel/order-list");
        if (!res.ok) setError("خطا در دریافت اطلاعات");

        const orderData = await res.json();
        orderData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(orderData);
      } catch (err) {
        setError(err.message);
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case "completed":
        return { text: "تکمیل شده", className: "status completed" };
      case "cancelled":
        return { text: "لغو شده", className: "status cancelled" };
      case "pending":
        return { text: "در انتظار", className: "status pending" };
      case "processing":
        return { text: "در حال پردازش", className: "status processing" };
      case "failed":
        return { text: "ناموفق", className: "status failed" };
      default:
        return { text: status, className: "status pending" };
    }
  };

  return (
    <section className="user-section">
      <div className="d-flex justify-content-between align-items-center my-4">
        <h4>لیست سفارشات و دانلود ها :</h4>
      </div>

      {error && <GeneralError message={error} onClear={() => setError(null)} />}

      {loading ? (
        <GeneralLoading />
      ) : orders.length === 0 && !error ? (
        <p className="text-center">هیچ سفارشی یافت نشد.</p>
      ) : (
        <>
          {orders.map((order, index) => (
            <div className="order-card" key={index}>
              <div className="order-header">
                <div className="order-info">
                  <div>
                    <FaHashtag /> کد پیگیری : {order.trackingCode}
                  </div>
                  <div>
                    <FaCalendarAlt /> تاریخ سفارش :{" "}
                    {new Date(order.createdAt).toLocaleString("fa-IR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <div className={getStatusClass(order.status).className}>
                  {getStatusClass(order.status).text}
                </div>
              </div>

              <div className="order-prices">
                <span>
                  مبلغ کل: {order.totalPrice.toLocaleString("fa-IR")} تومان
                </span>
                <span className="discount">
                  تخفیف: {order.totalDiscountedPrice.toLocaleString("fa-IR")}{" "}
                  تومان
                </span>
                <span className="final">
                  مبلغ نهایی: {order.finalPrice.toLocaleString("fa-IR")} تومان
                </span>
              </div>

              <div className="order-products">
                {order.items.map((item, idx) => (
                  <div className="product-card" key={idx}>
                    <img src={item.product.imageUrl} alt={item.product.name} />
                    <p>{item.product.name}</p>

                    <a
                      href={`/api/view-pdf?file=${encodeURIComponent(
                        item.product.fileUrl.split("/").pop()
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="download-btn"
                    >
                      <FaEye /> خواندن
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </section>
  );
};

export default OrdersList;

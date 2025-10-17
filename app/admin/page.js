"use client";
import React, { useEffect, useState } from "react";
import moment from "moment-jalaali";
import ChartSection from "../components/ui/ChartSection";
import { useDarkMode } from "../context/DarkModeContext";
import GeneralError from "../components/ui/GeneralError";
import GeneralLoading from "../components/ui/GeneralLoading";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [normalUsers, setNormalUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [payments, setPayments] = useState([]);
  const [audiobooks, setAudiobooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { darkMode } = useDarkMode();

  const getMonthlyCounts = (list) => {
    const counts = new Array(12).fill(0);
    list.forEach((item) => {
      if (!item.createdAt) return;
      counts[moment(item.createdAt).jMonth()]++;
    });
    return counts;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRes = await fetch("/api/users");
        if (!usersRes.ok) throw new Error("خطا در دریافت کاربران");
        const usersData = await usersRes.json();
        if (!usersData || !Array.isArray(usersData))
          throw new Error("داده‌های کاربران نامعتبر هستند");
        setUsers(usersData);
        setNormalUsers(usersData.filter((user) => user.role === "user"));

        const productsRes = await fetch("/api/products");
        if (!productsRes.ok) throw new Error("خطا در دریافت محصولات");
        const productsData = await productsRes.json();
        if (!productsData || !Array.isArray(productsData))
          throw new Error("داده‌های محصولات نامعتبر هستند");
        setBooks(productsData);
        setAudiobooks(
          productsData.filter((p) => ["mp3", "wav"].includes(p.fileType))
        );

        const paymentsRes = await fetch("/api/payments");
        if (!paymentsRes.ok) throw new Error("خطا در دریافت سفارش‌ها");
        const paymentsData = await paymentsRes.json();
        setPayments(paymentsData.data.payments);
      } catch (err) {
        console.error(err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const monthlyUserCounts = getMonthlyCounts(normalUsers);
  const monthlyBookCounts = getMonthlyCounts(books);

  return (
    <div className={`admin-container ${darkMode ? "dark-mode" : ""}`}>
      {loading ? (
        <GeneralLoading />
      ) : error ? (
        <GeneralError error={error} onRetry={() => window.location.reload()} />
      ) : (
        <>
          <h5 className="content-header-title">به پنل ادمین خوش آمدید</h5>

          <div className="admin-row">
            <div className="admin-card">
              <h6>📚 مجموع کتاب‌ها</h6>
              <h4>{books.length}</h4>
            </div>
            <div className="admin-card">
              <h6>🎧 مجموع کتاب‌های صوتی</h6>
              <h4>{audiobooks.length}</h4>
            </div>
            <div className="admin-card">
              <h6>👤 مجموع کاربران</h6>
              <h4>{normalUsers.length}</h4>
            </div>
          </div>

          <ChartSection
            monthlyUserCounts={monthlyUserCounts}
            monthlyBookCounts={monthlyBookCounts}
            payments={payments}
          />
        </>
      )}
    </div>
  );
};

export default AdminDashboard;

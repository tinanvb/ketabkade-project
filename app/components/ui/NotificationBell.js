"use client";

import React, { useState, useRef, useEffect } from "react";
import { FaBell } from "react-icons/fa";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNotification } from "@/app/context/NotificationContext";

export default function NotificationBell() {
  const {
    notifications = [],
    setNotifications,
    hasNewQuestion,
    setHasNewQuestion,
  } = useNotification();
  const [showNotification, setShowNotification] = useState(false);
  const dropdownRef = useRef(null);
  const pathname = usePathname();

  // کلیک روی زنگوله
  const handleClick = (e) => {
    e.stopPropagation();
    setShowNotification((prev) => !prev);

    if (hasNewQuestion) {
      setHasNewQuestion(false);
      localStorage.setItem("hasNewQuestion", "false");
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotification(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (pathname === "/admin/questions/unAnswer") {
      setShowNotification(false);
      setNotifications([]);
      setHasNewQuestion(false);
      localStorage.removeItem("notifications");
      localStorage.removeItem("hasNewQuestion");
    }
  }, [pathname, setNotifications, setHasNewQuestion]);

  return (
    <div className="position-relative" ref={dropdownRef}>
      <button
        className="btn btn-link p-0 position-relative"
        onClick={handleClick}
        title="اعلان‌ها"
      >
        <FaBell size={18} color="black" />
        {hasNewQuestion && <span className="notification-badge">!</span>}
      </button>

      {showNotification && (
        <div className="notification-dropdown ">
          {pathname === "/admin/questions/unAnswer" ? (
            <div className="notification-empty">سوالی وجود ندارد</div>
          ) : notifications.length > 0 ? (
            <>
              {notifications.map((item) => (
                <div key={item.id} className="notification-item">
                  <div className="notification-item-title">{item.title}</div>
                  <button
                    type="button"
                    className="notification-item-close"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNotifications((prev) =>
                        prev.filter((n) => n.id !== item.id)
                      );
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}

              <Link
                href="/admin/questions/unAnswer"
                className="notification-link"
                onClick={() => {
                  setShowNotification(false);
                  setNotifications([]);
                  setHasNewQuestion(false);
                  localStorage.removeItem("notifications");
                  localStorage.removeItem("hasNewQuestion");
                }}
              >
                مشاهده سوالات
              </Link>
            </>
          ) : (
            <div className="notification-empty">سوالی وجود ندارد</div>
          )}
        </div>
      )}
    </div>
  );
}

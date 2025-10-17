"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [hasNewQuestion, setHasNewQuestion] = useState(false);

  // بارگذاری از localStorage
  useEffect(() => {
    const savedNotifications = localStorage.getItem("notifications");
    const savedHasNew = localStorage.getItem("hasNewQuestion");

    if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
    if (savedHasNew === "true") setHasNewQuestion(true);
  }, []);

  // ذخیره تغییرات
  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("hasNewQuestion", hasNewQuestion.toString());
  }, [hasNewQuestion]);

  // افزودن اعلان جدید
  const addNotification = (title) => {
    const newNotification = {
      id: Date.now(),
      title,
    };
    setNotifications((prev) => [newNotification, ...prev]);
    setHasNewQuestion(true);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        setNotifications,
        hasNewQuestion,
        setHasNewQuestion,
        addNotification, 
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification باید داخل NotificationProvider استفاده شود");
  }
  return context;
};

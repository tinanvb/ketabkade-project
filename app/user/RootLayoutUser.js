"use client";

import Header from "@/app/components/ui/Header";
import Sidebar from "@/app/components/ui/user/Sidebar";
import { SidebarProvider } from "@/app/context/SidebarContext";
import { usePathname } from "next/navigation";
import { DarkModeProvider } from "../context/DarkModeContext";
import { useEffect, useState } from "react";
import "../styles/darkMode.css";
export default function RootLayoutUser({ children }) {
  const pathname = usePathname();
  const [darkMode, setDarkMode] = useState(null); // null یعنی هنوز مشخص نشده


  const hideHeaderFooter =
    pathname.startsWith("/user/wallet/success") ||
    pathname.startsWith("/user/wallet/fail");

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    let mode;
    if (savedMode !== null) {
      mode = savedMode === "true";
    } else {
      // حالت پیش‌فرض بر اساس ساعت سیستم
      const hour = new Date().getHours();
      mode = hour >= 19 || hour < 6;
    }

    setDarkMode(mode);
    document.body.classList.toggle("dark-mode", mode);
  }, []);

  // تا وقتی darkMode مشخص نشده، چیزی رندر نشه
  if (darkMode === null) return null;

  if (hideHeaderFooter) {
    return <>{children}</>;
  }

  return (
    <DarkModeProvider>
      <SidebarProvider>
        <div className="layout-wrapper d-flex vh-100">
          <div className="sidebar-wrapper">
            <Sidebar />
          </div>

          <div className="main-content d-flex flex-column flex-grow-1">
            <Header />
            <div className={`admin-container ${darkMode ? "dark-mode" : ""}`}>
              <main className="py-4 px-3 px-md-4 px-lg-5">{children}</main>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </DarkModeProvider>
  );
}

"use client";
import AdminHeader from "@/app/components/ui/Header";
import Sidebar from "@/app/components/ui/Sidebar";
import { SidebarProvider } from "@/app/context/SidebarContext";
import { useEffect, useState } from "react";
import { DarkModeProvider } from "../context/DarkModeContext";
import "../styles/darkMode.css";

export default function AdminPanelLayout({ children }) {
  const [darkMode, setDarkMode] = useState(null);
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    let mode;
    if (savedMode !== null) {
      mode = savedMode === "true";
    } else {
      const hour = new Date().getHours();
      mode = hour >= 17 || hour < 6;
    }
    setDarkMode(mode);
  }, []);

  if (darkMode === null) return null;

  return (
    <DarkModeProvider>
      <SidebarProvider>
        <div className="layout-wrapper d-flex vh-100">
          <div className="sidebar-wrapper">
            <Sidebar />
          </div>

          <div className="main-content d-flex flex-column flex-grow-1">
            <AdminHeader />
            <div className={`admin-container ${darkMode ? "dark-mode" : ""}`}>
              <main className="py-4 px-3 px-md-4 px-lg-5">{children}</main>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </DarkModeProvider>
  );
}

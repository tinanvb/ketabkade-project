"use client";

import React from "react";
import {
  FaPowerOff,
  FaBars,
  FaAngleDoubleRight,
  FaAngleDoubleLeft,
  FaSun,
  FaMoon,
  FaHome,
} from "react-icons/fa";
import { useSidebar } from "@/app/context/SidebarContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Navbar } from "react-bootstrap";
import { signOut } from "next-auth/react";
import NotificationBell from "@/app/components/ui/NotificationBell";
import { useDarkMode } from "@/app/context/DarkModeContext";

const Header = () => {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const pathname = usePathname();
  const { toggleSidebar, toggleMini, sidebarMini } = useSidebar();
  const isAdmin = pathname.startsWith("/admin");
  const dashboardHref = isAdmin ? "/admin" : "/user";

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <Navbar
      expand="lg"
      className="dashboard-header dashboard-bg d-flex justify-content-between align-items-center px-4 py-3"
    >
      <div className="d-flex align-items-center gap-3">
        <FaBars onClick={toggleSidebar} className="d-md-none" />
        {sidebarMini ? (
          <FaAngleDoubleLeft onClick={toggleMini} className="d-none d-md-inline" />
        ) : (
          <FaAngleDoubleRight onClick={toggleMini} className="d-none d-md-inline" />
        )}
        <Link href={dashboardHref} className="text-decoration-none">
          داشبورد
        </Link>
      </div>

      <div className="d-flex align-items-center gap-3">
        <NotificationBell />

        <Link href={"/"}>
          <FaHome size={18} />
        </Link>

        <div
          onClick={toggleDarkMode}
          style={{ cursor: "pointer" }}
          title="تغییر تم"
        >
          {darkMode ? <FaSun size={15} /> : <FaMoon size={15} />}
        </div>

        <div onClick={handleLogout} style={{ cursor: "pointer" }} title="خروج">
          <FaPowerOff size={15} />
        </div>
      </div>
    </Navbar>
  );
};

export default Header;

"use client";
import Link from "next/link";
import React from "react";
import { Nav } from "react-bootstrap";
import {
  FaChartPie,
  FaKey,
  FaUser,
  FaEnvelopeOpenText,
  FaClipboardList,
  FaWallet,
} from "react-icons/fa";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSidebar } from "@/app/context/SidebarContext";

const Sidebar = () => {
  const pathname = usePathname();
  const { sidebarMini, sidebarOpen, closeSidebar } = useSidebar();

  const isActive = (path) => pathname === path;
  const { data: session } = useSession();

  return (
    <>
      <div
        className={`sidebar-overlay ${sidebarOpen ? "show" : ""}`}
        onClick={closeSidebar}
      ></div>

      <aside
        className={`sidebar ${sidebarMini ? "mini" : ""} ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
        onClick={closeSidebar}
      >
        <div className="admin-profile text-center py-2">
          <img
            src="/avatar.png"
            alt="Admin Avatar"
            className="admin-avatar mb-2"
          />
          <h6 className="mb-0 text-white">
            سلام {session?.user.firstname} {session?.user.lastname}
          </h6>
          <p className="admin-role mt-2"> پنل کاربری</p>
        </div>

        <Nav className="flex-column">
          <Link href="/user" className={isActive("/user") ? "active-link" : ""}>
            <FaChartPie />
            <span className="menu-label">داشبورد</span>
          </Link>
        </Nav>
        <Nav className="flex-column">
          <Link
            href="/user/profile"
            className={isActive("/user/profile") ? "active-link" : ""}
          >
            <FaUser />
            <span className="menu-label">پروفایل من</span>
          </Link>
        </Nav>
        <Nav className="flex-column">
          <Link
            href="/user/change-password"
            className={isActive("/user/change-password") ? "active-link" : ""}
          >
            <FaKey />
            <span className="menu-label">تغییر رمز عبور</span>
          </Link>
        </Nav>
        <Nav className="flex-column">
          <Link
            href="/user/ticket"
            className={isActive("/user/ticket") ? "active-link" : ""}
          >
            <FaEnvelopeOpenText />
            <span className="menu-label">تیکت ها</span>
          </Link>
        </Nav>
        <Nav className="flex-column">
          <Link
            href="/user/orders-list"
            className={isActive("/user/orders-list") ? "active-link" : ""}
          >
            <FaClipboardList />
            <span className="menu-label">لیست سفارشات</span>
          </Link>
        </Nav>
        <Nav className="flex-column">
          <Link
            href="/user/wallet"
            className={isActive("/user/wallet") ? "active-link" : ""}
          >
            <FaWallet />
            <span className="menu-label">کیف پول من</span>
          </Link>
        </Nav>
      </aside>
    </>
  );
};

export default Sidebar;

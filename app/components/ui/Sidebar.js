"use client";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { Nav } from "react-bootstrap";
import {
  FaChartPie,
  FaLayerGroup,
  FaShoppingBag,
  FaTags,
  FaPercentage,
  FaTasks,
  FaWallet,
  FaUser,
  FaComment,
  FaQuestion,
} from "react-icons/fa";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSidebar } from "@/app/context/SidebarContext";
import { FaGear, FaTicket } from "react-icons/fa6";

const Sidebar = () => {
  const pathname = usePathname();
  const { sidebarMini, sidebarOpen, closeSidebar } = useSidebar();
  const { data: session, update } = useSession();
  const [avatar, setAvatar] = useState("/avatar.png");
  const fileInputRef = useRef();

  // هر وقت session آماده شد، آواتار را ست کن
  useEffect(() => {
    if (session?.user?.avatar) {
      setAvatar(session.user.avatar);
    }
  }, [session]);

  const isAdmin = session?.user?.role === "admin";
  const isActive = (path) => {
    if (path === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(path); 
  };  const handleAvatarClick = () => {
    if (isAdmin) fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await fetch("/api/upload-avatar", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      const { avatar: newAvatar } = await res.json();
      setAvatar(newAvatar);

      //  update() => trigger === "update" در jwt callback
      await update({ avatar: newAvatar });
    } catch (err) {
      console.error(err.message || err);
    }
  };

  return (
    <>
      <div
        className={`sidebar-overlay ${sidebarOpen ? "show" : ""}`}
        onClick={closeSidebar}
      />
      <aside
        className={`sidebar ${sidebarMini ? "mini" : ""} ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
        onClick={closeSidebar}
      >
        <div className="d-flex flex-column align-items-center justify-content-center text-center py-1">
          <div
            className="admin-profile text-center py-2"
            style={{ cursor: isAdmin ? "pointer" : "default" }}
            onClick={handleAvatarClick}
            title={isAdmin ? "برای تغییر عکس کلیک کنید" : ""}
          >
            <img
              src={avatar}
              alt="Admin Avatar"
              onError={(e) => {
                e.currentTarget.src = "/avatar.png";
              }}
              className="admin-avatar mb-2"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAvatarChange}
            />
          </div>

          <h6 className="admin-name mb-0 text-white">
            سلام {session?.user.firstname} {session?.user.lastname}
          </h6>
          <p className="admin-role mt-2">مدیریت پنل ادمین</p>
        </div>

        <Nav className="flex-column mt-2 mb-5">
          <Link
            href="/admin"
            className={isActive("/admin") ? "active-link" : ""}
          >
            <FaChartPie />
            <span className="menu-label">داشبورد</span>
          </Link>
          <Link
            href="/admin/products"
            className={isActive("/admin/products") ? "active-link" : ""}
          >
            <FaShoppingBag />
            <span className="menu-label">مدیریت محصولات</span>
          </Link>

          <Link
            href="/admin/tags"
            className={isActive("/admin/tags") ? "active-link" : ""}
          >
            <FaTags />
            <span className="menu-label">مدیریت برچسب ها</span>
          </Link>
          <Link
            href="/admin/categories"
            className={isActive("/admin/categories") ? "active-link" : ""}
          >
            <FaLayerGroup />
            <span className="menu-label">مدیریت دسته بندی ها</span>
          </Link>
          <Link
            href="/admin/discountCodes"
            className={isActive("/admin/discountCodes") ? "active-link" : ""}
          >
            <FaPercentage />
            <span className="menu-label">مدیریت کدهای تخفیف</span>
          </Link>

          <Link
            href="/admin/payments"
            className={isActive("/admin/payments") ? "active-link" : ""}
          >
            <FaWallet />
            <span className="menu-label">مدیریت پرداخت ها</span>
          </Link>
          <Link
            href="/admin/tickets"
            className={isActive("/admin/tickets") ? "active-link" : ""}
          >
            <FaTicket />
            <span className="menu-label">مدیریت تیکت ها</span>
          </Link>
          <Link
            href="/admin/questions/answer"
            className={isActive("/admin/questions") ? "active-link" : ""}
          >
            <FaQuestion />
            <span className="menu-label">مدیریت سوالات</span>
          </Link>
          <Link
            href="/admin/comments"
            className={isActive("/admin/comments") ? "active-link" : ""}
          >
            <FaComment />
            <span className="menu-label">مدیریت نظرات</span>
          </Link>
          <Link
            href="/admin/users"
            className={isActive("/admin/users") ? "active-link" : ""}
          >
            <FaUser />
            <span className="menu-label">مدیریت کاربران</span>
          </Link>

          <Link
            href="/admin/menus"
            className={isActive("/admin/menus") ? "active-link" : ""}
          >
            <FaTasks />
            <span className="menu-label">مدیریت منو ها</span>
          </Link>

          <Link
            href="/admin/settings"
            className={isActive("/admin/settings") ? "active-link" : ""}
          >
            <FaGear />
            <span className="menu-label">تنظیمات</span>
          </Link>
        </Nav>
      </aside>
    </>
  );
};

export default Sidebar;

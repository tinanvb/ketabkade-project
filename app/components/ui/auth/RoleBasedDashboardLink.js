"use client";
import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import GeneralLoading from "../GeneralLoading";
import "../../../styles/auth.css";


export default function RoleBasedDashboardLink({ className }) {
  const { data: session, status } = useSession();

  const role = session?.user?.role;
  if (status==="loading") {
    return (
      <GeneralLoading/>
    );
  }
  if (!session) {
    return (
      <Link href="/auth/login" className={className ?? "btn-login"}>
        ورود / ثبت‌نام
      </Link>
    );
  }

  if (role === "admin") {
    return (
      <Link href="/admin" className={className ?? "btn-login"}>
        ورود به پنل ادمین
      </Link>
    );
  }

  if (role === "user") {
    return (
      <Link href="/user" className={className ?? "btn-login"}>
        ورود به پنل کاربر
      </Link>
    );
  }

  // حالت پیش‌فرض اگر نقش ناشناخته بود
  return (
    <Link href="auth/login" className={className ?? "btn-login"}>
      ورود / ثبت‌نام
    </Link>
  );
}

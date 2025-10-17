"use client";

import OtpForm from "@/app/components/ui/auth/OtpForm";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const Otp = () => {
  const searchParams = useSearchParams();
  const [type, setType] = useState("login");

  useEffect(() => {
   setType(searchParams.get("type")) ;
  }, [searchParams]);

  const getTitle = (type) => {
    switch (type) {
      case "login":
        return "ورود با رمز یکبار مصرف";
      case "activate":
        return "فعالسازی حساب کاربری";
      default:
        return "تأیید شماره موبایل";
    }
  };
  return (
    <>
      <h1 className="title fw-bold">{getTitle(type)}</h1>
      <OtpForm />
      <hr className="my-5" />
      <div>
        حساب کاربری ندارید ؟ <Link href="/auth/register">ثبت نام</Link>
      </div>
      <div className="mt-4">
        برای مشاهده قوانین استفاده از کتابکده کلیک کنید.
      </div>
    </>
  );
};

export default Otp;

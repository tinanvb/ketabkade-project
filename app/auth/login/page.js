import LoginForm from "@/app/components/ui/auth/LoginForm";
import Link from "next/link";
import React from "react";


const Login = () => {
  return (
    <>
      <p className="welcome-text fw-bold"> خوش برگشتی {":)"}</p>
      <h1 className="title fw-bold">ورود به حساب کاربری</h1>
      <LoginForm />
      <div className="my-3 or-text">یا</div>
      <div className="otp-link">
        <Link href="/auth/otp?type=login">ورود با رمز یکبار مصرف</Link>
      </div>
      <hr className="my-4"/>
      <div>
        حساب کاربری ندارید ؟ <Link href="/auth/register">ثبت نام</Link>
      </div>
      <div className="mt-4">
        برای مشاهده قوانین استفاده از کتابکده کلیک کنید.
      </div>
    </>
  );
};

export default Login;

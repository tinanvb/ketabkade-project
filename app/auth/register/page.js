import RegisterForm from "@/app/components/ui/auth/RegisterForm";
import Link from "next/link";
import React from "react";


const Register = () => {
  return (
    
    <>
      <p className="welcome-text fw-bold"> خوش آمدی {":)"}</p>
      <h1 className="title fw-bold">ثبت‌ نام و ساخت حساب کاربری</h1>
      <RegisterForm />
      <hr className="my-4" />

      <div>
        حساب کاربری دارید؟ <Link href="/auth/login">ورود</Link>
      </div>
      <div className="mt-4">
        ثبت نام شما به معنی پذیرش قوانین استفاده از کتابکده است.
      </div>
    </>
  );
};

export default Register;

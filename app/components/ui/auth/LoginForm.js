"use client";
import React, { useState } from "react";
import TextInput from "../../common/TextInput";
import { toast } from "react-toastify";
import { emailRegex, phoneNumberRegex } from "@/app/utils/regex";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Col } from "react-bootstrap";

const LoginForm = () => {
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };
  const getPhoneNumberFromServer = async (identifier) => {
    try {
      const res = await fetch("/api/auth/check-user-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.exists && !data.isActive ? data.phoneNumber : null;
    } catch (err) {
      return null;
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    const newErrors = {};
    const isPhone = phoneNumberRegex.test(form.identifier.trim());
    const isEmail = emailRegex.test(form.identifier.trim());

    if (!form.identifier.trim()) {
      newErrors.identifier = "ایمیل یا شماره موبایل الزامی است.";
    } else if (!isPhone && !isEmail) {
      newErrors.identifier = "فرمت ایمیل یا شماره موبایل معتبر نیست.";
    }

    if (!form.password.trim()) {
      newErrors.password = "رمز عبور الزامی است.";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      redirect: false,
      identifier: form.identifier,
      password: form.password,
    });
    if (result?.ok) {
      toast.success("ورود با موفقیت انجام شد.");
      router.push("/");
    } else if (result?.error === "ACCOUNT_NOT_ACTIVE") {
      toast.info("حساب شما غیرفعال است. لطفاً کد ارسال شده را وارد کنید.");
      const phone = isPhone
        ? form.identifier
        : await getPhoneNumberFromServer(form.identifier);
      if (phone) {
        await fetch("/api/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier: phone,
            field: "phoneNumber",
            type: "activate",
          }),
        });
        router.push(`/auth/otp?phoneNumber=${phone}&type=activate`);
      } else {
        toast.error("شماره موبایل برای حساب یافت نشد.");
      }
    } else {
      toast.error(
        result?.error || "ورود ناموفق بود. لطفاً اطلاعات را بررسی کنید."
      );
    }

    setLoading(false);
  };

  return (
    <Col xs={9} sm={6} lg={6} xl={4}>
      <form onSubmit={handleSubmit} className="row">
        <TextInput
          label="ایمیل / شماره موبایل"
          name="identifier"
          type="text"
          value={form.identifier}
          onChange={handleChange}
          error={errors.identifier}
          required
          wrapperClassName="col-12"
        />
        <TextInput
          label="رمز عبور"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          required
          wrapperClassName="col-12"
        />

        <button
          type="submit"
          className="btn-custom-add d-block w-50 mt-5 mx-auto"
          disabled={loading || !form.identifier || !form.password}
        >
          {loading ? "در حال ورود..." : "ورود"}
        </button>
      </form>
    </Col>
  );
};

export default LoginForm;

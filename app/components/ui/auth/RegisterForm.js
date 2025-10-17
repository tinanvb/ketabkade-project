"use client";

import React, { useState } from "react";
import TextInput from "../../common/TextInput";
import { toast } from "react-toastify";
import {
  emailRegex,
  phoneNumberRegex,
  nameRegex,
  passwordRegex,
  usernameRegex,
} from "@/app/utils/regex";
import { useRouter } from "next/navigation";
import { Col } from "react-bootstrap";

const RegisterForm = () => {
  const [form, setForm] = useState({
    email: "",
    phoneNumber: "",
    username: "",
    firstname: "",
    lastname: "",
    password: "",
    repassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const router = useRouter();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (
      !form.phoneNumber.trim() ||
      !phoneNumberRegex.test(form.phoneNumber.trim())
    ) {
      newErrors.phoneNumber = "شماره موبایل وارد شده معتبر نیست.";
    }

    if (!form.email.trim() || !emailRegex.test(form.email.trim())) {
      newErrors.email = "ایمیل وارد شده معتبر نیست.";
    }

    if (!form.username.trim() || !usernameRegex.test(form.username.trim())) {
      newErrors.username =
        "نام کاربری باید بین ۳ تا ۲۰ کاراکتر و فقط شامل حروف انگلیسی، عدد و آندرلاین (_) باشد.";
    }

    if (!form.firstname.trim() || !nameRegex.test(form.firstname.trim())) {
      newErrors.firstname =
        "نام باید فقط شامل حروف فارسی باشد و حداقل ۲ حرف داشته باشد.";
    }

    if (!form.lastname.trim() || !nameRegex.test(form.lastname.trim())) {
      newErrors.lastname =
        "نام خانوادگی باید فقط شامل حروف فارسی باشد و حداقل ۲ حرف داشته باشد.";
    }

    if (!form.password.trim() || !passwordRegex.test(form.password.trim())) {
      newErrors.password =
        "رمز عبور باید حداقل ۸ کاراکتر، شامل حروف، عدد و یک کاراکتر خاص مانند !@#$ باشد.";
    }

    if (form.password !== form.repassword) {
      newErrors.repassword = "رمز عبور و تکرار آن یکسان نیستند.";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("ثبت‌ نام با موفقیت انجام شد.");
        router.push(`/auth/otp?phoneNumber=${form.phoneNumber}&type=register`);
      } else {
        toast.error("خطا در ثبت‌ نام");
      }
    } catch (err) {
      toast.error("خطا در اتصال به سرور");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Col xs={10} sm={8} xl={6}>
      <form onSubmit={handleSubmit} className="row">
        <TextInput
          label="ایمیل"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          required
          wrapperClassName="col-12"
        />
        <TextInput
          label="شماره موبایل"
          name="phoneNumber"
          type="tel"
          value={form.phoneNumber}
          onChange={handleChange}
          error={errors.phoneNumber}
          required
          wrapperClassName="col-6"
        />
        <TextInput
          label="نام کاربری"
          name="username"
          type="text"
          value={form.username}
          onChange={handleChange}
          error={errors.username}
          required
          wrapperClassName="col-6"
        />
        <TextInput
          label="نام"
          name="firstname"
          type="text"
          value={form.firstname}
          onChange={handleChange}
          error={errors.firstname}
          required
          wrapperClassName="col-6"
        />
        <TextInput
          label="نام خانوادگی"
          name="lastname"
          type="text"
          value={form.lastname}
          onChange={handleChange}
          error={errors.lastname}
          required
          wrapperClassName="col-6"
        />
        <TextInput
          label="رمز عبور"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          required
          wrapperClassName="col-6"
        />
        <TextInput
          label="تکرار رمز عبور"
          name="repassword"
          type="password"
          value={form.repassword}
          onChange={handleChange}
          error={errors.repassword}
          required
          wrapperClassName="col-6"
        />

        <button
          type="submit"
          className="btn-custom-add d-block w-50 mt-5 mx-auto"
          disabled={loading}
        >
          {loading ? "در حال ثبت‌نام..." : "ثبت نام"}
        </button>
      </form>
    </Col>
  );
};

export default RegisterForm;

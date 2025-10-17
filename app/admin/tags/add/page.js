"use client";

import { tagNameRegex } from "@/app/utils/regex";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Alert, Form } from "react-bootstrap";

const AddTag = () => {
  // وضعیت‌های مربوط به فرم
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState("");
  const router = useRouter();
  // بررسی اعتبار فرم قبل از ارسال
  const validateForm = () => {
    if (name.trim() === "") {
      setFormError("نام برچسب الزامی میباشد");
      return false;
    } else if (!tagNameRegex.test(name.trim())) {
      setFormError("نام برچسب باید بین ۳ تا ۳۰ کاراکتر باشد");
      return false;
    }
    setFormError("");
    return true;
  };
  // ارسال فرم برای ایجاد برچسب جدید
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, isActive }),
      });

      if (response.status === 400) {
        let message = await response.json();
        setFormError(message.message);
      }
      if (!response.ok) throw new Error("مشکلی در ساخت برچسب پیش آمده است");
      router.push("/admin/tags");
    } catch (error) {
      setError(error.message);
    }
  };
  return (
    <section className='admin-section'>

      <div className="admin-header">
        <h4 className="my-4">افزودن برچسب جدید</h4>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      {formError && <Alert variant="warning">{formError}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>نام برچسب</Form.Label>
          <Form.Control
            type="text"
            placeholder="نام دسته بندی ..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>وضعیت برچسب</Form.Label>
          <Form.Check
            type="checkbox"
            label="فعال "
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
        </Form.Group>
        <button className="btn-custom-submit " type="submit">
          ذخیره
        </button>
      </Form>
    </section>
  );
};

export default AddTag;

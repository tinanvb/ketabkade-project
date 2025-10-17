"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { categoriesNameRegex } from "@/app/utils/regex";
import { Alert, Form } from "react-bootstrap";

const UpdateCategory = () => {
  const { id } = useParams();
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState("");
  const router = useRouter();

  // واکشی اطلاعات دسته‌بندی با آی‌دی مشخص هنگام بارگذاری کامپوننت
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/categories/${id}`);
        if (!res.ok)
          throw new Error("دریافت اطلاعات دسته‌بندی با مشکل مواجه شد");
        const data = await res.json();
        setName(data.name || "");
        setIsActive(data.isActive || false);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
  }, [id]);

  //اعتبارسنجی
  const validateForm = () => {
    if (name.trim() === "") {
      setFormError("نام دسته بندی الزامی میباشد");
      return false;
    } else if (!categoriesNameRegex.test(name.trim())) {
      setFormError("نام دسته بندی باید بین ۳ تا ۳۰ کاراکتر باشد");
      return false;
    }
    setFormError("");
    return true;
  };

  // ارسال اطلاعات فرم برای به‌روزرسانی دسته‌بندی
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, isActive }),
      });

      if (response.status === 400) {
        let message = await response.json();
        setFormError(message.message);
      }
      if (!response.ok) throw new Error("مشکلی در ساخت دسته بندی پیش آمده است");
      router.push("/admin/categories");
    } catch (error) {
      setError(error.message);
    }
  };
  return (
    <section className='admin-section'>
      <div className="admin-header">
        <h4 className="my-4">ویرایش دسته بندی :{name}</h4>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      {formError && <Alert variant="warning">{formError}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>نام دسته بندی</Form.Label>
          <Form.Control
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>وضعیت دسته بندی</Form.Label>
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

export default UpdateCategory;

"use client";
import { tagNameRegex } from "@/app/utils/regex";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Alert, Form } from "react-bootstrap";

const UpdateTag = () => {
  // گرفتن آیدی از URL
  const { id } = useParams();
  // استیت‌ها
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState("");
  const router = useRouter();
  // دریافت اطلاعات برچسب برای ویرایش
  useEffect(() => {
    const fetchTag = async () => {
      try {
        const res = await fetch(`/api/tags/${id}`);
        if (!res.ok)
          throw new Error("مشکلی در دریافت اطلاعات برچسب پیش آمده است");
        const data = await res.json();
        setName(data.name || "");
        setIsActive(data.isActive || false);
      } catch (err) {
        setError(error?.message || "خطایی رخ داده است");
      }
    };

    fetchTag();
  }, [id]);

  // اعتبارسنجی فرم

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

  // ارسال فرم و بروزرسانی برچسب
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch(`/api/tags/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, isActive }),
      });

      if (response.status === 400) {
        let message = await response.json();
        setFormError(message.message);
      }
      if (!response.ok) throw new Error("مشکلی در ساخت برچسب ها پیش آمده است");
      router.push("/admin/tags");
    } catch (error) {
      setError(error?.message || "خطایی رخ داده است");
    }
  };
  return (
  <section className='admin-section'>

      <div className="admin-header">
        <h4 className="my-4"> ویرایش برچسب :{name}</h4>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      {formError && <Alert variant="warning">{formError}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>نام برچسب </Form.Label>
          <Form.Control
            type="text"
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

export default UpdateTag;

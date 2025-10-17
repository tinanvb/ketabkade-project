"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Container, Row, Form, Alert } from "react-bootstrap";
import GeneralLoading from "@/app/components/ui/GeneralLoading";
import GeneralError from "@/app/components/ui/GeneralError";

const EditQuestionPage = () => {
  const router = useRouter();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    order: 1,
    isActive: true,
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/questions/${id}`);
        if (!res.ok) throw new Error("خطا در دریافت اطلاعات سوال");
        const data = await res.json();
        setFormData({
          question: data.question || "",
          answer: data.answer || "",
          order: typeof data.order === "number" ? data.order : 1,
          isActive: !!data.isActive,
        });
      } catch (err) {
        setError(err.message || "خطا در دریافت اطلاعات");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errors = {};
    if (!formData.question.trim()) errors.question = "عنوان سوال الزامی است.";
    if (!formData.answer.trim()) errors.answer = "پاسخ سوال الزامی است.";
    if (isNaN(formData.order) || formData.order <= 0)
      errors.order = "ترتیب باید عددی مثبت باشد.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!validate()) return;

    try {
      // گرفتن لیست سوالات برای بررسی تکراری بودن order
      const resCheck = await fetch("/api/questions");
      if (!resCheck.ok)
        throw new Error("خطا در دریافت سوالات برای بررسی ترتیب");
      const allQuestions = await resCheck.json();

      // چک کردن order تکراری بجز سوال فعلی
      const orderExists = allQuestions.some(
        (q) => q.order === Number(formData.order) && q._id !== id
      );

      if (orderExists) {
        setFormErrors({
          order: "ترتیب وارد شده تکراری است. لطفاً مقدار دیگری انتخاب کنید.",
        });
        return;
      }

      // اگر تکراری نبود، ارسال درخواست بروزرسانی
      const res = await fetch(`/api/questions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("خطا در بروزرسانی سوال");
      setMessage("سوال با موفقیت بروزرسانی شد.");
      router.push("/admin/questions");
    } catch (err) {
      setError(err.message || "خطا در بروزرسانی سوال");
    }
  };

  return (
    <section className="admin-section">
      <div className="admin-header">
        <h4 className="mb-4 text-right">ویرایش سوال متداول</h4>
      </div>
      {loading ? (
        <GeneralLoading />
      ) : error ? (
        <GeneralError message={error} />
      ) : (
        <>
          {message && <Alert variant="success">{message}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>سوال</Form.Label>
              <Form.Control
                type="text"
                name="question"
                value={formData.question}
                onChange={handleChange}
                isInvalid={!!formErrors.question}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.question}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>پاسخ</Form.Label>
              <Form.Control
                as="textarea"
                name="answer"
                rows={4}
                value={formData.answer}
                onChange={handleChange}
                isInvalid={!!formErrors.answer}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.answer}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>ترتیب</Form.Label>
              <Form.Control
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                isInvalid={!!formErrors.order}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.order}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="فعال باشد"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
            </Form.Group>

            <button type="submit" className="btn-custom-add rounded p-2">
              ثبت سوال
            </button>
          </Form>
        </>
      )}
    </section>
  );
};

export default EditQuestionPage;

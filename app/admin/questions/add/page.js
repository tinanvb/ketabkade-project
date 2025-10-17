"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Container, Row, Col, Alert, Form } from "react-bootstrap";
import GeneralLoading from "@/app/components/ui/GeneralLoading";
import GeneralError from "@/app/components/ui/GeneralError";

const AddQuestion = () => {
  const router = useRouter();

  const [form, setForm] = useState({
    question: "",
    answer: "",
    order: 1,
    isActive: true,
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch("/api/questions");
        const data = await res.json();

        const maxOrder = Math.max(...data.map((q) => q.order || 0), 0);

        setForm((prev) => ({
          ...prev,
          order: maxOrder + 1,
        }));
      } catch (err) {
        console.error("خطا در گرفتن سوالات:", err);
        setError("دریافت سوالات با خطا مواجه شد.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!form.question.trim()) newErrors.question = "عنوان سوال الزامی است.";
    if (!form.answer.trim()) newErrors.answer = "پاسخ سوال الزامی است.";
    if (isNaN(form.order) || form.order <= 0)
      newErrors.order = "ترتیب باید یک عدد مثبت باشد.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setGlobalError("");

    if (!validate()) return;

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("خطا در ارسال اطلاعات");
      const data = await res.json();
      setMessage("سوال با موفقیت ثبت شد.");
      router.push("/admin/questions");
    } catch (err) {
      setGlobalError(err.message || "خطای ناشناخته در ثبت سوال");
    }
  };

  return (
    <section className="admin-section">
      <h2 className="mb-4 text-right">افزودن سوال جدید</h2>

      {error && <GeneralError error={error} />}

      {loading ? (
        <GeneralLoading />
      ) : (
        <div>
          {globalError && <Alert variant="danger">{globalError}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}

          <Form onSubmit={handleSubmit} className="text-right">
            <Form.Group className="mt-4" controlId="question">
              <Form.Label className="fw-semibold">عنوان سوال:</Form.Label>
              <Form.Control
                type="text"
                name="question"
                value={form.question}
                onChange={handleChange}
                isInvalid={!!errors.question}
              />
              <Form.Control.Feedback type="invalid">
                {errors.question}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mt-4" controlId="answer">
              <Form.Label className="fw-semibold">پاسخ سوال:</Form.Label>
              <Form.Control
                as="textarea"
                name="answer"
                value={form.answer}
                onChange={handleChange}
                rows={4}
                isInvalid={!!errors.answer}
              />
              <Form.Control.Feedback type="invalid">
                {errors.answer}
              </Form.Control.Feedback>
            </Form.Group>

            <Row className="mt-4 align-items-center">
              <Col xs={6} md={3}>
                <Form.Group controlId="order">
                  <Form.Label className="fw-semibold">ترتیب نمایش:</Form.Label>
                  <Form.Control
                    type="number"
                    name="order"
                    value={form.order}
                    onChange={handleChange}
                    isInvalid={!!errors.order}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.order}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mt-4">
              <Col xs={6} md={3} className="mt-4 mt-md-0">
                <Form.Check
                  type="checkbox"
                  name="isActive"
                  label="فعال"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="fw-semibold"
                />
              </Col>
            </Row>

            <div className="d-flex gap-3 mt-4">
              <button
                type="submit"
                className="btn-custom-add px-4 py-2 mx-3 rounded"
              >
                ثبت سوال
              </button>
              <button
                type="button"
                onClick={() => router.push("/admin/questions")}
                className="btn-custom-add px-4 py-2 rounded"
              >
                بازگشت
              </button>
            </div>
          </Form>
        </div>
      )}
    </section>
  );
};

export default AddQuestion;

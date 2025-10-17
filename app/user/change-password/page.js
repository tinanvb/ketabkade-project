"use client";
import { useEffect, useState } from "react";
import { Alert, Form, Spinner, Row, Col } from "react-bootstrap";
import { passwordRegex } from "@/app/utils/regex";

const ChangePassword = () => {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.currentPassword || !passwordRegex.test(form.currentPassword)) {
      newErrors.currentPassword =
        "رمز عبور باید حداقل ۸ کاراکتر، شامل حروف، عدد و یک کاراکتر خاص مانند !@#$ باشد.";
    }

    if (!form.newPassword || !passwordRegex.test(form.newPassword)) {
      newErrors.newPassword =
        "رمز عبور باید حداقل ۸ کاراکتر، شامل حروف، عدد و یک کاراکتر خاص مانند !@#$ باشد.";
    }

    if (!form.confirmPassword || form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = "رمز عبور و تکرار آن یکسان نیستند.";
    }
    if (form.currentPassword === form.newPassword) {
      newErrors.newPassword = "رمز جدید نباید با رمز قبلی یکسان باشد.";
    }
    return newErrors;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitLoading(false);

      return;
    }

    try {
      const res = await fetch("/api/userPanel/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "خطا در تغییر رمز عبور");

      setSuccessMessage("رمز عبور با موفقیت تغییر یافت.");
      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});
    } catch (err) {
      setErrorMessage(err.message || "خطایی در تغییر رمز عبور رخ داد.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <section className="user-section">
      {" "}
      <h4 className="my-4">تغییر رمز عبور : </h4>
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      <Form onSubmit={handleChangePassword}>
        <Col sm={6} lg={4}>
          <Form.Group className="mt-3">
            <Form.Label>رمز عبور فعلی :</Form.Label>
            <Form.Control
              type="password"
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              isInvalid={!!errors.currentPassword}
            />
          </Form.Group>
          {errors.currentPassword && (
            <p className="text-danger">{errors.currentPassword}</p>
          )}
        </Col>
        <Col sm={6} lg={4}>
          <Form.Group className="mt-3">
            <Form.Label> رمز عبور جدید :</Form.Label>
            <Form.Control
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              isInvalid={!!errors.newPassword}
            />
          </Form.Group>
          {errors.newPassword && (
            <p className="text-danger">{errors.newPassword}</p>
          )}
        </Col>
        <Col sm={6} lg={4}>
          <Form.Group className="mt-3">
            <Form.Label>تکرار رمز عبور جدید :</Form.Label>
            <Form.Control
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              isInvalid={!!errors.confirmPassword}
            />
          </Form.Group>
          {errors.confirmPassword && (
            <p className="text-danger">{errors.confirmPassword}</p>
          )}
        </Col>
        <button
          className="btn-custom-submit mt-4"
          type="submit"
          disabled={submitLoading}
        >
          {submitLoading ? (
            <>
              <Spinner animation="border" size="sm" />
              <span className="ms-2">در حال ذخیره...</span>
            </>
          ) : (
            "ذخیره"
          )}{" "}
        </button>
      </Form>
    </section>
  );
};

export default ChangePassword;

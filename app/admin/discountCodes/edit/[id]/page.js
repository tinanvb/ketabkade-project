"use client";
import React, { useEffect, useState } from "react";
import { Form, Alert } from "react-bootstrap";
import { useRouter, useParams } from "next/navigation";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { discountCodeRegex } from "@/app/utils/regex";

const EditDiscountCodes = () => {
  const router = useRouter();
  const { id } = useParams();
  const [code, setCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [discountType, setDiscountType] = useState("percent");
  const [expiryDate, setExpiryDate] = useState(null);
  const [status, setStatus] = useState(true);
  const [formError, setFormError] = useState("");
  const [error, setError] = useState(null);
  const today = new Date();

  // دریافت اطلاعات تخفیف از API
  useEffect(() => {
    const fetchDiscount = async () => {
      try {
        const res = await fetch(`/api/discountCodes/${id}`);
        if (!res.ok) throw new Error("خطا در دریافت اطلاعات");
        const data = await res.json();
        setCode(data.code);
        setDiscountAmount(data.discountAmount);
        setDiscountType(data.discountType);
        setExpiryDate(new Date(data.expiryDate));
        setStatus(data.status);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchDiscount();
  }, [id]);

  // اعتبارسنجی فرم
  const validateForm = () => {
    if (code.trim() === "") {
      setFormError("کد تخفیف الزامی است");
      return false;
    }
    if (!discountCodeRegex.test(code.trim())) {
      setFormError("کد تخفیف فقط باید شامل حروف بزرگ انگلیسی و اعداد باشد");
      return false;
    }
    if (!discountAmount || isNaN(discountAmount) || discountAmount <= 0) {
      setFormError("مقدار تخفیف باید عددی معتبر باشد");
      return false;
    }
    if (
      discountType === "percent" &&
      (discountAmount > 100 || discountAmount < 1)
    ) {
      setFormError("درصد تخفیف باید بین ۱ تا ۱۰۰ باشد");
      return false;
    }
    if (!expiryDate) {
      setFormError("تاریخ انقضا الزامی است");
      return false;
    }
    setFormError("");
    return true;
  };

  // ارسال فرم و آپدیت اطلاعات
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const res = await fetch(`/api/discountCodes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          discountAmount: Number(discountAmount),
          discountType,
          expiryDate,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) return setFormError(data.error || "خطا در ویرایش");
      router.push("/admin/discountCodes");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className='admin-section'>

      <div className="admin-header">
        <h4 className="my-4">ویرایش کد تخفیف</h4>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      {formError && <Alert variant="warning">{formError}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>کد تخفیف</Form.Label>
          <Form.Control
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>نوع تخفیف</Form.Label>
          <Form.Select
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value)}
          >
            <option value="percent">درصدی</option>
            <option value="fixed">مبلغ ثابت</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>
            {discountType === "percent" ? "درصد تخفیف" : "مبلغ تخفیف (تومان)"}
          </Form.Label>
          <Form.Control
            type="number"
            value={discountAmount}
            onChange={(e) => setDiscountAmount(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>تاریخ انقضا</Form.Label>
          <DatePicker
            value={expiryDate}
            onChange={setExpiryDate}
            calendar={persian}
            locale={persian_fa}
            minDate={today}
            inputClass="form-control"
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Check
            type="switch"
            id="status-switch"
            label="کد فعال باشد؟"
            checked={status}
            onChange={(e) => setStatus(e.target.checked)}
          />
        </Form.Group>

        <button className="btn-custom-add" type="submit">
          ذخیره
        </button>
      </Form>
    </section>
  );
};

export default EditDiscountCodes;

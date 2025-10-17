"use client";
import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";

const ReplyForm = ({ commentId, onClose, onReplied }) => {
  const [reply, setReply] = useState("");
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const validateReply = (text) => {
    if (!text || text.trim() === "") {
      return "پاسخ نمی‌تواند خالی باشد.";
    }
    if (text.trim().length < 3) {
      return "پاسخ باید حداقل ۳ کاراکتر داشته باشد.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg("");

    const validationError = validateReply(reply);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/comments/${commentId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply }),
      });

      if (!res.ok) throw new Error("خطا در ارسال پاسخ");

      setReply("");
      setSuccessMsg("پاسخ ارسال شد.");
      onReplied?.(); // اگر تابع onReplied وجود داشت، اجرا شود
    } catch (err) {
      setError(err.message || "خطا در ارسال پاسخ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border p-3 bg-light rounded">
      <h6>پاسخ به نظر</h6>
      {error && <Alert variant="danger">{error}</Alert>}
      {successMsg && <Alert variant="success">{successMsg}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Control
            as="textarea"
            rows={3}
            value={reply}
            placeholder="پاسخ خود را بنویسید..."
            onChange={(e) => setReply(e.target.value)}
          />
        </Form.Group>
        <div className="mt-2 d-flex gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? "در حال ارسال..." : "ارسال"}
          </Button>
          <Button variant="secondary" onClick={onClose}>
            انصراف
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default ReplyForm;

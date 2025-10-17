"use client";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useEffect, useRef, useState } from "react";

const OtpModal = ({ show, onHide, identifier, field, onSuccess, isSubmitting }) => {
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (show) {
      setOtpCode("");
      setError("");
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [show]);

  const reSendOtp = async () => {
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier,
          field,
          type: "editProfile",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "خطا در ارسال کد تأیید");
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    if (!otpCode.trim()) {
      setError("کد تأیید را وارد کنید.");
      return;
    }

    try {
      console.log("Verifying OTP:", { identifier, field, otpCode });
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier,
          otpCode,
          type: "editProfile",
          field,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "کد تأیید اشتباه است");

      await onSuccess();
      setOtpCode("");
      setError("");
      onHide();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!identifier || !field) return null;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          تأیید {field === "email" ? "ایمیل" : "شماره موبایل"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group>
          <Form.Label>کد تأیید:</Form.Label>
          <Form.Control
            ref={inputRef}
            type="text"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            placeholder="مثلاً 123456"
            disabled={isSubmitting}
          />
        </Form.Group>
        {error && <p className="mt-2 text-danger">{error}</p>}
        <p className="mt-3 mb-2">کد تأیید برای {identifier} ارسال می‌شود.</p>
        <Button
          variant="outline-primary"
          size="sm"
          onClick={reSendOtp}
          disabled={sending || isSubmitting}
        >
          {sending ? <Spinner size="sm" /> : "ارسال مجدد کد"}
        </Button>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={onHide}
          disabled={isSubmitting}
        >
          لغو
        </Button>
        <Button
          variant="primary"
          onClick={handleVerify}
          disabled={isSubmitting}
        >
          {isSubmitting ? <Spinner size="sm" /> : "تأیید"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default OtpModal;
"use client";
import GeneralLoading from "@/app/components/ui/GeneralLoading";
import GeneralError from "@/app/components/ui/GeneralError";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button, Card, Form } from "react-bootstrap";
import moment from "moment-jalaali";

const MAX_TEXT = 2000;

export default function TicketDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyLoading, setReplyLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [reply, setReply] = useState("");
  const [errors, setErrors] = useState({});
  const messagesEndRef = useRef(null);

  // گرفتن جزئیات تیکت
  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await fetch(`/api/userPanel/ticket/${id}`, {
          credentials: "include",
        });
        if (!res.ok) {
          setErrorMessage("خطا در دریافت اطلاعات تیکت");
          return;
        }
        const data = await res.json();
        setTicket(data);
      } catch (err) {
        setErrorMessage(err.message || "خطا در ارتباط با سرور");
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id]);
  // اسکرول به آخرین پیام
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [ticket?.messages]);

  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 3000); // بعد از ۳ ثانیه حذف شود
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);
  // اعتبارسنجی ریپلای
  const validateReply = () => {
    const errs = {};
    if (!reply.trim()) errs.text = "پیام الزامی است";
    else if (reply.length > MAX_TEXT)
      errs.text = `پیام حداکثر ${MAX_TEXT} کاراکتر باشد`;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ارسال پاسخ
  const handleSendReply = async () => {
    if (!validateReply()) return;

    setReplyLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch(`/api/userPanel/ticket/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          text: reply.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.message || "خطا در ارسال پیام");
        return;
      }

      // اضافه کردن پیام جدید به لیست
      setTicket((prev) => ({
        ...prev,
        messages: [...prev.messages, data],
      }));
      setReply("");
      setSuccessMessage("پیام با موفقیت ارسال شد");
    } catch (err) {
      setErrorMessage(err.message || "خطای ناشناخته");
    } finally {
      setReplyLoading(false);
    }
  };

  if (loading) return <GeneralLoading />;

  if (!ticket) return <GeneralError error={errorMessage || "تیکت یافت نشد"} />;

  return (
    <div className="container user-section my-4" dir="rtl">
      <h4>{ticket.title}</h4>
      <div className="text-muted mb-3">
        آخرین بروزرسانی:{" "}
        {moment(ticket.updatedAt).format("jYYYY/jMM/jDD HH:mm")}
      </div>

      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}
      {errorMessage && <GeneralError error={errorMessage} />}

      {/* لیست پیام‌ها */}
      <div className="mb-4" style={{ maxHeight: "400px", overflowY: "auto" }}>
        {ticket.messages.map((msg, index) => (
          <Card
            key={index}
            className={`mb-2 ${msg.sender === "admin" ? "bg-light" : ""}`}
          >
            <Card.Body>
              <div className="d-flex justify-content-between">
                <strong>{msg.sender === "admin" ? "پشتیبان" : "شما"}</strong>
                <small className="text-muted">
                  {moment(msg.date).format("jYYYY/jMM/jDD HH:mm")}
                </small>
              </div>
              <div className="mt-2">{msg.text}</div>
            </Card.Body>
          </Card>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* فرم ارسال پاسخ */}
      {ticket.status !== "closed" && (
        <Card>
          <Card.Body>
            <Form.Group>
              <Form.Label>پاسخ شما</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={reply}
                onChange={(e) => {
                  setReply(e.target.value);
                  setErrors({});
                }}
                maxLength={MAX_TEXT}
                disabled={replyLoading}
              />
              {errors.text && (
                <div className="text-danger small mt-1">{errors.text}</div>
              )}
            </Form.Group>
            <div className="mt-3">
              <Button
                variant="success"
                onClick={handleSendReply}
                disabled={replyLoading}
              >
                {replyLoading ? "در حال ارسال..." : "ارسال پاسخ"}
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}

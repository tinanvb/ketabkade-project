"use client";
import GeneralLoading from "@/app/components/ui/GeneralLoading";
import GeneralError from "@/app/components/ui/GeneralError";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Accordion, Button, Card, Form } from "react-bootstrap";
import moment from "moment-jalaali";

const MAX_TEXT = 2000;
const statusOptions = [
  { value: "pending", label: "در انتظار پاسخ" },
  { value: "answered", label: "پاسخ داده شده" },
  { value: "closed", label: "بسته شده" },
];

export default function TicketDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyLoading, setReplyLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [reply, setReply] = useState("");
  const [errors, setErrors] = useState({});
  const messagesContainerRef = useRef(null);
  const [status, setStatus] = useState();

  // گرفتن جزئیات تیکت
  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await fetch(`/api/tickets/${id}`, {
          credentials: "include",
        });
        if (!res.ok) {
          setErrorMessage("خطا در دریافت اطلاعات تیکت");
          return;
        }
        const data = await res.json();
        setTicket(data);
        setStatus(data.status);
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
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
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
      const res = await fetch(`/api/tickets/${id}`, {
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
        status: "answered",
      }));
      setReply("");
      setStatus("answered");

      setSuccessMessage("پیام با موفقیت ارسال شد");
    } catch (err) {
      setErrorMessage(err.message || "خطای ناشناخته");
    } finally {
      setReplyLoading(false);
    }
  };
  const handleStatusChange = async (newStatus) => {
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "خطا در تغییر وضعیت");
      }
      setStatus(newStatus);
      setTicket((prev) => ({ ...prev, status: newStatus }));
      setSuccessMessage("وضعیت با موفقیت تغییر کرد");
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  if (loading) return <GeneralLoading />;

  if (!ticket) return <GeneralError error={errorMessage || "تیکت یافت نشد"} />;

  return (
    <section className="admin-section">
      <div className="container ticket-detail my-4" dir="rtl">
        <h4>{ticket.title}</h4>
        <div className="text-muted mb-3">
          آخرین بروزرسانی:
          {moment(ticket.updatedAt).format("jYYYY/jMM/jDD HH:mm")}
        </div>
        {successMessage && (
          <div className="alert alert-success">{successMessage}</div>
        )}
        {errorMessage && (
          <div className="alert alert-danger">{errorMessage}</div>
        )}
        <div className="mb-3 d-flex align-items-center statusWrapper">
          <label className="me-3">وضعیت تیکت:</label>
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="form-select form-select-sm w-auto shadow-sm"
            style={{
              borderRadius: "0.375rem",
              borderColor:
                status === "pending"
                  ? "#ffc107"
                  : status === "answered"
                  ? "#198754"
                  : "#6c757d",
              color:
                status === "pending"
                  ? "#856404"
                  : status === "answered"
                  ? "white"
                  : "white",
              backgroundColor:
                status === "pending"
                  ? "#fff3cd"
                  : status === "answered"
                  ? "#198754"
                  : "#6c757d",
              fontWeight: "600",
            }}
          >
            {statusOptions.map(({ value, label }) => (
              <option key={value} value={value} style={{ fontWeight: "600" }}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <Accordion className="user-info-card rounded shadow-sm mb-4">
          <Accordion.Item eventKey="0">
            <Accordion.Header>اطلاعات کاربر</Accordion.Header>
            <Accordion.Body>
              <p>
                <strong>نام:</strong> {ticket.user?.firstname}{" "}
                {ticket.user?.lastname}
              </p>
              <p>
                <strong>ایمیل:</strong> {ticket.user?.email || "نامشخص"}
              </p>
              <p>
                <strong>شماره موبایل:</strong>{" "}
                {ticket.user?.phoneNumber || "نامشخص"}
              </p>
              <p>
                <strong>تاریخ ثبت‌نام:</strong>{" "}
                {moment(ticket.user?.createdAt).format("jYYYY/jMM/jDD")}
              </p>
              <p>
                <strong>وضعیت حساب:</strong>{" "}
                <span
                  className={`badge ${
                    ticket.user?.isActive ? "bg-success" : "bg-danger"
                  }`}
                  style={{ fontSize: "0.9rem" }}
                >
                  {ticket.user?.isActive ? "فعال" : "غیرفعال"}
                </span>
              </p>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
        {/* لیست پیام‌ها */}
        <div
          className="mb-4"
          style={{ maxHeight: "400px", overflowY: "auto" }}
          ref={messagesContainerRef}
        >
          {ticket.messages.map((msg, index) => (
            <Card
              key={index}
              className={`mb-2 ${msg.sender === "admin" ? "" : "bg-light"}`}
            >
              <Card.Body>
                <div className="d-flex justify-content-between">
                  <strong>
                    {msg.sender === "user"
                      ? `${ticket.user?.firstname || ""} ${
                          ticket.user?.lastname || ""
                        }`.trim() || "نام نامشخص"
                      : "شما"}
                  </strong>
                  <small className="text-muted">
                    {moment(msg.date).format("jYYYY/jMM/jDD HH:mm")}
                  </small>
                </div>
                <div className="mt-2">{msg.text}</div>
              </Card.Body>
            </Card>
          ))}
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
    </section>
  );
}

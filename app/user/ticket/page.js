"use client";
import GeneralLoading from "@/app/components/ui/GeneralLoading";
import React, { useEffect, useState } from "react";
import { Badge, Button, Form, ListGroup, Modal } from "react-bootstrap";
import { AiOutlinePlus } from "react-icons/ai";
import moment from "moment-jalaali";
import GeneralError from "@/app/components/ui/GeneralError";
import { useRouter } from "next/navigation";

const initialFormState = {
  title: "",
  text: "",
};
const statusMap = {
  pending: "در انتظار پاسخ",
  answered: "پاسخ داده شده",
  closed: "بسته شده",
};
const MAX_TITLE = 100;
const MAX_TEXT = 2000;

const Ticket = () => {
  const [form, setForm] = useState(initialFormState); // حالت فرم و مدیریت تغییرات آن
  const [fetchLoading, setFetchLoading] = useState(true); // وضعیت بارگذاری اولیه تیکت‌ها
  const [submitLoading, setSubmitLoading] = useState(false); // وضعیت بارگذاری ارسال تیکت جدید
  const [errorMessage, setErrorMessage] = useState(""); // پیام خطا و موفقیت عمومی
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState({}); // خطاهای فرم (مثلاً عنوان یا متن)
  const [tickets, setTickets] = useState([]); // لیست تیکت‌ها
  const [showNewTicketModal, setShowNewTicketModal] = useState(false); // کنترل نمایش مودال ایجاد تیکت جدید
  const router = useRouter();
  // بارگذاری اولیه تیکت‌ها هنگام mount شدن کامپوننت
  useEffect(() => {
    setErrorMessage("");
    setSuccessMessage("");

    const fetchTickets = async () => {
      try {
        const res = await fetch("/api/userPanel/ticket", {
          method: "GET",
          credentials: "include", // ارسال کوکی‌ها برای احراز هویت
        });

        if (!res.ok) {
          setErrorMessage("خطا در دریافت اطلاعات");
          setTickets([]);
          return;
        }
        const ticketsData = await res.json();
        setTickets(ticketsData);
      } catch (err) {
        console.error(err);
        setErrorMessage(
          err.message || "مشکل در دریافت اطلاعات. لطفاً دوباره تلاش کنید."
        );
        setTickets([]);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // هندلر تغییرات فرم (عنوان و متن)
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" })); // پاک کردن خطای آن فیلد
    setErrorMessage("");
    setSuccessMessage("");
  };
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 3000); // بعد از ۳ ثانیه حذف شود
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);
  // اعتبارسنجی فرم
  const validateTicket = () => {
    const errs = {};
    if (!form.title || !form.title.trim()) errs.title = "عنوان الزامی است";
    else if (form.title.length > MAX_TITLE)
      errs.title = `عنوان حداکثر ${MAX_TITLE} کاراکتر باشد`;

    if (!form.text || !form.text.trim()) errs.text = "متن پیام الزامی است";
    else if (form.text.length > MAX_TEXT)
      errs.text = `متن پیام حداکثر ${MAX_TEXT} کاراکتر باشد`;

    setErrors(errs);
    return Object.keys(errs).length === 0; // آیا خطا داریم؟
  };

  // ارسال تیکت جدید به API
  const handleSendTicket = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!validateTicket()) return; // اگر فرم معتبر نبود، ارسال نکن

    setSubmitLoading(true);
    try {
      const res = await fetch("/api/userPanel/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: form.title.trim(),
          messages: [{ sender: "user", text: form.text.trim() }],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || "خطا در ارسال تیکت");
        setSubmitLoading(false);
        return;
      }

      // اضافه کردن تیکت جدید به ابتدای لیست تیکت‌ها
      setTickets((prev) => [data, ...prev]);
      setSuccessMessage("تیکت با موفقیت ارسال شد");
      setForm(initialFormState); // ریست فرم
      setErrors({});
      setShowNewTicketModal(false); // بستن مودال
    } catch (err) {
      setErrorMessage(err.message || "خطایی در ارسال تیکت به وجود آمده است");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <section className="user-section">
      <div className="d-flex justify-content-between align-items-center my-4">
        <h4>تیکت‌های من :</h4>
        <button
          className="btn-custom-add"
          onClick={() => {
            setShowNewTicketModal(true);
            setErrorMessage("");
            setSuccessMessage("");
          }}
        >
          <AiOutlinePlus />
          ایجاد تیکت جدید
        </button>
      </div>

      {/* نمایش پیام موفقیت و خطا */}
      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}
      {errorMessage && <GeneralError error={errorMessage} />}

      {/* نمایش اسپینر یا لیست تیکت‌ها */}
      {fetchLoading ? (
        <GeneralLoading />
      ) : tickets.length === 0 ? (
        <div className="m-3 text-muted">هیچ تیکتی ثبت نشده است.</div>
      ) : (
        <ListGroup>
          {tickets.map((ticket) => (
            <ListGroup.Item
              key={ticket._id}
              action
              onClick={() => router.push(`/user/ticket/${ticket._id}`)}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div>{ticket.title}</div>
                <Badge
                  bg={
                    ticket.status === "pending"
                      ? "warning"
                      : ticket.status === "answered"
                      ? "success"
                      : "secondary"
                  }
                >
                  {statusMap[ticket.status] || ticket.status}
                </Badge>
              </div>
              <small className="text-muted">
                آخرین به‌روزرسانی:
                {moment(ticket.updatedAt).format("jYYYY/jMM/jDD HH:mm")}
              </small>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      {/* مودال ایجاد تیکت جدید */}
      <Modal
        show={showNewTicketModal}
        onHide={() => {
          if (!submitLoading) setShowNewTicketModal(false);
        }}
        dir="rtl"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>ایجاد تیکت جدید</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="ticketTitle">
              <Form.Label>عنوان</Form.Label>
              <Form.Control
                onChange={handleChange}
                value={form.title}
                type="text"
                name="title"
                maxLength={MAX_TITLE}
                required
                disabled={submitLoading}
                placeholder="عنوان تیکت را وارد کنید"
              />
              {errors.title && (
                <div className="text-danger small mt-1">{errors.title}</div>
              )}
            </Form.Group>

            <Form.Group className="mb-3" controlId="ticketMessage">
              <Form.Label>متن پیام</Form.Label>
              <Form.Control
                onChange={handleChange}
                value={form.text}
                as="textarea"
                name="text"
                rows={4}
                placeholder="پیام خود را بنویسید"
                maxLength={MAX_TEXT}
                required
                disabled={submitLoading}
              />
              {errors.text && (
                <div className="text-danger small mt-1">{errors.text}</div>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="success"
            type="button"
            disabled={submitLoading}
            onClick={handleSendTicket}
          >
            {submitLoading ? "در حال ارسال..." : "ارسال"}
          </Button>
          <Button
            variant="danger"
            onClick={() => setShowNewTicketModal(false)}
            disabled={submitLoading}
          >
            لغو
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  );
};

export default Ticket;

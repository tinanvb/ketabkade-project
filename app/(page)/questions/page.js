"use client";

import React, { useEffect, useState } from "react";
import { Modal, Form, Accordion } from "react-bootstrap";
import { useNotification } from "@/app/context/NotificationContext";
import { usePageLoader } from "@/app/context/PageLoaderProvider";


export default function FAQ() {
  const { startLoading, stopLoading } = usePageLoader();

  const [questions, setQuestions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ question: "" });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { setHasNewQuestion, addNotification } = useNotification();

  const [lastQuestionId, setLastQuestionId] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("lastQuestionId") || null;
    }
    return null;
  });

  const fetchQuestions = async () => {
    startLoading();
    try {
      const res = await fetch("/api/questions");
      if (!res.ok) throw new Error("خطا در دریافت سوالات");
      const data = await res.json();

      // فقط سوالات فعال و دارای پاسخ
      const answeredQuestions = data.filter(
        (q) => q.isActive && q.answer && q.answer.trim() !== ""
      );

      setQuestions(answeredQuestions.slice(0, 10));

      if (answeredQuestions.length > 0) {
        const newestId = answeredQuestions[0]._id;

        if (!lastQuestionId) {
          setLastQuestionId(newestId);
          localStorage.setItem("lastQuestionId", newestId);
          setHasNewQuestion(false);
          localStorage.setItem("hasNewQuestion", "false");
        } else if (lastQuestionId !== newestId) {
          setHasNewQuestion(true);
          localStorage.setItem("hasNewQuestion", "true");
          setLastQuestionId(newestId);
          localStorage.setItem("lastQuestionId", newestId);
        }
      }
    } catch (error) {
      alert(error.message);
    }finally{
      stopLoading()
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.question.trim()) {
      alert("عنوان سوال الزامی است");
      return;
    }

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: formData.question.trim() }),
      });

      if (!res.ok) throw new Error("خطا در ثبت سوال");
      setShowModal(false);
      setFormData({ question: "" });
      setHasNewQuestion(true);
      localStorage.setItem("hasNewQuestion", "true");
      addNotification(`سوال جدید: ${formData.question.trim()}`);
      await fetchQuestions();
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ question: e.target.value });
  };

  return (
    <div className="content-wrapper px-4 px-md-5">
      <div className="books-header my-4 px-0">
        <h2>سوالات متداول</h2>
        <button
          className="btn-custom-add"
          variant="primary"
          onClick={() => setShowModal(true)}
        >
          ثبت سوال جدید
        </button>
      </div>
      <Accordion className="accordion-purple-border">
        {questions.map((q, idx) => (
          <Accordion.Item eventKey={idx.toString()} key={q._id}>
            <Accordion.Header>{q.question}</Accordion.Header>
            <Accordion.Body>
              {q.isActive ? (
                q.answer ? (
                  <p>
                    <span className="custom-text">پاسخ: </span>
                    {q.answer}
                  </p>
                ) : (
                  <em>پاسخ در حال بررسی است.</em>
                )
              ) : (
                <em>در انتظار پاسخ...</em>
              )}
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="modal-header-purple">
          <Modal.Title>ثبت سوال جدید</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formQuestion">
              <Form.Label>سوال</Form.Label>
              <Form.Control
                type="text"
                name="question"
                value={formData.question}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <button className="btn-custom-file" type="submit">
              ثبت سوال
            </button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* مدال پیام موفقیت */}
      <Modal
        show={showSuccessModal}
        onHide={() => setShowSuccessModal(false)}
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton className="modal-header-purple">
          <Modal.Title>پیام موفقیت</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-purple">
          سوال شما با موفقیت ثبت شد!
        </Modal.Body>
        <Modal.Footer className="modal-footer-purple">
          <button
            className="btn-custom-file"
            onClick={() => setShowSuccessModal(false)}
          >
            بستن
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

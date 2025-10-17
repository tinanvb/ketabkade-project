"use client";
import React, { useState, useEffect } from "react";
import { Container, Row, Alert, Table } from "react-bootstrap";
import GeneralLoading from "@/app/components/ui/GeneralLoading";
import GeneralError from "@/app/components/ui/GeneralError";
import Link from "next/link";
import ConfirmDeleteModal from "@/app/components/ui/ConfirmDeleteModal";
import { FaRegTrashCan } from "react-icons/fa6";
import { CiEdit } from "react-icons/ci";

const AnswerQuestions = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  // state مدال حذف
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState(null);

  // دریافت سوالات
  const fetchQuestions = async () => {
    try {
      const res = await fetch("/api/questions");
      if (!res.ok) throw new Error("خطا در دریافت سوالات");
      const data = await res.json();
      setFaqs(data.sort((a, b) => a.order - b.order));
    } catch (err) {
      setError(err.message || "خطای ناشناخته");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // مدیریت مدال حذف
  const openDeleteModal = (faq) => {
    setFaqToDelete(faq);
    setShowDeleteModal(true);
  };
  const closeDeleteModal = () => {
    setFaqToDelete(null);
    setShowDeleteModal(false);
  };

  const confirmDelete = async () => {
    if (!faqToDelete) return;
    try {
      const res = await fetch(`/api/questions/${faqToDelete._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("حذف انجام نشد");

      setFaqs((prev) => prev.filter((q) => q._id !== faqToDelete._id));
      setMessage("سوال حذف شد");
    } catch (err) {
      setError(err.message || "خطا در حذف سوال");
    } finally {
      closeDeleteModal();
    }
  };

  // تغییر وضعیت فعال/غیرفعال
  const toggleStatus = async (id) => {
    const faqToToggle = faqs.find((faq) => faq._id === id);
    if (!faqToToggle) return;

    const updated = { ...faqToToggle, isActive: !faqToToggle.isActive };
    try {
      const res = await fetch(`/api/questions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error("خطا در بروزرسانی وضعیت");

      setFaqs((prev) => prev.map((item) => (item._id === id ? updated : item)));
      setMessage("وضعیت سوال تغییر کرد.");
    } catch (err) {
      setError(err.message || "خطا در تغییر وضعیت");
    }
  };

  // فقط سوالات پاسخ داده شده
  const answeredFaqs = faqs.filter(
    (faq) => faq.isActive && faq.answer?.trim() !== ""
  );

  return (
    <section className="admin-section">
      <h4 className="font-bold mb-4 text-right">سوالات پاسخ داده شده</h4>
      {error && <GeneralError error={error} />}
      {message && <Alert variant="success">{message}</Alert>}

      {loading ? (
        <GeneralLoading />
      ) : answeredFaqs.length === 0 ? (
        <p className="text-center">سوالی پاسخ داده نشده است.</p>
      ) : (
        <Table
          striped
          bordered
          hover
          responsive
          className="mb-5 text-center align-middle"
        >
          <thead className="bg-gray-200">
            <tr>
              <th>ترتیب</th>
              <th>عنوان سوال</th>
              <th>پاسخ سوال</th>
              <th>وضعیت</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {answeredFaqs.map((faq) => (
              <tr key={faq._id} className="border-t">
                <td>{faq.order}</td>
                <td>{faq.question}</td>
                <td>{faq.answer}</td>
                <td>
                  <button
                    onClick={() => toggleStatus(faq._id)}
                    className="text-sm border-0"
                  >
                    {faq.isActive ? "✅" : "❌"}
                  </button>
                </td>
                <td>
                  <div className="d-flex justify-content-center align-items-center gap-3">
                    <Link
                      href={`/admin/questions/${faq._id}`}
                      className="btn-custom-edit rounded px-1"
                    >
                      <CiEdit /> ویرایش
                    </Link>
                    <button
                      onClick={() => openDeleteModal(faq)}
                      className="btn-custom-delete rounded"
                    >
                      <FaRegTrashCan /> حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <Link href="/admin/questions/unAnswer" className="btn-custom-add mt-4">
        سوالات بدون پاسخ{" "}
      </Link>
      <ConfirmDeleteModal
        show={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="تأیید حذف سوال"
        message={
          faqToDelete
            ? `آیا مطمئن هستید که می‌خواهید سوال "${faqToDelete.question}" را حذف کنید؟`
            : undefined
        }
      />
    </section>
  );
};

export default AnswerQuestions;

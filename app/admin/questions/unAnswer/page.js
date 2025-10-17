"use client";
import React, { useState, useEffect } from "react";
import { Container, Row, Table, Alert } from "react-bootstrap";
import GeneralLoading from "@/app/components/ui/GeneralLoading";
import GeneralError from "@/app/components/ui/GeneralError";
import ConfirmDeleteModal from "@/app/components/ui/ConfirmDeleteModal";
import Link from "next/link";
import { FaRegTrashCan } from "react-icons/fa6";
import TablePagination from "@/app/components/ui/TablePagination";

const UnansweredQuestions = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  // مدال حذف
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await fetch("/api/questions");
        if (!res.ok) throw new Error("خطا در دریافت سوالات");
        const data = await res.json();

        const unanswered = data.filter(
          (faq) =>
            faq.isActive === false || !faq.answer || faq.answer.trim() === ""
        );

        setFaqs(unanswered.sort((a, b) => a.order - b.order));
      } catch (err) {
        setError(err.message || "خطای ناشناخته");
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

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
      if (!res.ok) throw new Error("خطا در حذف سوال");

      setFaqs((prev) => prev.filter((q) => q._id !== faqToDelete._id));
      setMessage("سوال حذف شد");
    } catch (err) {
      setError(err.message || "خطا در حذف سوال");
    } finally {
      closeDeleteModal();
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentFaqs = faqs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(faqs.length / itemsPerPage);

  return (
    <section className='admin-section'>
      <Row>
        <main className="p-4">
          <h6 className="font-bold mb-4 text-right">
            سوالات پاسخ داده نشده یا غیرفعال
          </h6>

          {error && <GeneralError error={error} />}
          {message && <Alert variant="success">{message}</Alert>}

          {loading ? (
            <GeneralLoading />
          ) : currentFaqs.length === 0 ? (
            <p className="text-center">
              هیچ سوال غیرفعال یا بدون پاسخ وجود ندارد.
            </p>
          ) : (
            <>
              <Table striped bordered hover responsive className="text-center align-middle">
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
                  {currentFaqs.map((faq , index) => (
                    <tr key={faq._id} className="border-t">
                      <td>{indexOfFirstItem + index + 1}</td>
                      <td>{faq.question}</td>
                      <td>{faq.answer || <em>بدون پاسخ</em>}</td>
                      <td>
                        <button
                          onClick={() => toggleStatus(faq._id)}
                          className="text-sm border-0"
                        >
                          {faq.isActive ? "✅" : "❌"}
                        </button>
                      </td>
                      <td>
                        <div className="d-flex justify-content-center gap-3">
                          <Link
                            href={`/admin/questions/${faq._id}`}
                            className="btn-custom-file rounded px-1"
                          >
                            پاسخ
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

              {/* Pagination */}
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}

          <Link href="/admin/questions" className="btn-custom-add mt-4">
            بازگشت به مدیریت سوالات
          </Link>
        </main>
      </Row>

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

export default UnansweredQuestions;

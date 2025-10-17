"use client";
import { useEffect, useState } from "react";
import { Container, Row, Table, Button, Alert } from "react-bootstrap";
import GeneralError from "@/app/components/ui/GeneralError";
import ReplyForm from "@/app/components/ui/ReplyForm";
import { Star } from "lucide-react";
import moment from "moment-jalaali";
import GeneralLoading from "@/app/components/ui/GeneralLoading";
import TablePagination from "@/app/components/ui/TablePagination";

moment.loadPersian({ dialect: "persian-modern" });

const Comments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/comments");
        if (!res.ok) throw new Error("مشکل در دریافت نظرات");
        const data = await res.json();
        setComments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, []);

  const updateComment = (id, updates) => {
    setComments((prev) =>
      prev.map((c) => (c._id === id ? { ...c, ...updates } : c))
    );
  };

  const handleAction = async (id, action, extra = {}) => {
    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      if (!res.ok) throw new Error("خطا در انجام عملیات");
      const data = await res.json();
      updateComment(id, data);
      setMessage("عملیات با موفقیت انجام شد.");
    } catch {
      setError("خطا در انجام عملیات");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("آیا از حذف این نظر مطمئن هستید؟")) return;
    try {
      const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setComments((prev) => prev.filter((c) => c._id !== id));
      setMessage("نظر با موفقیت حذف شد.");
    } catch {
      setError("خطا در حذف نظر");
    }
  };

  const renderStars = (count) => {
    const stars = Math.max(0, Math.min(5, Number(count)));
    return (
      <div className="d-flex justify-content-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            stroke={i < stars ? "#9710c8" : "#d1d5db"}
            fill={i < stars ? "#9710c8" : "none"}
          />
        ))}
      </div>
    );
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentComments = comments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(comments.length / itemsPerPage);

  return (
    <section className="admin-section">
      <div className="admin-header">
        <h4 className="my-4">مدیریت نظرات</h4>
      </div>
      {error && <GeneralError error={error} />}
      {message && <Alert variant="success">{message}</Alert>}

      {loading ? (
        <GeneralLoading />
      ) : (
        <>
          <Table
            striped
            bordered
            hover
            responsive
            className="mt-3 text-center align-middle"
          >
            <thead>
              <tr>
                <th>شناسه</th>
                <th>نام کاربر</th>
                <th>متن نظر</th>
                <th>امتیاز</th>
                <th>محصول</th>
                <th>وضعیت</th>
                <th>تاریخ</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {currentComments.map((comment, index) => (
                <tr key={comment._id}>
                  <td>{indexOfFirstItem + index + 1}</td>
                  <td>
                    {`${comment.user?.firstname || ""} ${
                      comment.user?.lastname || ""
                    }`.trim() || "نام نامشخص"}
                  </td>
                  <td>
                    {comment.commentText}
                    {comment.reply?.text && (
                      <div className="text-sm text-primary mt-2">
                        پاسخ ادمین: {comment.reply.text}
                      </div>
                    )}
                  </td>
                  <td>{renderStars(comment.rating)}</td>
                  <td>{comment.productName?.name || "نام محصول نامشخص"}</td>
                  <td>{comment.approved ? "تایید شده" : "در انتظار تایید"}</td>
                  <td>{moment(comment.createdAt).format("jYYYY/jMM/jDD")}</td>
                  <td className="d-flex flex-column gap-1">
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleAction(comment._id, "approve")}
                    >
                      تایید
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleAction(comment._id, "reject")}
                    >
                      رد
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        setReplyingTo(
                          replyingTo === comment._id ? null : comment._id
                        )
                      }
                    >
                      پاسخ
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleDelete(comment._id)}
                    >
                      حذف
                    </Button>
                  </td>
                </tr>
              ))}

              {replyingTo && (
                <tr>
                  <td colSpan="8">
                    <ReplyForm
                      commentId={replyingTo}
                      onClose={() => setReplyingTo(null)}
                      onReplied={(text) =>
                        handleAction(replyingTo, "reply", {
                          replyText: text,
                        })
                      }
                    />
                  </td>
                </tr>
              )}
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
    </section>
  );
};

export default Comments;

"use client";
import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import Link from "next/link";
import { AiOutlineDelete, AiOutlineEdit, AiOutlinePlus } from "react-icons/ai";
import GeneralError from "@/app/components/ui/GeneralError";
import GeneralLoading from "@/app/components/ui/GeneralLoading";
import ConfirmDeleteModal from "@/app/components/ui/ConfirmDeleteModal";
import TablePagination from "@/app/components/ui/TablePagination";

const Tags = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");

  // Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tagToDelete, setTagToDelete] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch tags
  const fetchTags = async () => {
    try {
      const res = await fetch("/api/tags");
      if (!res.ok) throw new Error("خطا در دریافت برچسب‌ها");
      const data = await res.json();
      data.sort((a, b) => a.name.localeCompare(b.name));
      setTags(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  // Open delete modal
  const confirmDelete = (tag) => {
    setTagToDelete(tag);
    setShowDeleteModal(true);
  };

  // Delete tag
  const handleDelete = async () => {
    if (!tagToDelete) return;
    try {
      const res = await fetch(`/api/tags/${tagToDelete._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("حذف برچسب موفق نبود");
      setTags((prev) => prev.filter((t) => t._id !== tagToDelete._id));
      setSuccess("برچسب با موفقیت حذف شد");
    } catch (err) {
      setError(err.message);
    } finally {
      setShowDeleteModal(false);
      setTagToDelete(null);
    }
  };

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTags = tags.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(tags.length / itemsPerPage);

  return (
    <section className='admin-section'>
      <div className="admin-header">
        <h4 >مدیریت برچسب‌ها</h4>
        <Link href="tags/add" className="btn-custom-add">
          <AiOutlinePlus />
          افزودن
        </Link>
      </div>

      {error && <GeneralError error={error} />}
      {success && (
        <div className="alert alert-success text-center mx-3">{success}</div>
      )}

      {loading ? (
        <GeneralLoading />
      ) : (
        <>
          <Table
            striped
            bordered
            hover
            responsive
            className="align-middle custom-table"
          >
            <thead className="custom-header">
              <tr className="text-center">
                <th>شناسه</th>
                <th>نام</th>
                <th>وضعیت</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {currentTags.map((tag, index) => (
                <tr key={tag._id} className="text-center">
                  <td>{indexOfFirstItem + index + 1}</td>
                  <td>{tag.name}</td>
                  <td>
                    {tag.isActive ? (
                      <div className="status-active">فعال</div>
                    ) : (
                      <div className="status-inactive">غیرفعال</div>
                    )}
                  </td>
                  <td>
                    <div className="btn-group-inline">
                      <Link
                        href={`/admin/tags/edit/${tag._id}`}
                        className="btn-custom-edit"
                      >
                        <AiOutlineEdit /> ویرایش
                      </Link>
                      <button
                        onClick={() => confirmDelete(tag)}
                        className="btn-custom-delete"
                      >
                        <AiOutlineDelete /> حذف
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

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="تأیید حذف برچسب"
        message={
          tagToDelete
            ? `آیا از حذف برچسب "${tagToDelete.name}" مطمئن هستید؟`
            : "آیا از حذف این برچسب مطمئن هستید؟"
        }
      />
    </section>
  );
};

export default Tags;

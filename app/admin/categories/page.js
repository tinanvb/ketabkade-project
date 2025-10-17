"use client";
import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import Link from "next/link";
import { AiOutlineDelete, AiOutlineEdit, AiOutlinePlus } from "react-icons/ai";
import GeneralError from "@/app/components/ui/GeneralError";
import GeneralLoading from "@/app/components/ui/GeneralLoading";
import ConfirmDeleteModal from "@/app/components/ui/ConfirmDeleteModal";
import TablePagination from "@/app/components/ui/TablePagination";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // دریافت دسته‌بندی‌ها
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("مشکلی در دریافت دسته‌بندی‌ها پیش آمد");
        const data = await res.json();
        data.sort((a, b) => a.name.localeCompare(b.name));
        setCategories(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // باز کردن مودال حذف
  const confirmDelete = (id) => {
    setCategoryToDelete(id);
    setShowDeleteModal(true);
  };

  // حذف دسته‌بندی
  const handleDelete = async () => {
    if (!categoryToDelete) return;
    try {
      const res = await fetch(`/api/categories/${categoryToDelete}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("خطا در حذف دسته‌بندی");
      setCategories(categories.filter((c) => c._id !== categoryToDelete));
      setSuccess("دسته‌بندی حذف شد.");
    } catch (err) {
      setError(err.message);
    } finally {
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    }
  };

  // پاک کردن پیام موفقیت پس از ۳ ثانیه
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = categories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(categories.length / itemsPerPage);

  return (
  
    <section className='admin-section'>

      <div className="admin-header">
        <h4 >مدیریت دسته‌بندی‌ها</h4>
        <Link href="categories/add" className="btn-custom-add">
          <AiOutlinePlus /> افزودن
        </Link>
      </div>

      {error && <GeneralError error={error} />}
      {success && <p className="text-success text-center">{success}</p>}

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
              {currentCategories.map((category, index) => (
                <tr key={category._id} className="text-center">
                  <td>{indexOfFirstItem + index + 1}</td>
                  <td>{category.name}</td>
                  <td>
                    {category.isActive ? (
                      <div className="status-active">فعال</div>
                    ) : (
                      <div className="status-inactive">غیرفعال</div>
                    )}
                  </td>
                  <td>
                    <div className="btn-group-inline">
                      <Link
                        href={`/admin/categories/edit/${category._id}`}
                        className="btn-custom-edit"
                      >
                        <AiOutlineEdit /> ویرایش
                      </Link>
                      <button
                        onClick={() => confirmDelete(category._id)}
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
        title="تأیید حذف دسته‌بندی"
        message="آیا از حذف این دسته‌بندی مطمئن هستید؟"
      />
    </section>
  );
};

export default Categories;

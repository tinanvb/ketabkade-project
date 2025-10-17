"use client";
import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import Link from "next/link";
import {
  AiOutlineDelete,
  AiOutlineEdit,
  AiOutlinePlus,
  AiOutlinePaperClip,
} from "react-icons/ai";
import { FaDownload } from "react-icons/fa";
import GeneralError from "@/app/components/ui/GeneralError";
import ConfirmDeleteModal from "@/app/components/ui/ConfirmDeleteModal";
import GeneralLoading from "@/app/components/ui/GeneralLoading";
import TablePagination from "@/app/components/ui/TablePagination";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // دریافت لیست محصولات
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("مشکل در دریافت محصولات");

        const data = await response.json();
        data.sort((a, b) => a.name.localeCompare(b.name, "fa"));
        setProducts(data);
      } catch (err) {
        setError(err.message || "خطا در دریافت محصولات");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // محاسبه ردیف‌های فعلی جدول
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  // باز کردن مدال حذف
  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  // بستن مدال حذف
  const closeDeleteModal = () => {
    setProductToDelete(null);
    setShowDeleteModal(false);
  };

  // حذف محصول
  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      const response = await fetch(`/api/products/${productToDelete._id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("مشکلی در حذف پیش آمد");

      setProducts((prev) => prev.filter((p) => p._id !== productToDelete._id));
    } catch (err) {
      setError(err.message || "خطا در حذف محصول");
    } finally {
      closeDeleteModal();
    }
  };

  return (
    <section className="admin-section">
      <div className="admin-header">
        <h4>مدیریت محصولات</h4>
        <Link href="/admin/products/add">
          <button className="btn-custom-add">
            <AiOutlinePlus className="me-1" /> افزودن محصول
          </button>
        </Link>
      </div>

      {error && <GeneralError message={error} onClear={() => setError(null)} />}

      {loading ? (
        <GeneralLoading />
      ) : products.length === 0 ? (
        <p className="text-center">هیچ محصولی یافت نشد.</p>
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
                <th>#</th>
                <th>تصویر</th>
                <th>نام</th>
                <th>نویسنده</th>
                <th>فایل</th>
                <th>نوع فایل</th>
                <th>قیمت</th>
                <th>قیمت تخفیفی</th>
                <th>وضعیت فروش</th>
                <th>وضعیت</th>
                <th>توضیحات</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.map((product, index) => (
                <tr key={product._id} className="text-center">
                  <td>{indexOfFirstItem + index + 1}</td>
                  <td>
                    <img
                      src={
                        product.imageUrl
                          ? `${product.imageUrl}?t=${Date.now()}`
                          : "/placeholder-image.png"
                      }
                      alt={product.name}
                      width="50"
                      height="50"
                      style={{ objectFit: "cover" }}
                    />
                  </td>
                  <td>{product.name}</td>
                  <td>{product.author || "نامشخص"}</td>
                  <td>
                    {product.fileUrl ? (
                      <a
                        href={product.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaDownload />
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>{product.fileType?.toUpperCase() || "-"}</td>
                  <td>
                    {product.price === 0
                      ? "رایگان"
                      : `${product.price?.toLocaleString("fa-IR")} تومان`}
                  </td>
                  <td>
                    {product.discountedPrice
                      ? `${product.discountedPrice.toLocaleString(
                          "fa-IR"
                        )} تومان`
                      : "-"}
                  </td>
                  <td>
                    {product.saleStatus ? (
                      <div className="status-active">آماده فروش</div>
                    ) : (
                      <div className="status-inactive">غیر قابل فروش</div>
                    )}
                  </td>
                  <td>
                    {product.isActive ? (
                      <div className="status-active">فعال</div>
                    ) : (
                      <div className="status-inactive">غیرفعال</div>
                    )}
                  </td>
                  <td>{product.description?.substring(0, 30) || "-"}...</td>
                  <td>
                    <div className="action-buttons">
                      <Link href={`/admin/products/${product._id}/files`}>
                        <button className="btn-custom-file">
                          <AiOutlinePaperClip />
                        </button>
                      </Link>
                      <Link href={`/admin/products/edit/${product._id}`}>
                        <button className="btn-custom-edit">
                          <AiOutlineEdit />
                        </button>
                      </Link>
                      <button
                        onClick={() => openDeleteModal(product)}
                        className="btn-custom-delete"
                      >
                        <AiOutlineDelete />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      <ConfirmDeleteModal
        show={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="تأیید حذف محصول"
        message={
          productToDelete
            ? `آیا مطمئن هستید که می‌خواهید محصول "${productToDelete.name}" را حذف کنید؟`
            : undefined
        }
      />
    </section>
  );
};

export default Products;

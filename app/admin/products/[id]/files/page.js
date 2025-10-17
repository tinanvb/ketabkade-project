"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Table, Button } from "react-bootstrap";
import Link from "next/link";
import { AiOutlinePlus, AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import ConfirmDeleteModal from "@/app/components/ui/ConfirmDeleteModal";

const ProductFiles = () => {
  const { id } = useParams();
  const [files, setFiles] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  // دریافت اطلاعات محصول
  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) throw new Error("خطا در دریافت محصول");
      const data = await res.json();
      setProduct(data);
      return data;
    } catch {
      setError("خطا در دریافت اطلاعات محصول");
    }
  };

  // دریافت فایل‌ها
  const fetchFiles = async (productData) => {
    try {
      const res = await fetch(`/api/productFiles?productId=${id}`);
      if (!res.ok) throw new Error("خطا در دریافت فایل‌ها");
      const data = await res.json();

      const hasMainFile = data.some((f) => f.fileUrl === productData?.fileUrl);
      const allFiles = hasMainFile
        ? data
        : [
            {
              _id: "main-file",
              fileUrl: productData.fileUrl,
              fileType: productData.fileUrl?.split(".").pop(),
            },
            ...data,
          ];

      const uniqueFiles = allFiles.filter(
        (f, index, self) =>
          self.findIndex((x) => x.fileUrl === f.fileUrl) === index
      );

      setFiles(uniqueFiles);
      return uniqueFiles;
    } catch {
      setError("خطا در دریافت فایل‌ها");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const productData = await fetchProduct();
      const fileData = await fetchFiles(productData);

      // اگر فایل اصلی در لیست نبود، اضافه کن
      if (
        productData?.fileUrl &&
        !fileData?.some((f) => f.fileUrl === productData.fileUrl)
      ) {
        await fetch("/api/productFiles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product: productData._id,
            fileUrl: productData.fileUrl,
            fileType: productData.fileUrl.split(".").pop(),
          }),
        });
        await fetchFiles(productData);
      }
    };
    init();
  }, [id]);

  // باز کردن مدال حذف
  const confirmDelete = (fileId) => {
    setFileToDelete(fileId);
    setShowDeleteModal(true);
  };

  // حذف فایل
  const handleDelete = async () => {
    if (!fileToDelete) return;
    try {
      const res = await fetch(`/api/productFiles/${fileToDelete}/`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("حذف ناموفق بود");

      setFiles(files.filter((f) => f._id !== fileToDelete));
    } catch {
      setError("خطا در حذف فایل");
    } finally {
      setShowDeleteModal(false);
      setFileToDelete(null);
    }
  };

  // تنظیم به عنوان فایل اصلی
  const setAsMainFile = async (fileUrl) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl }),
      });
      if (!res.ok) throw new Error();

      const updatedProduct = await fetchProduct();
      await fetchFiles(updatedProduct);
    } catch {
      setError("خطا در تنظیم فایل اصلی");
    }
  };

  return (
    <section className='admin-section'>
      <div className="admin-header">
        <h4>مدیریت فایل‌های محصول</h4>
      </div>

      <div className="d-flex justify-content-between align-items-center m-4">
        {product && (
          <p className="text-muted">
            کتاب: <strong>{product.name}</strong>
          </p>
        )}
        <Link
          className="btn-custom-add"
          href={`/admin/products/${id}/files/add`}
        >
          <AiOutlinePlus /> افزودن
        </Link>
      </div>

      {error && <p className="text-danger">{error}</p>}
      {loading ? (
        <p>در حال بارگذاری...</p>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>لینک فایل</th>
              <th>نوع فایل</th>
              <th>تنظیمات</th>
            </tr>
          </thead>
          <tbody>
            {files.map((f, index) => {
              const extension =
                f.fileUrl?.split(".").pop()?.toLowerCase() || "نامشخص";
              const isMain = product?.fileUrl === f.fileUrl;

              return (
                <tr key={f._id}>
                  <td>{index + 1}</td>
                  <td>
                    <a href={f.fileUrl} target="_blank" rel="noreferrer">
                      {f.fileUrl}
                    </a>
                  </td>
                  <td>{extension}</td>
                  <td>
                    {isMain ? (
                      <span className="text-success">فایل اصلی</span>
                    ) : (
                      <div className="action-buttons">
                        <Button
                          variant="success"
                          size="sm"
                          className="me-2"
                          onClick={() => setAsMainFile(f.fileUrl)}
                        >
                          تنظیم به عنوان فایل اصلی
                        </Button>
                        <Link
                          href={`/admin/products/${id}/files/edit/${f._id}`}
                          className="btn-custom-edit"
                        >
                          <AiOutlineEdit /> ویرایش
                        </Link>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => confirmDelete(f._id)}
                        >
                          <AiOutlineDelete /> حذف
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}

      {/* مدال حذف عمومی */}
      <ConfirmDeleteModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="تأیید حذف فایل"
        message="آیا از حذف این فایل مطمئن هستید؟"
      />

      <div className="mt-4 text-start">
        <Link href="/admin/products" className="btn-custom-add">
          بازگشت به لیست محصولات
        </Link>
      </div>
    </section>
  );
};

export default ProductFiles;

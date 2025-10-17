"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Form, Alert } from "react-bootstrap";
import Link from "next/link";

const allowedTypes = [
  "pdf",
  "zip",
  "rar",
  "jpg",
  "jpeg",
  "png",
  "gif",
  "mp3",
  "wav",
];

const AddFile = () => {
  const { id } = useParams();
  const router = useRouter();

  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState("");
  const [error, setError] = useState(null);
  const [productFileUrl, setProductFileUrl] = useState(null);
  const [existingFiles, setExistingFiles] = useState([]);
  // دریافت فایل‌های قبلی برای جلوگیری از تکرار
  useEffect(() => {
    const fetchData = async () => {
      try {
        const productRes = await fetch(`/api/products/${id}`);
        const productData = await productRes.json();
        setProductFileUrl(productData.fileUrl);

        const filesRes = await fetch(`/api/productFiles?productId=${id}`);
        const filesData = await filesRes.json();
        setExistingFiles(filesData.map((f) => f.fileUrl.toLowerCase()));
      } catch (err) {
        console.error("خطا در دریافت اطلاعات:", err);
      }
    };

    fetchData();
  }, [id]);
  // اعتبارسنجی و ارسال فایل جدید

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError("لطفاً یک فایل انتخاب کنید");
      return;
    }

    const actualExtension = file.name.split(".").pop().toLowerCase();
    const selectedType = fileType.toLowerCase();

    if (!allowedTypes.includes(selectedType)) {
      setError("نوع فایل نامعتبر است.");
      return;
    }

    if (selectedType !== actualExtension) {
      setError("فرمت فایل با نوع انتخاب‌شده مطابقت ندارد.");
      return;
    }

    const targetFileUrl = `/uploads/${file.name.toLowerCase()}`;
    if (existingFiles.includes(targetFileUrl)) {
      setError("این فایل قبلاً ثبت شده است.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("productId", id);
    formData.append("type", selectedType);

    try {
      const res = await fetch("/api/productFiles", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "خطا در ذخیره فایل");
      }

      router.push(`/admin/products/${id}/files`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className='admin-section'>
      <div className="admin-header">
        <h4>افزودن فایل</h4>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>فایل</Form.Label>
          <Form.Control
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>نوع فایل</Form.Label>
          <Form.Select
            value={fileType}
            onChange={(e) => setFileType(e.target.value)}
          >
            <option value="">انتخاب نوع فایل</option>
            {allowedTypes.map((type) => (
              <option key={type} value={type}>
                {type.toUpperCase()}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <div className="d-flex gap-2">
          <button type="submit" className="btn-custom-submit">
            ذخیره فایل
          </button>
          <Link href={`/admin/products/${id}/files`}>
            <button type="button" className="btn-custom-add">
              بازگشت
            </button>
          </Link>
        </div>
      </Form>
    </section>
  );
};

export default AddFile;

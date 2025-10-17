"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Form, Alert } from "react-bootstrap";
import Link from "next/link";
import GeneralLoading from "@/app/components/ui/GeneralLoading";

const EditFile = () => {
  const { id, fileId } = useParams();
  const [file, setFile] = useState(null);
  const [currentFile, setCurrentFile] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  // گرفتن اطلاعات فایل فعلی هنگام بارگذاری کامپوننت
  useEffect(() => {
    const fetchFile = async () => {
      try {
        const res = await fetch(`/api/productFiles/${fileId}`);
        if (!res.ok) throw new Error("مشکل در دریافت فایل");
        const data = await res.json();
        setCurrentFile(data.fileUrl);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFile();
  }, [fileId]);
  // ارسال فایل جدید به سرور و بروزرسانی

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("لطفاً یک فایل جدید انتخاب کنید");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/productFiles/${fileId}`, {
        method: "PUT",
        body: formData,
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "ویرایش فایل ناموفق بود");
      }

      router.push(`/admin/products/${id}/files`);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <GeneralLoading />;

  return (
    <section className='admin-section'>
      <div className="admin-header">
        <h4>ویرایش فایل محصول</h4>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          {currentFile && (
            <div className="mt-3">
              <strong>فایل فعلی:</strong>
              <br />
              <a href={currentFile} target="_blank">
                {currentFile.split("/").pop()}
              </a>
            </div>
          )}
          <Form.Label>فایل جدید</Form.Label>
          <Form.Control
            type="file"
            accept="file/*"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </Form.Group>
        <div className="d-flex gap-2">
          <button type="submit" className="btn-custom-submit">
            ذخیره
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

export default EditFile;

"use client";
import { productDescriptionRegex, productNameRegex } from "@/app/utils/regex";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Alert, Form } from "react-bootstrap";

const AddProduct = () => {
  // مقادیر فرم
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [price, setPrice] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [fileType, setFileType] = useState("");
  const [saleStatus, setSaleStatus] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState("");
  const [author, setAuthor] = useState("");
  const router = useRouter();

  // دریافت دسته‌بندی‌های فعال از API
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        const activeCategories = data.filter((cat) => cat.isActive);
        const sorted = activeCategories.sort((a, b) =>
          a.name.localeCompare(b.name, "fa")
        );
        setCategories(sorted);
      })
      .catch(() => setError("مشکلی در دریافت دسته بندی ها رخ داده است"));
  }, []);

  // دریافت برچسب‌های فعال از API
  useEffect(() => {
    fetch("/api/tags")
      .then((res) => res.json())
      .then((data) => {
        const activeTags = data.filter((tag) => tag.isActive);
        const sorted = activeTags.sort((a, b) =>
          a.name.localeCompare(b.name, "fa")
        );
        setTags(sorted);
      })
      .catch(() => setError("مشکلی در دریافت برچسب‌ها رخ داده است"));
  }, []);

  // اعتبارسنجی فرم قبل از ارسال
  const validateForm = () => {
    if (!name || name.trim() === "") {
      setFormError("نام محصول الزامی میباشد");
      return false;
    } else if (!productNameRegex.test(name.trim())) {
      setFormError("نام محصول باید بین ۳ تا ۵۰ کاراکتر باشد");
      return false;
    }

    if (!description || description.trim() === "") {
      setFormError("توضیحات محصول الزامی میباشد");
      return false;
    } else if (!productDescriptionRegex.test(description.trim())) {
      setFormError("توضیحات محصول باید حداقل ۳ کاراکتر باشد");
      return false;
    }

    if (price === "" || isNaN(Number(price)) || Number(price) < 0) {
      setFormError("قیمت محصول نمی‌تواند منفی باشد");
      return false;
    }
    if (discountedPrice) {
      if (Number(price) === 0 && Number(discountedPrice) > 0) {
        setFormError("برای محصول رایگان، قیمت تخفیفی باید ۰ باشد");
        return false;
      }
      if (Number(discountedPrice) >= Number(price)) {
        setFormError("قیمت تخفیفی باید کمتر از قیمت اصلی باشد");
        return false;
      }
    }

    if (!category) {
      setFormError("دسته بندی محصول باید باشد");
      return false;
    }

    if (!image) {
      setFormError("انتخاب تصویر الزامی میباشد");
      return false;
    }

    if (file && fileType) {
      const allowedTypes = {
        zip: "application/zip",
        pdf: "application/pdf",
        mp3: "audio/mpeg",
        wav: "audio/wav",
      };

      const selectedExtension = fileType.toLowerCase().trim();

      if (!allowedTypes[selectedExtension]) {
        setFormError("نوع فایل وارد شده معتبر نیست. فقط zip یا pdf مجاز است");
        return false;
      }

      if (allowedTypes[selectedExtension] !== file.type) {
        setFormError(
          `فرمت فایل انتخاب شده با نوع فایل (${fileType}) مطابقت ندارد`
        );
        return false;
      }
    }

    if (!author || author.trim() === "") {
      setFormError("نام نویسنده الزامی میباشد");
      return false;
    }

    setFormError("");
    return true;
  };

  const handleTagChange = (e) => {
    const value = e.target.value;
    setSelectedTags((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", Number(price));
      if (discountedPrice)
        formData.append("discountedPrice", Number(discountedPrice));
      formData.append("category", category);
      formData.append("image", image);
      formData.append("file", file);
      formData.append("fileType", fileType);
      formData.append("saleStatus", saleStatus);
      formData.append("isActive", isActive);
      formData.append("author", author);

      selectedTags.forEach((tag) => formData.append("tags", tag));

      const response = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) {
        setFormError(result.message || "خطایی رخ داده است");
        return;
      }
      router.push("/admin/products");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <section className='admin-section'>
      <div className="admin-header">
        <h4 className="my-4">افزودن محصول</h4>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      {formError && <Alert variant="warning">{formError}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>
            نام <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            type="text"
            placeholder="نام ..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>
            نویسنده <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            type="text"
            placeholder="نام نویسنده..."
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>
            توضیحات <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            type="text"
            placeholder="توضیحات ..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>
            تصویر <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            required
            onChange={(e) => setImage(e.target.files[0])}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>فایل محصول</Form.Label>
          <Form.Control
            type="file"
            accept=".zip,.pdf,.mp3,.wav"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>
            قیمت <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            type="number"
            className="no-spinner"
            placeholder="قیمت"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>قیمت تخفیفی</Form.Label>
          <Form.Control
            type="number"
            placeholder="تخفیف..."
            value={discountedPrice}
            onChange={(e) => setDiscountedPrice(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>
            دسته بندی <span className="text-danger">*</span>
          </Form.Label>
          <Form.Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">انتخاب دسته بندی</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>برچسب‌ها</Form.Label>
          <div
            style={{
              border: "1px solid #ddd",
              padding: "10px",
              maxHeight: "150px",
              overflowY: "auto",
              borderRadius: "4px",
            }}
          >
            {tags.length === 0 ? (
              <div>هیچ برچسبی یافت نشد</div>
            ) : (
              tags.map((tag) => (
                <Form.Check
                  key={tag._id}
                  type="checkbox"
                  id={`tag-${tag._id}`}
                  label={tag.name}
                  value={tag._id}
                  checked={selectedTags.includes(tag._id)}
                  onChange={handleTagChange}
                />
              ))
            )}
          </div>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>نوع فایل</Form.Label>
          <Form.Select
            value={fileType}
            onChange={(e) => {
              setFileType(e.target.value);
              setFormError("");
            }}
            required={file}
          >
            <option value="">انتخاب نوع فایل...</option>
            <option value="pdf">PDF</option>
            <option value="zip">ZIP</option>
            <option value="mp3">MP3</option>
            <option value="wav">WAV</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Check
            type="switch"
            label={
              saleStatus ? "محصول آماده فروش است" : "محصول آماده فروش نیست"
            }
            checked={saleStatus}
            onChange={(e) => {
              setSaleStatus(e.target.checked);
              setFormError("");
            }}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label> وضعیت محصول</Form.Label>
          <Form.Check
            type="checkbox"
            label=" فعال"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
        </Form.Group>

        <button type="submit" className="btn-custom-submit">
          ذخیره
        </button>
      </Form>
    </section>
  );
};

export default AddProduct;

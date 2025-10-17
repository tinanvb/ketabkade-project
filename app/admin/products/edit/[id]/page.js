"use client";
import GeneralLoading from "@/app/components/ui/GeneralLoading";
import { productDescriptionRegex, productNameRegex } from "@/app/utils/regex";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Alert, Form, Image } from "react-bootstrap";

const UpdateProduct = () => {
  const { id } = useParams();
  const router = useRouter();
  const [name, setName] = useState("");
  const [author, setAuthor] = useState("");
  const [image, setImage] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [file, setFile] = useState(null);
  const [currentFile, setCurrentFile] = useState("");
  const [fileType, setFileType] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [price, setPrice] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState("");
  const [saleStatus, setSaleStatus] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!id) return;
    const fetchProductData = async () => {
      setLoading(true);
      setError(null);
      try {
        const categoriesResponse = await fetch("/api/categories");
        if (!categoriesResponse.ok) {
          throw new Error("مشکل در دریافت دسته‌بندی‌ها");
        }
        const categoriesDataRaw = await categoriesResponse.json();
        const categoriesData = categoriesDataRaw
          .filter((cat) => cat.isActive)
          .sort((a, b) => a.name.localeCompare(b.name, "fa"));

        const tagsResponse = await fetch("/api/tags");
        if (!tagsResponse.ok) {
          throw new Error("مشکل در دریافت برچسب‌ها");
        }
        const tagsDataRaw = await tagsResponse.json();
        const tagsData = tagsDataRaw
          .filter((tag) => tag.isActive)
          .sort((a, b) => a.name.localeCompare(b.name, "fa"));

        const productResponse = await fetch(`/api/products/${id}`);
        if (!productResponse.ok) {
          throw new Error("مشکل در دریافت اطلاعات محصول");
        }
        const data = await productResponse.json();

        setName(data.name || "");
        setAuthor(data.author || ""); 
        setDescription(data.description || "");
        setPrice(String(data.price || ""));
        setDiscountedPrice(String(data.discountedPrice || ""));
        setCategory(data.category?._id || data.category || "");
        setCurrentImage(data.imageUrl || "");
        setCurrentFile(data.fileUrl || "");
        setFileType(data.fileType || "");
        setSaleStatus(data.saleStatus);
        setIsActive(data.isActive || "");
        setSelectedTags(data.tags?.map((tag) => String(tag._id || tag)) || []);
        setCategories(categoriesData);
        setTags(tagsData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  // اعتبارسنجی فرم  
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
    if (Number(price) === 0 && Number(discountedPrice) > 0) {
      setFormError("برای محصول رایگان، قیمت تخفیفی باید ۰ باشد");
      return false;
    }
    if (!category) {
      setFormError("دسته بندی محصول باید باشد");
      return false;
    }

    if (!image && !currentImage) {
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

      if (file) {
        if (allowedTypes[selectedExtension] !== file.type) {
          setFormError(
            `فرمت فایل انتخاب شده با نوع فایل (${fileType}) مطابقت ندارد`
          );
          return false;
        }
        const filenameExt = file.name.split(".").pop().toLowerCase();
        if (filenameExt !== selectedExtension) {
          setFormError(
            `پسوند فایل (${filenameExt}) با نوع فایل (${selectedExtension}) مطابقت ندارد`
          );
          return false;
        }
      }

      if (!file && currentFile) {
        const filename = currentFile.split("/").pop();
        const filenameExt = filename.split(".").pop().toLowerCase();

        if (filenameExt !== selectedExtension) {
          setFormError(
            `پسوند فایل قبلی (${filenameExt}) با نوع فایل انتخابی (${selectedExtension}) مطابقت ندارد`
          );
          return false;
        }
      }
    }

    setFormError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!validateForm()) {
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("author", author.trim());   
    formData.append("description", description.trim());
    formData.append("price", String(price));
    formData.append("discountedPrice", String(discountedPrice || "0"));
    formData.append("category", category);
    formData.append("fileType", fileType.trim());
    formData.append("saleStatus", String(saleStatus));
    formData.append("isActive", isActive);
    selectedTags.forEach((tagId) => {
      formData.append("tags", tagId);
    });

    if (image) {
      formData.append("image", image);
    }
    if (file) {
      formData.append("file", file);
    }

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "PUT",
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        setError(responseData.message || "خطایی در ویرایش محصول رخ داد.");
        return;
      }
      router.push("/admin/products");
    } catch (error) {
      setError(error.message);
    }
  };

  const handleTagChange = (e) => {
    const tagId = e.target.value;
    setFormError("");
    if (e.target.checked) {
      setSelectedTags([...selectedTags, tagId]);
    } else {
      setSelectedTags(selectedTags.filter((id) => id !== tagId));
    }
  };

  const handleImageChange = (e) => {
    setFormError("");
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setCurrentImage(URL.createObjectURL(file));
    }
  };

  const handleFileChange = (e) => {
    setFormError("");
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFile(file);
      setCurrentFile(file.name);
    }
  };

  const getCleanFileName = (filename) => {
    const parts = filename.split("-");
    const cleanParts = parts.filter((part) => isNaN(part));
    return cleanParts.join("-");
  };

  if (loading) return <GeneralLoading/>;

  return (
    <section className='admin-section'>
      <div className="admin-header">
        <h4 className="my-4">ویرایش محصول: {name}</h4>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      {formError && <Alert variant="warning">{formError}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>
            نام محصول <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setFormError("");
            }}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>نویسنده</Form.Label>
          <Form.Control
            type="text"
            value={author}
            onChange={(e) => {
              setAuthor(e.target.value);
              setFormError("");
            }}
            placeholder="نام نویسنده را وارد کنید"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>
            توضیحات <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setFormError("");
            }}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>تصویر محصول</Form.Label>
          <Form.Control type="file" onChange={handleImageChange} accept="image/*" />
          {currentImage && (
            <Image
              src={currentImage}
              alt="تصویر محصول"
              thumbnail
              style={{ width: "150px", marginTop: "10px" }}
            />
          )}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>فایل محصول</Form.Label>
          <Form.Control type="file" onChange={handleFileChange} />
          {currentFile && (
            <p className="mt-2">فایل فعلی: {getCleanFileName(currentFile)}</p>
          )}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>نوع فایل</Form.Label>
          <Form.Select
            value={fileType}
            onChange={(e) => setFileType(e.target.value)}
          >
            <option value="">انتخاب نوع فایل</option>
            <option value="zip">zip</option>
            <option value="pdf">pdf</option>
            <option value="mp3">mp3</option>
            <option value="wav">wav</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>دسته‌بندی</Form.Label>
          <Form.Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">انتخاب دسته‌بندی</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>برچسب‌ها</Form.Label>
          <div className="tags-checkboxes">
            {tags.map((tag) => (
              <Form.Check
                inline
                key={tag._id}
                label={tag.name}
                type="checkbox"
                value={tag._id}
                checked={selectedTags.includes(tag._id)}
                onChange={handleTagChange}
              />
            ))}
          </div>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>قیمت</Form.Label>
          <Form.Control
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            min={0}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>قیمت تخفیفی</Form.Label>
          <Form.Control
            type="number"
            value={discountedPrice}
            onChange={(e) => setDiscountedPrice(e.target.value)}
            min={0}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Check
            type="checkbox"
            label="در فروش باشد"
            checked={saleStatus}
            onChange={() => setSaleStatus(!saleStatus)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Check
            type="checkbox"
            label="فعال باشد"
            checked={isActive}
            onChange={() => setIsActive(!isActive)}
          />
        </Form.Group>

        <button type="submit" className="btn-custom-submit">
          ثبت تغییرات
        </button>
      </Form>
    </section>
  );
};

export default UpdateProduct;

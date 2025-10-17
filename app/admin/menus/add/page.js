"use client";
import { externalRegex, internalRegex, titleRegex } from "@/app/utils/regex";
import { slugify } from "@/app/utils/slugify";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert, Form, Button } from "react-bootstrap";
import * as FaIcons from "react-icons/fa";
import { joinUrl, reverseUrlSegmentsIfPersian } from "@/app/utils/urlReverse";
import GeneralLoading from "@/app/components/ui/GeneralLoading";

const initialFormState = {
  title: "",
  url: "",
  type: "internal",
  order: 0,
  parent: "",
  isActive: false,
  icon: "",
  urlManuallyEdited: false,
};

const AddMenu = () => {
  const [form, setForm] = useState(initialFormState);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [parentMenuOptions, setParentMenuOptions] = useState([]);
  const [slugPreview, setSlugPreview] = useState("");

  const router = useRouter();

  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFetchLoading(true);
    const fetchMenu = async () => {
      try {
        const res = await fetch("/api/menus");
        const data = await res.json();
        setParentMenuOptions(data.sort((a, b) => a.order - b.order));
      } catch (err) {
        console.error("خطا در گرفتن منوها", err);
        setErrorMessage("خطا در دریافت منوها. لطفاً دوباره تلاش کنید.");
      } finally {
        setFetchLoading(false);
      }
    };
    fetchMenu();
  }, []);

  useEffect(() => {
    if (
      (form.type === "internal" || form.type === "page") &&
      !form.urlManuallyEdited
    ) {
      if (form.title === "") return;
      const newSlug = slugify(form.title);
      let previewUrl = `/${newSlug}`;
      if (form.parent) {
        const parentMenu = parentMenuOptions.find((m) => m._id === form.parent);
        if (parentMenu) {
          const logicalParentUrl = reverseUrlSegmentsIfPersian(parentMenu.url);
          previewUrl = joinUrl(logicalParentUrl, newSlug);
        }
      }
      setForm((prev) => ({ ...prev, url: `/${newSlug}` }));
      setSlugPreview(
        reverseUrlSegmentsIfPersian(previewUrl).replace(/^\//, "")
      );
    }
  }, [
    form.title,
    form.type,
    form.urlManuallyEdited,
    form.parent,
    parentMenuOptions,
  ]);

  const validateForm = () => {
    const newErrors = {};
    if (!form.title.trim()) {
      newErrors.title = "عنوان منو الزامی است.";
    } else if (!titleRegex.test(form.title.trim())) {
      newErrors.title =
        "عنوان باید فقط شامل حروف باشد و بین ۳ تا ۳۰ کاراکتر باشد.";
    }

    const url = form.url.trim();
    if (!url) newErrors.url = "آدرس لینک الزامی است.";
    else if (form.type === "external") {
      if (!externalRegex.test(url))
        newErrors.url = "لینک خارجی باید معتبر باشد";
    } else {
      if (!internalRegex.test(url))
        newErrors.url = "لینک داخلی باید با / شروع شود و فاصله نداشته باشد.";
    }

    const validTypes = ["internal", "external", "page"];
    if (!form.type) {
      newErrors.type = "نوع لینک الزامی است.";
    } else if (!validTypes.includes(form.type)) {
      newErrors.type = "نوع لینک معتبر نیست.";
    }

    if (form.order !== "" && isNaN(Number(form.order))) {
      newErrors.order = "ترتیب نمایش باید عدد باشد.";
    } else if (Number(form.order) < 0) {
      newErrors.order = "ترتیب نمایش نمی‌تواند منفی باشد.";
    }

    if (form.icon && !FaIcons[form.icon]) {
      newErrors.icon = "آیکون وارد شده نامعتبر است.";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const updatedValue = type === "checkbox" ? checked : value;
    setForm((prev) => ({
      ...prev,
      [name]: name === "parent" && value === "" ? null : updatedValue,
      ...(name === "url" ? { urlManuallyEdited: true } : {}),
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    if (name === "title") {
      const newSlug = slugify(value);
      let previewUrl = `/${newSlug}`;
      if (form.parent) {
        const parentMenu = parentMenuOptions.find((m) => m._id === form.parent);
        if (parentMenu) {
          const logicalParentUrl = reverseUrlSegmentsIfPersian(parentMenu.url);
          previewUrl = joinUrl(logicalParentUrl, newSlug);
        }
      }
      setSlugPreview(
        reverseUrlSegmentsIfPersian(previewUrl).replace(/^\//, "")
      );
    }
  };

  const handleResetUrl = () => {
    const newSlug = slugify(form.title);
    let previewUrl = `/${newSlug}`;
    if (form.parent) {
      const parentMenu = parentMenuOptions.find((m) => m._id === form.parent);
      if (parentMenu) {
        const logicalParentUrl = reverseUrlSegmentsIfPersian(parentMenu.url);
        previewUrl = joinUrl(logicalParentUrl, newSlug);
      }
    }
    setForm((prev) => ({ ...prev, url: previewUrl, urlManuallyEdited: false }));
    setSlugPreview(reverseUrlSegmentsIfPersian(previewUrl).replace(/^\//, ""));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitLoading) return;
    setSubmitLoading(true);
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/menus/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          parent: form.parent === "" ? null : form.parent,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(`منو ${data.title} با موفقیت اضافه شد`);
        setForm(initialFormState);
        setSlugPreview("");
        setTimeout(() => router.push("/admin/menus"), 1000);
      } else {
        let errorMsg = data.message || "خطا در افزودن منو";
        if (errorMsg === "شناسه والد نامعتبر است") {
          errorMsg = "منوی والد انتخاب‌شده معتبر نیست.";
        } else if (errorMsg === "منوی والد پیدا نشد") {
          errorMsg = "منوی والد انتخاب‌شده وجود ندارد.";
        } else if (errorMsg === "انتخاب این والد باعث ایجاد حلقه می‌شود") {
          errorMsg =
            "نمی‌توانید این منو را به‌عنوان والد انتخاب کنید، زیرا باعث ایجاد حلقه می‌شود.";
        }
        setErrorMessage(errorMsg);
      }
    } catch (err) {
      console.error("خطا در ارسال فرم", err);
      setErrorMessage("خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const IconComponent =
    form.icon && FaIcons[form.icon] ? FaIcons[form.icon] : null;

  return (
    <section className="admin-section">
      <h2 className="my-4">افزودن منو جدید</h2>
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>عنوان منو</Form.Label>
          <Form.Control
            type="text"
            placeholder="عنوان منو..."
            value={form.title}
            name="title"
            onChange={handleChange}
            isInvalid={!!errors.title}
            disabled={submitLoading}
          />
          {slugPreview && (
            <Form.Text className="text-muted">
              پیش‌نمایش URL: /{slugPreview}
            </Form.Text>
          )}
          <Form.Control.Feedback type="invalid">
            {errors.title}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>آدرس لینک</Form.Label>
          <div className="d-flex justify-content-center gap-1">
            <Form.Control
              type="text"
              placeholder="مثلاً /contact یا https://..."
              value={form.url}
              name="url"
              onChange={handleChange}
              isInvalid={!!errors.url}
              disabled={submitLoading}
              dir="ltr"
            />
            {form.urlManuallyEdited && (
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={handleResetUrl}
                disabled={submitLoading}
              >
                بازگرداندن به URL خودکار
              </Button>
            )}
          </div>
          <Form.Control.Feedback type="invalid">
            {errors.url}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>نوع لینک</Form.Label>
          <Form.Select
            name="type"
            value={form.type}
            onChange={handleChange}
            isInvalid={!!errors.type}
            disabled={submitLoading}
          >
            <option value="internal">داخلی</option>
            <option value="external">خارجی</option>
            <option value="page">صفحه داینامیک</option>
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            {errors.type}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>ترتیب نمایش</Form.Label>
          <Form.Control
            type="number"
            placeholder="مثلاً 1 یا 2..."
            value={form.order}
            name="order"
            onChange={handleChange}
            isInvalid={!!errors.order}
            disabled={submitLoading}
          />
          <Form.Control.Feedback type="invalid">
            {errors.order}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>آیکون</Form.Label>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Form.Control
              type="text"
              placeholder="مثلاً FaHome"
              value={form.icon}
              name="icon"
              onChange={handleChange}
              isInvalid={!!errors.icon}
              disabled={submitLoading}
            />
            {IconComponent && <IconComponent size={24} color="#007bff" />}
          </div>
          <Form.Control.Feedback type="invalid">
            {errors.icon}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>وضعیت منو</Form.Label>
          <Form.Check
            type="checkbox"
            label="فعال باشد"
            checked={form.isActive}
            name="isActive"
            onChange={handleChange}
            disabled={submitLoading}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>منوی والد</Form.Label>
          <Form.Select
            name="parent"
            value={form.parent}
            onChange={handleChange}
            disabled={fetchLoading || parentMenuOptions.length === 0}
          >
            <option value="">ندارد (منوی اصلی)</option>
            {fetchLoading ? (
              <GeneralLoading />
            ) : (
              parentMenuOptions.map((menu) => (
                <option key={menu._id} value={menu._id}>
                  {menu.title}
                </option>
              ))
            )}
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            {errors.parent}
          </Form.Control.Feedback>
        </Form.Group>

        <button
          className="btn-custom-submit"
          type="submit"
          disabled={submitLoading}
        >
          {submitLoading ? "در حال ذخیره..." : "ذخیره"}
        </button>
      </Form>
    </section>
  );
};

export default AddMenu;

"use client";
import { externalRegex, internalRegex, titleRegex } from "@/app/utils/regex";
import { slugify } from "@/app/utils/slugify";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert, Form, Spinner, Button } from "react-bootstrap";
import { joinUrl, reverseUrlSegmentsIfPersian } from "@/app/utils/urlReverse";
import * as FaIcons from "react-icons/fa";
import GeneralLoading from "@/app/components/ui/GeneralLoading";

const initialFormState = {
  title: "",
  url: "",
  slug: "",
  type: "internal",
  order: 0,
  parent: "",
  isActive: true,
  icon: "",
  urlManuallyEdited: false,
};

const UpdateMenu = () => {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState(initialFormState);
  const [menuTitle, setMenuTitle] = useState("");
  const [parentMenuOptions, setParentMenuOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [slugPreview, setSlugPreview] = useState("");
  const [previousParent, setPreviousParent] = useState(null);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuRes, parentRes] = await Promise.all([
          fetch(`/api/menus/${id}`),
          fetch("/api/menus"),
        ]);

        if (!menuRes.ok) setErrorMessage("خطا در دریافت منو");
        const menuData = await menuRes.json();
        const parentData = await parentRes.json();

        // تابع بازگشتی برای یافتن تمام فرزندان (مستقیم و غیرمستقیم)
        const getAllChildren = async (menuId, menus) => {
          const children = new Set();
          const stack = [menuId];
          while (stack.length > 0) {
            const currentId = stack.pop();
            const childMenus = menus.filter(
              (m) => String(m.parent?._id) === String(currentId)
            );
            for (const child of childMenus) {
              children.add(child._id);
              stack.push(child._id);
            }
          }
          return children;
        };

        // فیلتر کردن منوهای فرزند
        const childrenIds = await getAllChildren(id, parentData);
        const filteredParentOptions = parentData
          .filter((m) => m._id !== id && !childrenIds.has(m._id))
          .sort((a, b) => a.order - b.order);

        setForm({
          ...initialFormState,
          ...menuData,
          parent: menuData.parent?._id ?? "",
          urlManuallyEdited: menuData.url !== `/${menuData.slug}`,
          url: menuData.url, // استفاده مستقیم از url منو
        });
        setMenuTitle(menuData.title);
        setPreviousParent(menuData.parent?._id ?? null);
        setParentMenuOptions(filteredParentOptions);
        setSlugPreview(
          reverseUrlSegmentsIfPersian(menuData.url).replace(/^\//, "")
        );
      } catch (err) {
        console.error(err);
        setErrorMessage("مشکل در دریافت اطلاعات. لطفاً دوباره تلاش کنید.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (
      (form.type === "internal" || form.type === "page") &&
      form.url !== "/" &&
      form.title !== "" &&
      !form.urlManuallyEdited
    ) {
      const parentChanged = previousParent !== form.parent;
      const childSegment = slugify(form.title);
      let previewUrl = `/${childSegment}`;
      if (form.parent) {
        const parentMenu = parentMenuOptions.find((m) => m._id === form.parent);
        if (parentMenu) {
          const logicalParentUrl = reverseUrlSegmentsIfPersian(parentMenu.url);
          previewUrl = joinUrl(logicalParentUrl, childSegment);
        }
      }
      setForm((prev) => ({ ...prev, url: previewUrl }));
      setSlugPreview(
        reverseUrlSegmentsIfPersian(previewUrl).replace(/^\//, "")
      );
    } else {
      setSlugPreview(reverseUrlSegmentsIfPersian(form.url).replace(/^\//, ""));
    }
  }, [
    form.title,
    form.type,
    form.urlManuallyEdited,
    form.parent,
    previousParent,
    parentMenuOptions,
  ]);

  const validateForm = () => {
    const newErrors = {};
    const url = form.url.trim();

    if (!form.title.trim()) newErrors.title = "عنوان منو الزامی است.";
    else if (!titleRegex.test(form.title.trim()))
      newErrors.title = "عنوان باید فقط شامل حروف و بین ۳ تا ۳۰ کاراکتر باشد.";

    if (!url) newErrors.url = "آدرس لینک الزامی است.";
    else if (form.type === "external") {
      if (!externalRegex.test(url))
        newErrors.url = "لینک خارجی باید معتبر باشد";
    } else {
      if (!internalRegex.test(url))
        newErrors.url = "لینک داخلی باید با / شروع شود و فاصله نداشته باشد.";
    }
    const validTypes = ["internal", "external", "page"];
    if (!validTypes.includes(form.type))
      newErrors.type = "نوع لینک معتبر نیست.";

    if (
      form.order !== "" &&
      (isNaN(Number(form.order)) || Number(form.order) < 0)
    )
      newErrors.order = "ترتیب نمایش باید عددی بزرگ‌تر مساوی صفر باشد.";

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => {
      const newForm = {
        ...prev,
        [name]:
          name === "parent" && value === ""
            ? null
            : type === "checkbox"
            ? checked
            : value,
        ...(name === "url" ? { urlManuallyEdited: true } : {}),
      };
      if (name === "parent" || name === "title") {
        if (!newForm.urlManuallyEdited) {
          const parentChanged = previousParent !== newForm.parent;
          const childSegment = slugify(newForm.title);
          let previewUrl = `/${childSegment}`;
          if (newForm.parent) {
            const parentMenu = parentMenuOptions.find(
              (m) => m._id === newForm.parent
            );
            if (parentMenu) {
              const logicalParentUrl = reverseUrlSegmentsIfPersian(
                parentMenu.url
              );
              previewUrl = joinUrl(logicalParentUrl, childSegment);
            }
          }
          setSlugPreview(
            reverseUrlSegmentsIfPersian(previewUrl).replace(/^\//, "")
          );
          if (name === "parent") setPreviousParent(newForm.parent);
          return { ...newForm, url: previewUrl };
        } else {
          setSlugPreview(
            reverseUrlSegmentsIfPersian(newForm.url).replace(/^\//, "")
          );
          if (name === "parent") setPreviousParent(newForm.parent);
          return newForm;
        }
      }
      setSlugPreview(
        reverseUrlSegmentsIfPersian(newForm.url).replace(/^\//, "")
      );
      return newForm;
    });
    setErrors((prev) => ({ ...prev, [name]: "" }));
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
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitLoading(true);

    try {
      const res = await fetch(`/api/menus/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          type: form.type,
          order: Number(form.order),
          parent:
            form.url === "/" ? null : form.parent === "" ? null : form.parent,
          isActive: form.isActive,
          icon: form.icon,
          url: form.url,
          slug: slugify(form.title),
          urlManuallyEdited: form.urlManuallyEdited,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        let errorMsg = data.message || "خطای ویرایش منو";
        if (errorMsg === "شناسه نامعتبر است") {
          errorMsg = "شناسه منو معتبر نیست.";
        } else if (errorMsg === "شناسه والد نامعتبر است") {
          errorMsg = "منوی والد انتخاب‌شده معتبر نیست.";
        } else if (errorMsg === "منوی والد پیدا نشد") {
          errorMsg = "منوی والد انتخاب‌شده وجود ندارد.";
        } else if (errorMsg === "انتخاب این والد باعث ایجاد حلقه می‌شود") {
          errorMsg =
            "نمی‌توانید این منو را به‌عنوان والد انتخاب کنید، زیرا باعث ایجاد حلقه می‌شود.";
        }
        throw new Error(errorMsg);
      }

      setSuccessMessage("منو با موفقیت ویرایش شد.");
      setTimeout(() => router.push("/admin/menus"), 1500);
    } catch (err) {
      console.error(err);
      setErrorMessage(
        err.message || "خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید."
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <GeneralLoading />;

  const IconComponent =
    form.icon && FaIcons[form.icon] ? FaIcons[form.icon] : null;

  return (
    <section className="admin-section">
      <div className="d-flex justify-content-between align-items-center">
        <h2 className="my-4">ویرایش منو :{menuTitle}</h2>
        <div className="mb-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push("/admin/menus")}
          >
            بازگشت به لیست منوها
          </Button>
        </div>
      </div>
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>عنوان</Form.Label>
          <Form.Control
            type="text"
            name="title"
            value={form.title}
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
          <Form.Label>لینک</Form.Label>
          <div className="d-flex justify-content-center gap-1">
            <Form.Control
              type="text"
              name="url"
              value={form.url}
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
            <option value="page">داینامیک</option>
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            {errors.type}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>ترتیب</Form.Label>
          <Form.Control
            type="number"
            name="order"
            value={form.order}
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
              name="icon"
              value={form.icon}
              onChange={handleChange}
              disabled={submitLoading}
            />
            {IconComponent && <IconComponent size={24} color="#007bff" />}
          </div>
          <Form.Control.Feedback type="invalid">
            {errors.icon}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>وضعیت</Form.Label>
          <Form.Check
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
            label="فعال باشد"
            disabled={submitLoading}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>منوی والد</Form.Label>
          <Form.Select
            name="parent"
            value={form.parent || ""}
            onChange={handleChange}
            disabled={submitLoading}
          >
            <option value="">ندارد (منوی اصلی)</option>
            {parentMenuOptions.map((menu) => (
              <option key={menu._id} value={menu._id}>
                {menu.title}
              </option>
            ))}
          </Form.Select>
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

export default UpdateMenu;

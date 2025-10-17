"use client";
import OtpModal from "@/app/components/common/OtpModal";
import EditModal from "@/app/components/common/EditModal";
import { useEffect, useState } from "react";
import { Alert, Form, Spinner, Row, Col } from "react-bootstrap";
import { AiOutlineEdit } from "react-icons/ai";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import GeneralLoading from "@/app/components/ui/GeneralLoading";

const initialFormState = {
  email: "",
  username: "",
  firstname: "",
  lastname: "",
  phoneNumber: "",
};

const Profile = () => {
  const [form, setForm] = useState(initialFormState);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditModalSubmitting, setIsEditModalSubmitting] = useState(false);
  const [isOtpModalSubmitting, setIsOtpModalSubmitting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentField, setCurrentField] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpField, setOtpField] = useState("");
  const [otpIdentifier, setOtpIdentifier] = useState("");

  const router = useRouter();
  const { data: session, update } = useSession();

  // اعتبارسنجی سمت کلاینت
  const validateField = (field, value) => {
    const newErrors = { ...errors };
    if (field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      newErrors.email = "ایمیل معتبر نیست.";
    } else if (field === "phoneNumber" && !/^09\d{9}$/.test(value)) {
      newErrors.phoneNumber = "شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.";
    } else if ((field === "firstname" || field === "lastname") && !/^[آ-ی]{2,}$/.test(value)) {
      newErrors[field] = "فقط حروف فارسی با حداقل ۲ کاراکتر مجاز است.";
    } else {
      delete newErrors[field];
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // خوندن اطلاعات فعلی
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/userPanel/profile", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("خطا در دریافت اطلاعات");
        const userData = await res.json();
        setForm(userData);
      } catch (err) {
        console.error(err);
        setErrorMessage("مشکل در دریافت اطلاعات. لطفاً دوباره تلاش کنید.");
      } finally {
        setFetchLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  const handleEditClick = (field) => {
    setCurrentField(field);
    setCurrentValue(form[field] || "");
    setShowEditModal(true);
  };

  const handleSaveField = async (field, value) => {
    const trimmedValue = value.trim();
    if (!validateField(field, trimmedValue)) {
      return;
    }

    if (form[field] === trimmedValue) {
      setErrorMessage("مقداری جدید وارد نشده است.");
      return;
    }

    setIsEditModalSubmitting(true);
    try {
      if (field === "email" || field === "phoneNumber") {
        const res = await fetch("/api/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier: trimmedValue,
            field: field,
            type: "editProfile",
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || "خطا در ارسال کد تأیید");
        }
        setShowEditModal(false);
        setOtpField(field);
        setOtpIdentifier(trimmedValue);
        setShowOtpModal(true);
      } else if (field === "firstname" || field === "lastname") {
        const res = await fetch("/api/userPanel/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ field, value: trimmedValue, isOtpVerified: false }),
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || "خطا در ذخیره اطلاعات");
        }

        setForm((prev) => ({ ...prev, [field]: trimmedValue }));
        setShowEditModal(false);
        setSuccessMessage("اطلاعات با موفقیت ذخیره شد.");
        await update({
          user: {
            ...session?.user,
            [field]: trimmedValue,
          },
        });

        // به جای رفرش، اطلاعات جدید رو بگیر
        const profileRes = await fetch("/api/userPanel/profile", {
          method: "GET",
          credentials: "include",
        });
        if (profileRes.ok) {
          const userData = await profileRes.json();
          setForm(userData);
        }
      } else {
        setErrorMessage("امکان ویرایش این فیلد وجود ندارد.");
      }
    } catch (err) {
      setErrorMessage(err.message || "خطای ناشناخته در ذخیره اطلاعات");
    } finally {
      setIsEditModalSubmitting(false);
    }
  };

  const handleSaveVerifiedField = async () => {
    setIsOtpModalSubmitting(true);
    try {
      console.log("Sending to PUT:", { otpField, otpIdentifier });
      const res = await fetch("/api/userPanel/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field: otpField, value: otpIdentifier, isOtpVerified: true }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "خطا در ذخیره اطلاعات");
      }

      setForm((prev) => ({ ...prev, [otpField]: otpIdentifier }));
      setSuccessMessage(
        `${otpField === "email" ? "ایمیل" : "شماره موبایل"} با موفقیت تأیید و ذخیره شد.`
      );
      await update({
        user: {
          ...session?.user,
          [otpField]: otpIdentifier,
        },
      });

      // به جای رفرش، اطلاعات جدید رو بگیر
      const profileRes = await fetch("/api/userPanel/profile", {
        method: "GET",
        credentials: "include",
      });
      if (profileRes.ok) {
        const userData = await profileRes.json();
        setForm(userData);
      }
      setShowOtpModal(false);
    } catch (err) {
      setErrorMessage(err.message || "خطا در ذخیره فیلد تأیید شده");
    } finally {
      setIsOtpModalSubmitting(false);
    }
  };

  if (fetchLoading) {
    return (
      <>
        <h4 className="my-4">اطلاعات حساب کاربری : </h4>
        <GeneralLoading />
      </>
    );
  }

  return (
    <section className="user-section">
      <h4 className="my-4">اطلاعات حساب کاربری : </h4>
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      <Form>
        <Row>
          <Col sm={6}>
            <Form.Group className="mb-3">
              <Form.Label>نام :</Form.Label>
              <div className="d-flex align-items-center gap-2">
                <Form.Control
                  type="text"
                  name="firstname"
                  value={form.firstname}
                  isInvalid={!!errors.firstname}
                  disabled={true}
                />
                <button
                  className="btn-custom-edit"
                  type="button"
                  onClick={() => handleEditClick("firstname")}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Spinner size="sm" /> : <AiOutlineEdit />}
                </button>
              </div>
              {errors.firstname && (
                <Form.Control.Feedback type="invalid">
                  {errors.firstname}
                </Form.Control.Feedback>
              )}
            </Form.Group>
          </Col>
          <Col sm={6}>
            <Form.Group className="mb-3">
              <Form.Label>نام خانوادگی :</Form.Label>
              <div className="d-flex align-items-center gap-2">
                <Form.Control
                  type="text"
                  name="lastname"
                  value={form.lastname}
                  isInvalid={!!errors.lastname}
                  disabled={true}
                />
                <button
                  className="btn-custom-edit"
                  type="button"
                  onClick={() => handleEditClick("lastname")}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Spinner size="sm" /> : <AiOutlineEdit />}
                </button>
              </div>
              {errors.lastname && (
                <Form.Control.Feedback type="invalid">
                  {errors.lastname}
                </Form.Control.Feedback>
              )}
            </Form.Group>
          </Col>
          <Col sm={6}>
            <Form.Group className="mb-3">
              <Form.Label>ایمیل :</Form.Label>
              <div className="d-flex align-items-center gap-2">
                <Form.Control
                  type="text"
                  name="email"
                  value={form.email}
                  isInvalid={!!errors.email}
                  disabled={true}
                />
                <button
                  className="btn-custom-edit"
                  type="button"
                  onClick={() => handleEditClick("email")}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Spinner size="sm" /> : <AiOutlineEdit />}
                </button>
              </div>
              {errors.email && (
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              )}
            </Form.Group>
          </Col>
          <Col sm={6}>
            <Form.Group className="mb-3">
              <Form.Label>شماره موبایل :</Form.Label>
              <div className="d-flex align-items-center gap-2">
                <Form.Control
                  type="number"
                  name="phoneNumber"
                  value={form.phoneNumber}
                  isInvalid={!!errors.phoneNumber}
                  disabled={true}
                />
                <button
                  className="btn-custom-edit"
                  type="button"
                  onClick={() => handleEditClick("phoneNumber")}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Spinner size="sm" /> : <AiOutlineEdit />}
                </button>
              </div>
              {errors.phoneNumber && (
                <Form.Control.Feedback type="invalid">
                  {errors.phoneNumber}
                </Form.Control.Feedback>
              )}
            </Form.Group>
          </Col>
          <Col sm={6}>
            <Form.Group className="mb-3">
              <Form.Label>نام کاربری :</Form.Label>
              <div className="d-flex align-items-center gap-2">
                <Form.Control
                  type="text"
                  name="username"
                  value={form.username}
                  isInvalid={!!errors.username}
                  disabled={true}
                />
              </div>
            </Form.Group>
          </Col>
        </Row>
      </Form>

      <EditModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        field={currentField}
        value={currentValue}
        onSave={handleSaveField}
        isSubmitting={isEditModalSubmitting}
      />

      <OtpModal
        show={showOtpModal}
        onHide={() => setShowOtpModal(false)}
        identifier={otpIdentifier}
        field={otpField}
        onSuccess={handleSaveVerifiedField}
        isSubmitting={isOtpModalSubmitting}
      />
    </section>
  );
};

export default Profile;
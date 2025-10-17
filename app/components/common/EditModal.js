"use client";
import { useState, useEffect, useRef } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { emailRegex, nameRegex, phoneNumberRegex } from "@/app/utils/regex";

const EditModal = ({ show, onHide, field, value, onSave, isSubmitting }) => {
  const [inputValue, setInputValue] = useState(value || "");
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    setInputValue(value || "");
    setError("");
    if (show) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [show, value]);

  const getLabel = (field) => {
    switch (field) {
      case "email":
        return "ایمیل";
      case "phoneNumber":
        return "شماره موبایل";
      case "firstname":
        return "نام";
      case "lastname":
        return "نام خانوادگی";
      default:
        return field;
    }
  };

  const validate = () => {
    const trimmed = inputValue.trim();

    if (!trimmed) {
      setError("لطفاً مقدار را وارد کنید.");
      return false;
    }
    if (trimmed === value.trim()) {
      setError("مقدار جدید باید با مقدار فعلی متفاوت باشد.");
      return false;
    }

    if (field === "firstname" && !nameRegex.test(trimmed)) {
      setError("نام باید فقط شامل حروف فارسی باشد و حداقل ۲ حرف داشته باشد.");
      return false;
    }

    if (field === "lastname" && !nameRegex.test(trimmed)) {
      setError(
        "نام خانوادگی باید فقط شامل حروف فارسی باشد و حداقل ۲ حرف داشته باشد."
      );
      return false;
    }

    if (field === "email" && !emailRegex.test(trimmed)) {
      setError("ایمیل باید معتبر باشد. مثل example@mail.com");
      return false;
    }

    if (field === "phoneNumber" && !phoneNumberRegex.test(trimmed)) {
      setError("شماره موبایل باید با 09 شروع شود و 11 رقم باشد.");
      return false;
    }

    setError("");
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    await onSave(field, inputValue.trim());
    // onHide توی handleSaveField توی Profile.jsx فراخوانی می‌شه
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{`ویرایش ${getLabel(field)}`}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form.Group>
          <Form.Label>{`${getLabel(field)} جدید :`}</Form.Label>
          <Form.Control
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            ref={inputRef}
            autoComplete="off"
            disabled={isSubmitting}
            placeholder={`مقدار جدید ${getLabel(field)}`}
            autoFocus
          />
        </Form.Group>
        {error && <p className="mt-2 text-danger">{error}</p>}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
          انصراف
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={isSubmitting}>
          {isSubmitting ? <Spinner size="sm" animation="border" /> : "ذخیره"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditModal;
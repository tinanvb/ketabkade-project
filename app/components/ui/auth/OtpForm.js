"use client";
import React, { useEffect, useState } from "react";
import TextInput from "../../common/TextInput";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { otpRegex, phoneNumberRegex } from "@/app/utils/regex";
import { signIn } from "next-auth/react";
import { Col } from "react-bootstrap";

const OtpForm = () => {
  const [form, setForm] = useState({ phoneNumber: "", otpCode: "" });
  const [isPhoneDisabled, setIsPhoneDisabled] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("otp");
  const [type, setType] = useState("login");
  const [resendTimer, setResendTimer] = useState(0);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const phone = searchParams.get("phoneNumber");
    setType(searchParams.get("type"));
    if (phone) {
      setForm((prev) => ({ ...prev, phoneNumber: phone }));
      setStep("phone");
      setIsPhoneDisabled(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    const phoneNumber = form.phoneNumber.trim();

    if (!phoneNumber || !phoneNumberRegex.test(phoneNumber)) {
      setErrors({ phoneNumber: "شماره موبایل معتبر نیست." });
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: phoneNumber,
          field: "phoneNumber",
          type: type,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("کد تایید ارسال شد.");
        setStep("phone");
        setResendTimer(120);
      } else {
        toast.error(data.message || "خطا در ارسال کد");
      }
    } catch (err) {
      toast.error("خطای سرور");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    const newErrors = {};

    if (
      !form.phoneNumber.trim() ||
      !phoneNumberRegex.test(form.phoneNumber.trim())
    ) {
      newErrors.phoneNumber = "شماره موبایل وارد شده معتبر نیست.";
    }
    if (!form.otpCode.trim() || !otpRegex.test(form.otpCode.trim())) {
      newErrors.otpCode = "کد تأیید یک عدد ۶ رقمی باشد";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: form.phoneNumber,
          otpCode: form.otpCode,
          type: type,
          field: "phoneNumber",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("تأیید با موفقیت انجام شد.");
        await signIn("credentials", {
          identifier: form.phoneNumber,
          otpCode: form.otpCode,
          redirect: false,
        });
      } else {
        toast.error(data.message || "خطا در تایید کد");
        setErrors({ otpCode: data.message });
      }
    } catch (err) {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Col xs={9} sm={6} lg={6} xl={4}>
      <form onSubmit={handleSubmit} className="row">
        <TextInput
          label="شماره موبایل"
          name="phoneNumber"
          type="tel"
          value={form.phoneNumber}
          onChange={handleChange}
          error={errors.phoneNumber}
          required
          wrapperClassName="col-12"
          disabled={isPhoneDisabled || step === "phone"}
        />

        {step === "phone" && (
          <TextInput
            label="کد تایید"
            name="otpCode"
            type="text"
            value={form.otpCode}
            onChange={handleChange}
            error={errors.otpCode}
            required
            wrapperClassName="col-12"
          />
        )}

        {step === "phone" ? (
          <div className="d-flex flex-column">
            <button
              type="submit"
              className="btn-custom-add d-block w-50 mt-5 mx-auto"
              disabled={loading}
            >
              {loading ? "در حال ارسال..." : "تایید کد"}
            </button>
            <button
              type="button"
              className="btn-custom-add d-block w-50 mt-2 mx-auto"
              disabled={loading || resendTimer > 0}
              onClick={handleSendOtp}
            >
              {resendTimer > 0
                ? `ارسال مجدد (${resendTimer})`
                : "ارسال مجدد کد"}
            </button>
          </div>
        ) : (
          <button
            type="submit"
            className="btn-custom-add d-block w-50 mt-4 mx-auto"
            disabled={loading}
            onClick={handleSendOtp}
          >
            {loading ? "در حال ارسال کد تایید..." : "ارسال کد تایید"}
          </button>
        )}
      </form>
    </Col>
  );
};

export default OtpForm;

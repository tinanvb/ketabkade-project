"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container, Row, Alert } from "react-bootstrap";
import GeneralLoading from "@/app/components/ui/GeneralLoading";
import GeneralError from "@/app/components/ui/GeneralError";

function prepareSettingForSend(setting) {
  const data = { ...setting };

  delete data._id;
  delete data.createdAt;
  delete data.updatedAt;

  if (data.paymentMethods && typeof data.paymentMethods === "object") {
    delete data.paymentMethods._id;
  }

  for (const key in data.paymentMethods) {
    if (typeof data.paymentMethods[key] === "string") {
      data.paymentMethods[key] = data.paymentMethods[key] === "true";
    }
  }

  return data;
}

const EditSettings = () => {
  const router = useRouter();

  const [setting, setSetting] = useState({
    logo: "",
    siteTitle: "",
    contactInfo: { phone: "", email: "", address: "" },
    social: { instagram: "", telegram: "", whatsapp: "" },
    paymentMethods: { gateway: true, wallet: false, bank: false },
    about: "",
    rules: "",
    privacy: "",
    shoppingGuide: "",
    employ: "",
  });

  const [logoPreview, setLogoPreview] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => {
        if (!res.ok) throw new Error("خطا در بارگذاری تنظیمات");
        return res.json();
      })
      .then((data) => {
        setSetting({
          ...data,
          contactInfo: data.contactInfo || { phone: "", email: "", address: "" },
          social: {
            instagram: data.social?.instagram || "",
            telegram: data.social?.telegram || "",
            whatsapp: data.social?.whatsapp || "",
          },
        });
        if (data.logo) setLogoPreview(data.logo);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!setting.siteTitle.trim()) newErrors.siteTitle = "عنوان سایت الزامی است.";
    if (!setting.contactInfo.email.trim()) {
      newErrors.email = "ایمیل پشتیبانی الزامی است.";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(setting.contactInfo.email)) {
      newErrors.email = "فرمت ایمیل نامعتبر است.";
    }
    if (!setting.contactInfo.phone.trim()) newErrors.phone = "شماره تماس الزامی است.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setSetting((prev) => ({ ...prev, [field]: value }));
  };

  const handleContactChange = (field, value) => {
    setSetting((prev) => ({ ...prev, contactInfo: { ...prev.contactInfo, [field]: value } }));
  };

  const handleSocialChange = (platform, value) => {
    setSetting((prev) => ({ ...prev, social: { ...prev.social, [platform]: value } }));
  };

  const handlePaymentChange = (method) => {
    setSetting((prev) => ({ ...prev, paymentMethods: { ...prev.paymentMethods, [method]: !prev.paymentMethods[method] } }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
      setLogoFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const formData = new FormData();
    if (logoFile) formData.append("logo", logoFile);
    formData.append("data", JSON.stringify(prepareSettingForSend(setting)));

    try {
      const res = await fetch("/api/settings", { method: "PUT", body: formData });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "خطا در ذخیره تنظیمات");

      setMessage(result.message || "تنظیمات با موفقیت ذخیره شد");
      setError(null);
      router.push("/admin/settings");
    } catch (err) {
      setError(err.message);
      setMessage("");
    }
  };

  if (loading) return <GeneralLoading />;
  if (error) return <GeneralError error={error} />;

  return (
    <section className='admin-section'>
      <div className="admin-header">
        <h4>ویرایش تنظیمات سایت</h4>
      </div>
      {message && <Alert variant="success">{message}</Alert>}

      <form onSubmit={handleSubmit}>
        {/* لوگو */}
        <div className="mb-3">
          <label htmlFor="logo" className="form-label">لوگوی سایت</label>
          <input id="logo" type="file" accept="image/*" onChange={handleFileChange} className="form-control" />
          {logoPreview && <img src={logoPreview} alt="لوگو" className="mt-2 w-25 h-25 object-contain border rounded" />}
        </div>

        {/* عنوان سایت */}
        <div className="mb-3">
          <label htmlFor="siteTitle" className="form-label">عنوان سایت</label>
          <input id="siteTitle" type="text" value={setting.siteTitle} onChange={(e) => handleChange("siteTitle", e.target.value)} className="form-control" />
          {errors.siteTitle && <p className="text-danger mt-1">{errors.siteTitle}</p>}
        </div>

        {/* اطلاعات تماس */}
        <div className="mb-3">
          <label className="form-label">اطلاعات تماس</label>
          <input type="text" placeholder="ایمیل پشتیبانی" value={setting.contactInfo.email} onChange={(e) => handleContactChange("email", e.target.value)} className="form-control mb-2" />
          {errors.email && <p className="text-danger mt-1">{errors.email}</p>}
          <input type="text" placeholder="شماره تماس" value={setting.contactInfo.phone} onChange={(e) => handleContactChange("phone", e.target.value)} className="form-control mb-2" />
          {errors.phone && <p className="text-danger mt-1">{errors.phone}</p>}
          <input type="text" placeholder="آدرس" value={setting.contactInfo.address} onChange={(e) => handleContactChange("address", e.target.value)} className="form-control" />
        </div>

        {/* شبکه‌های اجتماعی */}
        <div className="mb-3">
          <label className="form-label">شبکه‌های اجتماعی</label>
          {Object.keys(setting.social).map((platform) => (
            <input key={platform} type="text" placeholder={`لینک ${platform}`} value={setting.social[platform]} onChange={(e) => handleSocialChange(platform, e.target.value)} className="form-control mb-2" />
          ))}
        </div>

        {/* پرداخت */}
        <div className="mb-3">
          <label className="form-label">روش‌های پرداخت</label>
          {Object.entries(setting.paymentMethods).map(([key, value]) => (
            <div key={key} className="form-check">
              <input type="checkbox" className="form-check-input" checked={value} onChange={() => handlePaymentChange(key)} id={key} />
              <label className="form-check-label" htmlFor={key}>
                {key === "gateway" ? "درگاه پرداخت" : key === "wallet" ? "کیف پول" : "پرداخت بانکی مستقیم"}
              </label>
            </div>
          ))}
        </div>

        {/* متون سایت */}
        {["about", "rules", "privacy", "shoppingGuide", "employ"].map((field) => (
          <div key={field} className="mb-3">
            <label htmlFor={field} className="form-label">{field === "about" ? "درباره ما" : field === "rules" ? "قوانین سایت" : field === "privacy" ? "حریم خصوصی" : field === "shoppingGuide" ? "راهنمای خرید" : "فرصت شغلی"}</label>
            <textarea id={field} value={setting[field]} onChange={(e) => handleChange(field, e.target.value)} className="form-control" rows={3}></textarea>
          </div>
        ))}

        <button type="submit" className="btn-custom-add">ذخیره تنظیمات</button>
      </form>
    </section>
  );
};

export default EditSettings;

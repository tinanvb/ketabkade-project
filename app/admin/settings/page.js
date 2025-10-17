"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import GeneralLoading from "@/app/components/ui/GeneralLoading";
import GeneralError from "@/app/components/ui/GeneralError";

const Settings = () => {
  const router = useRouter();

  const [setting, setSetting] = useState({
    logo: "",
    siteTitle: "",
    contactInfo: {
      phone: "",
      email: "",
      address: "",
    },
    social: {
      instagram: "",
      telegram: "",
      whatsapp: "",
    },
    paymentMethods: { gateway: true, wallet: false, bank: false },
    about: "",
    rules: "",
    privacy: "",
    shoppingGuide: "",
    employ: "",
  });

  const [logoPreview, setLogoPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => {
        if (!res.ok) throw new Error("خطا در بارگذاری تنظیمات");
        return res.json();
      })
      .then((data) => {
        const mergedSocial = {
          instagram: data.social?.instagram || "",
          telegram: data.social?.telegram || "",
          whatsapp: data.social?.whatsapp || "",
        };

        setSetting({
          ...data,
          social: mergedSocial,
          contactInfo: data.contactInfo || {
            phone: "",
            email: "",
            address: "",
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

  return (
    <section className='admin-section'>

      <div className="admin-header">
        <h4>تنظیمات سایت</h4>
      </div>

      {error && <GeneralError error={error} />}
      {loading ? (
        <GeneralLoading />
      ) : (
        <>

          <div className="flex flex-col gap-4 bg-white p-4 rounded shadow-sm text-sm">
          {logoPreview && (
            <div className="mt-4">
              <h6>لوگو:</h6>
              <div className="mt-2">
                <img
                  src={logoPreview}
                  alt="لوگو سایت"
                  className="mt-2 w-12 h-12 object-contain border rounded"
                />
              </div>
            </div>
          )}

            <div className="mt-2">
              <strong>عنوان سایت: {setting.siteTitle || "تعریف نشده"}</strong>
            </div>

            <div className="mt-3">
              <strong>ایمیل پشتیبانی: {setting.contactInfo.email || "تعریف نشده"}</strong>
            </div>

            <div className="mt-3">
              <strong>شماره تماس: {setting.contactInfo.phone || "تعریف نشده"}</strong>
            </div>

            <div className="mt-3">
              <strong>آدرس: {setting.contactInfo.address || "تعریف نشده"}</strong>
            </div>

            <div className="mt-3">
              <strong>شبکه‌های اجتماعی:</strong>
              <ul className="ms-4 mt-2 list-disc list-unstyled">
                {Object.entries(setting.social).map(([platform, url]) => (
                  <li key={platform} className="mt-2">
                    {platform}: {url || "ثبت نشده"}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4">
              <strong className="me-2">روش‌های پرداخت :</strong>{" "}
              {Object.entries(setting.paymentMethods)
                .filter(([_, isEnabled]) => isEnabled)
                .map(([key]) =>
                  key === "gateway"
                    ? "درگاه پرداخت"
                    : key === "wallet"
                    ? "کیف پول"
                    : "پرداخت بانکی مستقیم"
                )
                .join("، ") || "هیچکدام فعال نیست"}
            </div>

            <div>
              <p className="mt-4 text-gray-700 whitespace-pre-line">
                <strong className="me-3">درباره ما:</strong>
                {setting.about || "ثبت نشده"}
              </p>
            </div>

            <div>
              <p className="mt-4 text-gray-700 whitespace-pre-line">
                <strong className="me-3">قوانین سایت:</strong>
                {setting.rules || "ثبت نشده"}
              </p>
            </div>

            <div>
              <p className="mt-4 text-gray-700 whitespace-pre-line">
                <strong className="me-3">حریم خصوصی:</strong>
                {setting.privacy || "ثبت نشده"}
              </p>
            </div>

            <div>
              <p className="mt-4 text-gray-700 whitespace-pre-line">
                <strong className="me-3">راهنمای خرید:</strong>
                {setting.shoppingGuide || "ثبت نشده"}
              </p>
            </div>

            <div>
              <p className="mt-4 text-gray-700 whitespace-pre-line">
                <strong className="me-3">فرصت شغلی:</strong>
                {setting.employ || "ثبت نشده"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push(`/admin/settings/${setting._id}`)}
              className="btn-custom-add rounded p-2 mt-3"
            >
              بروزرسانی تنظیمات
            </button>
          </div>
        </>
      )}
    </section>
  );
};

export default Settings;

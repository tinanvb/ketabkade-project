"use client";

import React, { useEffect, useState } from "react";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { usePageLoader } from "@/app/context/PageLoaderProvider";


const ContactUs = () => {
  const { startLoading, stopLoading } = usePageLoader();

  const [contactInfo, setContactInfo] = useState({
    phone: "",
    email: "",
    address: "",
  });

  useEffect(() => {
    startLoading();
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setContactInfo(data.contactInfo || {}))
      .catch((err) => {
        console.error("Error fetching settings:", err);
      })
      .finally(() => {
        stopLoading();
      });
  }, []);

  return (
    <div className="contact-us container py-4 py-md-5 my-0 mt-sm-5 content-wrapper">
      <h1 className="text-center mb-md-4 my-4 mt-sm-3 mt-md-0">تماس با ما</h1>

      <div className="row px-3 text-center">
        <div className="col-md-4 mb-4 mb-md-0">
          <div className="card-style">
            <FaPhoneAlt className="icon mb-2" />
            <h5 className="mb-3">شماره تماس</h5>
            <p className="mb-1">{contactInfo.phone || "در حال بارگذاری..."}</p>
            <small className="text-muted">
              پاسخگویی:شنبه تا چهارشنبه از ساعت ۹ تا ۱۸
            </small>
          </div>
        </div>

        <div className="col-md-4 mb-4 mb-md-0">
          <div className="card-style">
            <FaEnvelope className="icon mb-2" />
            <h5 className="mb-3">ایمیل</h5>
            <p className="mb-1">{contactInfo.email || "در حال بارگذاری..."}</p>
            <small className="text-muted">پاسخ در کمتر از ۲۴ ساعت</small>
          </div>
        </div>

        <div className="col-md-4 mb-4 mb-md-0">
          <div className="card-style">
            <FaMapMarkerAlt className="icon mb-2" />
            <h5 className="mb-3">آدرس</h5>
            <p className="mb-1">
              {contactInfo.address || "در حال بارگذاری..."}
            </p>
            <small className="text-muted">دفتر مرکزی</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;

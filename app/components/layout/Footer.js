"use client";

import { usePageLoader } from "@/app/context/PageLoaderProvider";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FaInstagram, FaTelegram, FaWhatsapp } from "react-icons/fa";

const Footer = () => {
  const { startLoading, stopLoading } = usePageLoader();

  const [social, setSocial] = useState({
    instagram: "",
    telegram: "",
    whatsapp: "",
  });

  useEffect(() => {
    startLoading();

    fetch("/api/settings")
      .then((res) => {
        if (!res.ok) throw new Error("خطا در دریافت تنظیمات");
        return res.json();
      })
      .then((data) => {
        if (data?.social) {
          setSocial(data.social);
        }
      })
      .catch((err) => {
        console.error("خطا در دریافت اطلاعات شبکه‌های اجتماعی:", err);
      }).finally(() => {
      stopLoading();
    });
  }, []);

  return (
    <footer className="footer">
      <section className="footer-container">
        <section className="footer-top">
          <div className="footer-description">
            <p className="footer-paragraph ">
              فروشگاه اینترنتی کتاب <strong>کتابکده</strong> جایی برای خرید
              آنلاین و دانلود کتاب‌های صوتی و الکترونیکی است. در کتاب‌فروشی
              آنلاین کتابکده هزاران کتاب گویا و الکترونیکی در دسترس است که در
              میان آن‌ها کتاب‌های رایگان نیز وجود دارد. می‌توانید آن‌ها را
              خریداری یا به‌صورت امانی دریافت و در موبایل، تبلت، رایانه یا
              وب‌سایت مطالعه یا گوش دهید.
            </p>
          </div>
          <div className="footer-links">
            <section className="footer-column">
              <h6 className="header-style mb-3">کتابکده</h6>
              <ul className="list-unstyled">
                <li>
                  <Link className="link-style" href={"/about"}>
                    درباره کتابکده
                  </Link>
                </li>
                <li>
                  <Link className="link-style" href={"/employ"}>
                    فرصت شغلی
                  </Link>
                </li>
                <li>
                  <Link className="link-style" href={"/contact-us"}>
                    تماس با ما
                  </Link>
                </li>
                <li>
                  <Link className="link-style" href={"/questions"}>
                    سوالات متداول{" "}
                  </Link>
                </li>
              </ul>
            </section>

            <section className="footer-column">
              <h6 className="header-style mb-3">راهنما و پشتیبانی</h6>
              <ul className="list-unstyled">
                <li>
                  <Link className="link-style" href={"/shoppingGuide"}>
                    راهنمای خرید
                  </Link>
                </li>
                <li>
                  <Link className="link-style" href={"/rules"}>
                    شرایط استفاده
                  </Link>
                </li>
                <li>
                  <Link className="link-style" href={"/privacy"}>
                    حریم خصوصی
                  </Link>
                </li>
              </ul>
            </section>

            <section className="footer-social">
              <h6 className="header-style ">شبکه های اجتماعی</h6>
              <div className="footer-social-icons">
                {social.telegram && (
                  <a
                    href={social.telegram}
                    target="_blank"
                    className="footer-icon"
                  >
                    <FaTelegram />
                  </a>
                )}
                {social.instagram && (
                  <a
                    href={social.instagram}
                    target="_blank"
                    className="footer-icon"
                  >
                    <FaInstagram />
                  </a>
                )}
                {social.whatsapp && (
                  <a
                    href={social.whatsapp}
                    target="_blank"
                    className="footer-icon"
                  >
                    <FaWhatsapp />
                  </a>
                )}
              </div>
            </section>
          </div>
        </section>

        {/* کپی‌رایت */}
        <div className="footer-bottom mt-5">
          <p>
            © کلیه حقوق این سایت محفوظ و متعلق به فروشگاه اینترنتی کتاب کتابکده
            است.
          </p>
          <p>@Ketabkadeh.com v3.215.0</p>
        </div>
      </section>
    </footer>
  );
};

export default Footer;

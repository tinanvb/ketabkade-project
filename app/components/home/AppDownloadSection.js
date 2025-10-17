import React from "react";

const AppDownloadSection = () => {
  return (
    <section className="content-wrapper mx-3 bg-white p-4 rounded-2 d-flex flex-column flex-md-row align-items-center justify-content-between">
      {/* متن سمت راست */}
      <div className="d-flex justify-content-center align-items-center mb-3 mb-md-0">
        <img
          src="/LOGO.jpeg" 
          alt="کتابکده"
          className="me-3"
          style={{ height: "70px", objectFit: "contain", marginBottom: "10px" }}
        />
        <div className="text-center mb-3 mb-md-0">
          <h6 className="fw-bold fs-5">دانلود اپلیکیشن کتابکده</h6>
          <p className="text-center small">
            با نصب اپلیکیشن، راحت‌تر کتاب بخوانید و بشنوید.
          </p>
        </div>
      </div>

      {/* دکمه‌ها یا لینک‌های تصویری سمت چپ */}
      <div className="d-flex gap-3 flex-wrap justify-content-center">
        <a
          href="https://play.google.com" 
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="/googlePlay.webp"
            alt="دانلود از Google Play"
            style={{ height: "40px", objectFit: "contain" }}
          />
        </a>

        <a
          href="https://apps.apple.com"     
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="/appstore.webp"
            alt="دانلود از App Store"
            style={{ height: "40px", objectFit: "contain" }}
          />
        </a>

        <a
          href="/downloads/windows"    
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="/windows.webp"
            alt="دانلود نسخه ویندوز"
            style={{ height: "40px", objectFit: "contain" }}
          />
        </a>
      </div>
    </section>
  );
};

export default AppDownloadSection;

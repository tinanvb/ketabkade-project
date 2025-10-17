import React from "react";
import { FaShippingFast, FaShieldAlt, FaHeadset } from "react-icons/fa";

const advantages = [
  {
    icon: <FaShippingFast className="icon fs-2 " />,
    title: "ارسال فوری" ,
    description: "ارسال در کمتر از ۲۴ ساعت به سراسر کشور با بسته‌بندی مخصوص",
  },
  {
    icon: <FaShieldAlt className="icon fs-2 " />,
    title: "گارانتی اصالت",
    description: "تضمین ۱۰۰٪ اصالت محصولات با گارانتی معتبر و خدمات پس از فروش",
  },
  {
    icon: <FaHeadset className="icon fs-2 " />,
    title: "پشتیبانی ۲۴/۷",
    description:
      "تیم متخصص پشتیبانی ما در تمام ساعات شبانه‌روز آماده کمک به شماست",
  },
];

const ProductAdvantages = () => {
  return (
    <section className="content-wrapper bg-white p-3 m-3 rounded-2 text-center">
    <div className="container">
        <h1 className="content-header-title">
          <span> چرا ما را انتخاب کنید؟ </span>
        </h1>
        <p className="text-muted mb-5">
          خدمات فوق‌العاده ما تجربه خرید شما را به یادماندنی می‌کند
        </p>

        <div className="row">
          {advantages.map((item, index) => (
            <div key={index} className="col-12 col-md-4 mb-4">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body d-flex flex-column align-items-center text-center">
                  {item.icon}
                  <h5 className="mt-3 fw-semibold">{item.title}</h5>
                  <p className="text-muted small">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductAdvantages;

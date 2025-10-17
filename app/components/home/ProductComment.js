"use client";
import React, { useEffect, useState } from "react";
import moment from "moment-jalaali";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { usePageLoader } from "@/app/context/PageLoaderProvider";

// فلش قبلی
const PrevArrow = ({ onClick }) => (
  <button
    className="custom-arrow prev"
    onClick={onClick}
    style={{
      position: "absolute",
      top: "50%",
      left: "-16px",
      transform: "translateY(-50%)",
      background: "#64258e",
      color: "white",
      border: "none",
      borderRadius: "10%",
      width: "25px",
      height: "25px",
      cursor: "pointer",
      zIndex: 2,
    }}
  >
    ‹
  </button>
);

// فلش بعدی
const NextArrow = ({ onClick }) => (
  <button
    className="custom-arrow next"
    onClick={onClick}
    style={{
      position: "absolute",
      top: "50%",
      right: "-16px",
      transform: "translateY(-50%)",
      background: "#64258e",
      color: "white",
      border: "none",
      borderRadius: "10%",
      width: "25px",
      height: "25px",
      cursor: "pointer",
      zIndex: 2,
    }}
  >
    ›
  </button>
);

const ProductComments = ({ productId }) => {
  const { startLoading, stopLoading } = usePageLoader();

  const [comments, setComments] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    rating: 5,
    commentText: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!productId) return;
    startLoading();

    const fetchComments = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
        const res = await fetch(`${baseUrl}/api/comments?product=${productId}`);
        if (!res.ok) throw new Error("خطا در دریافت نظرات");

        const data = await res.json();
        if (!Array.isArray(data))
          throw new Error("داده نامعتبر از سرور دریافت شد");

        setComments(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        stopLoading();
      }
    };

    fetchComments();
  }, [productId]);

  if (error) return <p>{error}</p>;

  const filteredComments = comments.filter((comment) => {
    const id =
      typeof comment.productName === "object"
        ? comment.productName?._id
        : comment.productName;
    return id?.toString() === productId?.toString();
  });

  const settings = {
    dots: false,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    infinite: filteredComments.length > 3,
    speed: 500,
    slidesToShow: Math.min(4, filteredComments.length),
    slidesToScroll: 1,
    rtl: true,
    responsive: [
      {
        breakpoint: 992,
        settings: { slidesToShow: Math.min(2, filteredComments.length) },
      },
      { breakpoint: 768, settings: { slidesToShow: 1 } },
    ],
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
      const userId = localStorage.getItem("userId");

      if (!userId) {
        alert("لطفاً ابتدا وارد حساب کاربری شوید.");
        setSubmitting(false);
        return;
      }

      const res = await fetch(`${baseUrl}/api/products/home/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: productId,
          userId: userId,
          rating: form.rating,
          commentText: form.commentText,
        }),
      });

      if (!res.ok) throw new Error("خطا در ثبت نظر");

      const newComment = await res.json();

      // آپدیت state با فرمت درست
      setComments((prev) => [
        {
          ...newComment,
          productName: { _id: productId }, // برای اینکه فیلتر صفحه کار کند
        },
        ...prev,
      ]);

      setShowModal(false);
      setForm({ firstname: "", lastname: "", rating: 5, commentText: "" });
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mb-4">
      <section className="container-xxl">
        <section className="row">
          <section className="col">
            <section className="content-header d-flex justify-content-between align-items-center mt-5">
              <h4 className="content-header-title">نظرات کاربران</h4>
            </section>

            <section
              className={`content-wrapper bg-light p-3 rounded-2 position-relative ${
                filteredComments.length < 4 ? "few-comments" : ""
              }`}
            >
              {filteredComments.length === 0 ? (
                <p>هیچ نظری ثبت نشده است.</p>
              ) : (
                <Slider {...settings}>
                  {filteredComments.map((comment) => (
                    <section
                      key={comment._id}
                      className="comment-card bg-light-subtle border rounded-2"
                    >
                      <section className="rounded p-2 m-2 text-center h-100">
                        <strong className="d-block mb-1">
                          {comment.user
                            ? `${comment.user.firstname} ${comment.user.lastname}`
                            : "کاربر ناشناس"}
                        </strong>
                        <span className="text-productDetail d-block mb-2">
                          {"★".repeat(comment.rating)}
                        </span>
                        <p className="mb-2">{comment.commentText}</p>
                        <small className="text-muted">
                          {moment(comment.createdAt).format(
                            "jYYYY/jMM/jDD HH:mm"
                          )}
                        </small>
                      </section>
                    </section>
                  ))}
                </Slider>
              )}
            </section>
          </section>
        </section>
      </section>
      <section>
        <button className=" BtnModalComment" onClick={() => setShowModal(true)}>
          ثبت نظر
        </button>
      </section>

      {/* مدال ثبت نظر */}
      {showModal && (
        <div
          className="modal show d-block showModal"
          tabIndex="-1"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">ثبت نظر</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="نام"
                    value={form.firstname}
                    onChange={(e) =>
                      setForm({ ...form, firstname: e.target.value })
                    }
                    required
                  />
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="نام خانوادگی"
                    value={form.lastname}
                    onChange={(e) =>
                      setForm({ ...form, lastname: e.target.value })
                    }
                  />
                  <select
                    className="form-control mb-2"
                    value={form.rating}
                    onChange={(e) =>
                      setForm({ ...form, rating: Number(e.target.value) })
                    }
                    required
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>
                        {`${r} ★`}
                      </option>
                    ))}
                  </select>
                  <textarea
                    className="form-control"
                    placeholder="متن نظر..."
                    value={form.commentText}
                    onChange={(e) =>
                      setForm({ ...form, commentText: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary p-1 px-3"
                    onClick={() => setShowModal(false)}
                  >
                    بستن
                  </button>
                  <button
                    type="submit"
                    className="btn-custom-submit "
                    disabled={submitting}
                  >
                    {submitting ? "در حال ارسال..." : "ارسال نظر"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductComments;

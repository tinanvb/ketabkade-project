"use client";
import { useCart } from "../context/CartContext";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import { IoInformationCircleOutline } from "react-icons/io5";
import { useSession } from "next-auth/react";
import { Modal, Button, Alert } from "react-bootstrap";
import "./../styles/cart.css";
import { useRouter } from "next/navigation";

export default function Cart() {
  const {
    cart,
    setCart,
    removeFromCart,
    error: cartError,
    setError: setCartError,
    loading,
    clearCart,
    updateCart,
  } = useCart();
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [discountError, setDiscountError] = useState("");
  const [isDiscountApplied, setIsDiscountApplied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showClearCartModal, setShowClearCartModal] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [paymentMethod, setPaymentMethod] = useState("gateway"); // wallet | gateway
  const { data: session, update } = useSession();
  const router = useRouter();
  const [showWalletConfirmModal, setShowWalletConfirmModal] = useState(false); // مودال تایید پرداخت کیف پول

  useEffect(() => {
    if (cart && cart.discountPrice > 0) {
      setAppliedDiscount(cart.discountPrice);
      setIsDiscountApplied(true);
    } else {
      setAppliedDiscount(0);
      setIsDiscountApplied(false);
      setDiscountCode("");
    }
  }, [cart]);

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "" }), 5000);
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      showAlert("سبد خرید با موفقیت خالی شد", "success");
      setShowClearCartModal(false);
    } catch (error) {
      showAlert("خطا در خالی کردن سبد خرید", "danger");
      setShowClearCartModal(false);
    }
  };

  const applyDiscount = async () => {
    if (isDiscountApplied) {
      setDiscountError("شما قبلاً کد تخفیف را اعمال کرده‌اید");
      showAlert("شما قبلاً کد تخفیف را اعمال کرده‌اید", "danger");
      return;
    }

    setDiscountError("");
    if (!discountCode.trim()) {
      setDiscountError("کد تخفیف را وارد کنید");
      showAlert("کد تخفیف را وارد کنید", "danger");
      return;
    }

    try {
      const res = await fetch("/api/discountCodes/home", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          credentials: "include",
        },
        body: JSON.stringify({ code: discountCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "کد تخفیف نامعتبر است");
      }

      const cartUpdateRes = await fetch("/api/cart", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          credentials: "include",
        },
        body: JSON.stringify({ discountPrice: data.discountPrice }),
      });

      if (!cartUpdateRes.ok) {
        throw new Error("خطا در به‌روزرسانی سبد خرید");
      }

      const updatedCart = await cartUpdateRes.json();
      if (
        !updatedCart.items ||
        !updatedCart.items.every((item) => item.product)
      ) {
        throw new Error("داده‌های سبد خرید ناقص است");
      }

      setCart(updatedCart);
      setAppliedDiscount(data.discountPrice);
      setIsDiscountApplied(true);
      showAlert("کد تخفیف با موفقیت اعمال شد", "success");
    } catch (error) {
      setDiscountError(error.message || "مشکلی در اعمال کد تخفیف پیش آمده است");
      showAlert(
        error.message || "مشکلی در اعمال کد تخفیف پیش آمده است",
        "danger"
      );
      await updateCart();
    }
  };

  const handleOrderSubmit = async () => {
    if (!session || !session.user) {
      showAlert("لطفاً وارد حساب شوید", "danger");
      router.push("/auth/login");
      return;
    }

    if (!cart?.items?.length) {
      showAlert("سبد خرید خالی است", "danger");
      return;
    }

    const payableAmount =
      cart.items.reduce(
        (total, item) => total + (item.product?.price || 0),
        0
      ) -
      cart.items.reduce(
        (total, item) => total + (item.product?.discountedPrice || 0),
        0
      ) -
      (cart.discountPrice || 0);

    if (paymentMethod === "wallet") {
      if (session.user.balance < payableAmount) {
        showAlert("موجودی کیف پول کافی نیست", "danger");
        return;
      }
      setShowWalletConfirmModal(true); // نمایش مودال تایید
      return;
    }

    // برای gateway مستقیم ارسال
    await submitPayment();
  };

  const submitPayment = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        items: cart.items.map((item) => ({
          product: item.product._id,
        })),
        totalPrice: cart.items.reduce(
          (total, item) => total + (item.product?.price || 0),
          0
        ),
        totalDiscountedPrice: cart.items.reduce(
          (total, item) => total + (item.product?.discountedPrice || 0),
          0
        ),
        appliedDiscount: cart.discountPrice || 0,
        paymentMethod,
      };

      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "مشکلی در ثبت سفارش پیش آمد");

      if (paymentMethod === "wallet") {
        const newBalance = data.newBalance;
        await update({
          user: {
            ...session.user,
            balance: newBalance,
          },
        });
        router.push(
          `/cart/success?ref=${data.trackingCode}&amount=${data.amount}`
        );
      } else if (paymentMethod === "gateway") {
        window.location.href = data.paymentUrl;
      }
    } catch (error) {
      showAlert(error.message || "خطا در ثبت سفارش", "danger");
      setShowWalletConfirmModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="main-body empty-cart">
        <section className="container-xxl text-center py-5">
          <h4 className="m-4">در حال بارگذاری سبد خرید...</h4>
        </section>
      </main>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <main className="main-body empty-cart">
        <section className="container-xxl text-center py-5">
          <h4 className="m-4">سبد خرید شما خالی هست</h4>
          <Link
            href="/"
            className="bg-cart text-white text-decoration-none text-center mt-5 p-2 rounded-1"
          >
            بازگشت به فروشگاه
          </Link>
        </section>
      </main>
    );
  }

  const totalPrice = cart.items.reduce(
    (total, item) => total + (item.product?.price || 0),
    0
  );
  const totalDiscountedPrice = cart.items.reduce(
    (total, item) => total + (item.product?.discountedPrice || 0),
    0
  );
  const payableAmount = totalPrice - totalDiscountedPrice - appliedDiscount;

  return (
    <>
      <section className="container mt-5">
        <section className="content-header col-md-8 col-lg-9 d-flex justify-content-between align-items-baseline">
          <h2 className="content-header-title">سبد خرید شما</h2>
          <section className="content-header-link">
            <button
              className="delete-cart"
              onClick={() => setShowClearCartModal(true)}
              disabled={cart.items.length === 0}
            >
              خالی کردن سبد خرید
              <FaTrash />
            </button>
          </section>
        </section>
        <section className="row mt-4">
          <section className="col-md-8 col-lg-9 mb-3">
            {(cartError || alert.show) && (
              <Alert
                variant={alert.type || "danger"}
                dismissible
                onClose={() => setAlert({ show: false, message: "", type: "" })}
              >
                {alert.show ? alert.message : cartError}
              </Alert>
            )}
            <section className="content-wrapper bg-white rounded-2">
              {cart.items.map((item) => {
                const name = item.product?.name || "محصول نامشخص";
                const price = item.product?.price || 0;
                const hasDiscount =
                  item.product?.discountedPrice &&
                  item.product.discountedPrice < item.product.price;
                const discountAmount = hasDiscount
                  ? item.product.price - item.product.discountedPrice
                  : 0;
                const finalPrice = hasDiscount ? discountAmount : price;

                return (
                  <section
                    className="cart-item d-flex flex-column flex-md-row justify-content-center justify-content-md-between align-items-center py-3 border-bottom"
                    key={item.product?._id || item._id}
                  >
                    <div className="d-flex flex-column flex-md-row justify-content-center justify-content-md-between align-items-center py-3">
                      <section className="cart-img">
                        {item.product?.imageUrl ? (
                          <Image
                            src={item.product.imageUrl}
                            width={80}
                            height={150}
                            alt={name}
                            priority
                          />
                        ) : (
                          <span>تصویر موجود نیست</span>
                        )}
                      </section>
                      <section>
                        <p className="fw-bold">{name}</p>
                        <section className="mt-4">
                          <section className="d-flex justify-content-center justify-content-md-start">
                            {hasDiscount ? (
                              <div className="d-flex flex-column align-items-md-start">
                                <div className="d-flex flex-column flex-lg-row align-items-center">
                                  <del className="text-muted">
                                    {price.toLocaleString()} تومان
                                  </del>
                                  <span className="badge my-2 my-md-1 my-lg-0 bg-danger ms-lg-2">
                                    -{" "}
                                    {item.product.discountedPrice.toLocaleString()}{" "}
                                    تومان
                                  </span>
                                </div>
                                <section className="text-success fw-bold mt-1 mt-md-2">
                                  {finalPrice.toLocaleString()} تومان
                                </section>
                              </div>
                            ) : (
                              <span className="text-success fw-bold">
                                {price.toLocaleString()} تومان
                              </span>
                            )}
                          </section>
                        </section>
                      </section>
                    </div>
                    <section className="d-flex align-self-md-end mb-md-4">
                      <button
                        className="delete-cart"
                        onClick={() =>
                          removeFromCart(item.product?._id).catch(() => {
                            showAlert("خطا در حذف محصول", "danger");
                          })
                        }
                      >
                        <FaTrash />
                        حذف
                      </button>
                    </section>
                  </section>
                );
              })}
            </section>
          </section>
          <section className="col-md-4 col-lg-3">
            <section className="content-wrapper bg-white p-3 rounded-2 cart-total-price">
              <section className="d-flex justify-content-between align-items-center">
                <p className="text-muted">قیمت کالاها ({cart.items.length})</p>
                <p className="text-muted">
                  {totalPrice.toLocaleString()} تومان
                </p>
              </section>
              <section className="d-flex justify-content-between align-items-center">
                <p className="text-muted">تخفیف کالاها</p>
                <p className="text-danger fw-bolder">
                  {totalDiscountedPrice.toLocaleString()} تومان
                </p>
              </section>
              <section className="d-flex justify-content-between align-items-center">
                <p className="text-muted">مبلغ کد تخفیف</p>
                <p className="text-danger">
                  {appliedDiscount.toLocaleString()} تومان
                </p>
              </section>
              <section className="border-bottom mb-3"></section>
              <section className="d-flex justify-content-between align-items-center">
                <p className="text-muted">جمع سبد خرید</p>
                <p className="fw-bolder">
                  {payableAmount.toLocaleString()} تومان
                </p>
              </section>
              <section className="mt-3">
                <section className="d-flex align-items-center p-2 bg-alert-checkout rounded-2 mb-3 text-white">
                  <IoInformationCircleOutline
                    style={{ fontSize: "20px", marginLeft: "8px" }}
                  />
                  <section>کد تخفیف خود را در این بخش وارد کنید.</section>
                </section>
                <section className="input-group input-group-sm mb-3">
                  <input
                    type="text"
                    className="form-control"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="کد تخفیف را وارد کنید"
                    disabled={isDiscountApplied}
                  />
                  <button
                    className="bg-cart text-white text-decoration-none text-center border-0"
                    onClick={applyDiscount}
                    type="button"
                    disabled={isDiscountApplied}
                  >
                    اعمال کد
                  </button>
                </section>
                {discountError && (
                  <p className="text-danger mb-3">{discountError}</p>
                )}
              </section>
              <section>
                <section className="mt-3">
                  <label className="d-block fw-bold mb-2">روش پرداخت</label>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="paymentMethod"
                      id="payWallet"
                      value="wallet"
                      checked={paymentMethod === "wallet"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="payWallet">
                      پرداخت با کیف پول (موجودی:
                      {session?.user?.balance?.toLocaleString() || 0} تومان)
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="paymentMethod"
                      id="payGateway"
                      value="gateway"
                      checked={paymentMethod === "gateway"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="payGateway">
                      پرداخت از طریق درگاه بانکی
                    </label>
                  </div>
                </section>
                <button
                  className="mt-3 bg-cart text-white text-decoration-none text-center border-0 px-3 py-1 rounded-2 d-block w-100"
                  onClick={handleOrderSubmit}
                  disabled={isSubmitting || payableAmount <= 0}
                >
                  {isSubmitting ? "در حال پردازش..." : "ثبت سفارش"}
                </button>
              </section>
            </section>
          </section>
        </section>
      </section>

      <Modal
        show={showClearCartModal}
        onHide={() => setShowClearCartModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>تأیید خالی کردن سبد خرید</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          آیا مطمئن هستید که می‌خواهید سبد خرید خود را خالی کنید؟
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowClearCartModal(false)}
          >
            لغو
          </Button>
          <Button
            variant="primary"
            className="bg-cart text-white"
            onClick={handleClearCart}
          >
            تأیید
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showWalletConfirmModal}
        onHide={() => setShowWalletConfirmModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>تأیید پرداخت از کیف پول</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            مبلغ {payableAmount.toLocaleString()} تومان از کیف پول شما کسر خواهد
            شد.
          </p>
          <p>
            موجودی فعلی: {session?.user?.balance?.toLocaleString() || 0} تومان
          </p>
          <p>
            موجودی پس از پرداخت:{" "}
            {(session?.user?.balance - payableAmount)?.toLocaleString() || 0}{" "}
            تومان
          </p>
          <p>آیا مطمئن هستید؟</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            className="bg-cart text-white"
            onClick={submitPayment}
            disabled={isSubmitting}
          >
            {isSubmitting ? "در حال پردازش..." : "تأیید و پرداخت"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowWalletConfirmModal(false)}
          >
            لغو
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

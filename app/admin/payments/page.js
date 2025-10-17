"use client";
import GeneralError from "@/app/components/ui/GeneralError";
import GeneralLoading from "@/app/components/ui/GeneralLoading";
import { useEffect, useState } from "react";
import { Button, Modal, Table, Form, Row, Col, Card } from "react-bootstrap";

const Payments = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [hasFetchOnce, setHasFetchOnce] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [filters, setFilters] = useState({ status: "", method: "" });

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const query = new URLSearchParams({
          ...(filters.status && { status: filters.status }),
          ...(filters.method && { method: filters.method }),
        }).toString();
        const res = await fetch(`/api/payments?${query}`);
        if (!res.ok) throw new Error(`خطای HTTP: ${res.status}`);
        const data = await res.json();

        // بررسی ساختار پاسخ
        if (!data.success || !data.data || !Array.isArray(data.data.payments)) {
          console.error("ساختار پاسخ API نامعتبر است:", data);
          throw new Error("داده‌های دریافتی از سرور نامعتبر است");
        }

        setPayments(data.data.payments);
        setError("");
      } catch (err) {
        console.error("خطا در دریافت پرداخت‌ها:", err);
        setError(err.message || "خطایی در دریافت اطلاعات رخ داد");
      } finally {
        setLoading(false);
        setHasFetchOnce(true);
      }
    };
    fetchPayments();
  }, [filters]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleShowModal = (payment) => {
    setSelectedPayment(payment);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedPayment(null);
    setShowModal(false);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleRetry = () => {
    setError("");
    setLoading(true);
    setHasFetchOnce(false);
  };

  return (
    <section className='admin-section'>

      <div className="admin-header">
        <h4>مدیریت پرداخت‌ها</h4>
      </div>

      <Form className="mb-4">
        <Form.Group className="mb-3">
          <Form.Label>فیلتر بر اساس وضعیت</Form.Label>
          <Form.Select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">همه</option>
            <option value="pending">در انتظار</option>
            <option value="processing">در حال پردازش</option>
            <option value="completed">موفق</option>
            <option value="failed">ناموفق</option>
            <option value="cancelled">لغو شده</option>
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>فیلتر بر اساس روش پرداخت</Form.Label>
          <Form.Select name="method" value={filters.method} onChange={handleFilterChange}>
            <option value="">همه</option>
            <option value="wallet">کیف پول</option>
            <option value="zarinpal">زرین‌پال</option>
          </Form.Select>
        </Form.Group>
      </Form>

      {success && <div className="alert alert-success">{success}</div>}
      {error && (
        <GeneralError error={error}>
          <Button variant="primary" onClick={handleRetry}>
            تلاش مجدد
          </Button>
        </GeneralError>
      )}
      {loading && !hasFetchOnce ? (
        <GeneralLoading />
      ) : (
        <>
          <p className="text-muted">تعداد کل پرداخت‌ها: {payments.length}</p>
          <Table
            striped
            bordered
            hover
            responsive
            className="align-middle custom-table"
          >
            <thead className="custom-header">
              <tr className="text-center">
                <th>شناسه</th>
                <th>کد پیگیری</th>
                <th>کاربر</th>
                <th>محصولات</th>
                <th>مبلغ</th>
                <th>تاریخ</th>
                <th>وضعیت</th>
                <th>روش پرداخت</th>
                <th>-</th>
              </tr>
            </thead>
            <tbody>
              {hasFetchOnce && payments.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center text-muted py-4">
                    هیچ تاریخچه پرداختی وجود ندارد.
                  </td>
                </tr>
              ) : (
                payments.map((payment, index) => (
                  <tr key={payment._id} className="text-center">
                    <td>{index + 1}</td>
                    <td>{payment.trackingCode}</td>
                    <td>{payment.user?.username || "-"}</td>
                    <td>
                      {payment.type === "walletPayment"
                        ? "شارژ کیف پول"
                        : payment.products?.map((p) => p.name).join(", ") || "-"}
                    </td>
                    <td>{payment.amount?.toLocaleString()} تومان</td>
                    <td>
                      {payment.status === "completed" && payment.paidAt
                        ? new Date(payment.paidAt).toLocaleString("fa-IR")
                        : "-"}
                    </td>
                    <td>
                      <span
                        className={`px-2 py-1 rounded text-white text-sm ${
                          payment.status === "completed"
                            ? "bg-success"
                            : payment.status === "failed"
                            ? "bg-danger"
                            : "bg-warning text-dark"
                        }`}
                      >
                        {payment.status === "completed"
                          ? "موفق"
                          : payment.status === "failed"
                          ? "ناموفق"
                          : payment.status === "pending"
                          ? "در انتظار"
                          : payment.status === "processing"
                          ? "در حال پردازش"
                          : "لغو شده"}
                      </span>
                    </td>
                    <td>{payment.method === "wallet" ? "کیف پول" : "زرین‌پال"}</td>
                    <td>
                      <button
                        onClick={() => handleShowModal(payment)}
                        className="btn btn-link p-0"
                      >
                        جزئیات
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </>
      )}

      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>جزئیات پرداخت</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPayment ? (
            <>
              <h5 className="border-bottom pb-2 text-primary">اطلاعات پرداخت</h5>
              <Table striped bordered hover responsive>
                <tbody>
                  <tr>
                    <th>کد پیگیری</th>
                    <td>{selectedPayment.trackingCode || "-"}</td>
                  </tr>
                  <tr>
                    <th>مبلغ پرداخت شده</th>
                    <td>{selectedPayment.amount?.toLocaleString()} تومان</td>
                  </tr>
                  <tr>
                    <th>نوع پرداخت</th>
                    <td>{selectedPayment.type === "walletPayment" ? "شارژ کیف پول" : "خرید محصول"}</td>
                  </tr>
                  <tr>
                    <th>وضعیت پرداخت</th>
                    <td
                      className={
                        selectedPayment.status === "completed"
                          ? "text-success fw-bold"
                          : selectedPayment.status === "failed"
                          ? "text-danger fw-bold"
                          : "text-warning fw-bold"
                      }
                    >
                      {selectedPayment.status === "completed"
                        ? "موفق"
                        : selectedPayment.status === "failed"
                        ? "ناموفق"
                        : selectedPayment.status === "pending"
                        ? "در انتظار"
                        : selectedPayment.status === "processing"
                        ? "در حال پردازش"
                        : "لغو شده"}
                    </td>
                  </tr>
                  <tr>
                    <th>تاریخ ثبت</th>
                    <td>{new Date(selectedPayment.createdAt).toLocaleString("fa-IR")}</td>
                  </tr>
                  <tr>
                    <th>زمان پرداخت</th>
                    <td>
                      {selectedPayment.paidAt
                        ? new Date(selectedPayment.paidAt).toLocaleString("fa-IR")
                        : "-"}
                    </td>
                  </tr>
                  <tr>
                    <th>شماره کارت (ماسک‌شده)</th>
                    <td>{selectedPayment.cardNumberMasked || "-"}</td>
                  </tr>
                  <tr>
                    <th>IP</th>
                    <td>{selectedPayment.ipAddress || "-"}</td>
                  </tr>
                  {selectedPayment.gatewayResponse && (
                    <tr>
                      <th>پاسخ درگاه</th>
                      <td>
                        <pre className="text-start bg-light p-2 rounded">
                          {(() => {
                            try {
                              const parsed = JSON.parse(selectedPayment.gatewayResponse);
                              return JSON.stringify(
                                { status: parsed.status, ref_id: parsed.ref_id, card_pan: parsed.card_pan },
                                null,
                                2
                              );
                            } catch {
                              return selectedPayment.gatewayResponse;
                            }
                          })()}
                        </pre>
                      </td>
                    </tr>
                  )}
                  {selectedPayment.errorMessage && (
                    <tr>
                      <th className="text-danger">خطای درگاه</th>
                      <td className="text-danger">{selectedPayment.errorMessage}</td>
                    </tr>
                  )}
                </tbody>
              </Table>

              {selectedPayment.products?.length > 0 && (
                <>
                  <h5 className="border-bottom pb-2 mt-4 text-primary">اطلاعات محصولات</h5>
                  <Row>
                    {selectedPayment.products.map((product) => (
                      <Col key={product._id} xs={12} sm={6} md={4} className="mb-3">
                        <Card className="h-100" style={{ maxWidth: "200px", margin: "auto" }}>
                          <Card.Img
                            variant="top"
                            src={product.imageUrl}
                            alt={product.name}
                            style={{ height: "120px", objectFit: "cover" }}
                            className="rounded-top"
                          />
                          <Card.Body className="text-center p-2">
                            <Card.Title style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                              {product.name}
                            </Card.Title>
                            <div className="mb-2">
                              {product.discountedPrice > 0 ? (
                                <div>
                                  <span
                                    className="text-muted text-decoration-line-through d-block"
                                    style={{ fontSize: "0.8rem" }}
                                  >
                                    {product.price?.toLocaleString()} تومان
                                  </span>
                                  <span
                                    className="text-success fw-bold"
                                    style={{ fontSize: "0.9rem" }}
                                  >
                                    {(product.price - product.discountedPrice)?.toLocaleString()} تومان
                                  </span>
                                </div>
                              ) : (
                                <span
                                  className="fw-bold"
                                  style={{ fontSize: "0.9rem" }}
                                >
                                  {product.price?.toLocaleString()} تومان
                                </span>
                              )}
                            </div>
                            <a
                              href={`/products/${product._id}`}
                              target="_blank"
                              className="btn btn-sm btn-outline-primary"
                              style={{ fontSize: "0.8rem", padding: "0.25rem 0.5rem" }}
                            >
                              مشاهده
                            </a>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </>
              )}

              <h5 className="border-bottom pb-2 mt-4 text-primary">اطلاعات کاربر</h5>
              <Table striped bordered hover responsive>
                <tbody>
                  <tr>
                    <th>نام کامل</th>
                    <td>{selectedPayment.user?.firstname || "-"} {selectedPayment.user?.lastname || ""}</td>
                  </tr>
                  <tr>
                    <th>نام کاربری</th>
                    <td>{selectedPayment.user?.username || "-"}</td>
                  </tr>
                  <tr>
                    <th>ایمیل</th>
                    <td>{selectedPayment.user?.email || "-"}</td>
                  </tr>
                  <tr>
                    <th>موبایل</th>
                    <td>{selectedPayment.user?.phoneNumber || "-"}</td>
                  </tr>
                  <tr>
                    <th>نقش</th>
                    <td>{selectedPayment.user?.role === "admin" ? "ادمین" : "کاربر عادی"}</td>
                  </tr>
                </tbody>
              </Table>
            </>
          ) : (
            <p>اطلاعاتی برای نمایش وجود ندارد.</p>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>بستن</Button>
        </Modal.Footer>
      </Modal>
    </section>
  );
};

export default Payments;
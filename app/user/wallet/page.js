"use client";
import React, { useEffect, useState } from "react";
import { Table, Button, Form, Modal, Card, Alert } from "react-bootstrap";
import { AiOutlinePlus } from "react-icons/ai";
import axios from "axios";
import GeneralLoading from "@/app/components/ui/GeneralLoading";
import { useSession } from "next-auth/react";

const Wallet = () => {
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState(""); // مقدار فرمت‌شده برای نمایش
  const [rawAmount, setRawAmount] = useState(""); // مقدار خام برای ارسال
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session, update } = useSession();

  const fetchWallet = async () => {
    try {
      setFetchLoading(true);
      const res = await axios.get(`/api/wallet`);
      setWallet({
        balance: Number(res.data.balance),
        transactions: res.data.transactions.map((t) => ({
          ...t,
          amount: Number(t.amount),
        })),
      });
      // آپدیت session با مقدار جدید balance
      if (session) {
        await update({
          user: {
            ...session.user,
            balance: Number(res.data.balance),
          },
        });
      }
      setFetchLoading(false);
    } catch (err) {
      setError("خطا در بارگذاری اطلاعات کیف پول");
      setFetchLoading(false);
    }
  };

  const transactions = wallet.transactions || [];
  const walletBalance = wallet.balance || 0;

  useEffect(() => {
    fetchWallet();
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get("ref") || searchParams.get("amount")) {
      fetchWallet();
    }
  }, []);

  const handleAmountChange = (e) => {
    const inputValue = e.target.value.replace(/,/g, "");
    if (
      /^\d*$/.test(inputValue) &&
      (!inputValue ||
        (Number(inputValue) >= 0 && Number(inputValue) <= 100000000))
    ) {
      setRawAmount(inputValue);
      setAmount(inputValue ? Number(inputValue).toLocaleString("fa-IR") : "");
    }
  };

  const handleCharge = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.post("/api/wallet/charge", {
        amount: Number(rawAmount), // ارسال به صورت تومانی
      });
      window.location.href = res.data.url;
    } catch (err) {
      setError("خطا در اتصال به درگاه پرداخت. لطفاً دوباره امتحان کنید.");
      setIsLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <>
        <div className="d-flex justify-content-between align-items-center my-4">
          <h4>کیف پول من :</h4>
        </div>
        <GeneralLoading />
      </>
    );
  }

  const getStatusClass = (status) => {
    switch (status) {
      case "completed":
        return { text: "تکمیل شده", className: "status completed" };
      case "cancelled":
        return { text: "لغو شده", className: "status cancelled" };
      case "pending":
        return { text: "در انتظار", className: "status pending" };
      case "processing":
        return { text: "در حال پردازش", className: "status processing" };
      case "failed":
        return { text: "ناموفق", className: "status failed" };
      default:
        return { text: status, className: "status pending" };
    }
  };

  return (
    <section className="user-section">
      <div className="d-flex justify-content-between align-items-center my-4">
        <h4>کیف پول من :</h4>
      </div>

      <Card className="mb-4 shadow-card border-0">
        <Card.Body className="d-flex flex-column flex-sm-row align-items-center justify-content-between">
          <div>
            <h6>موجودی کیف پول :</h6>
            <h4 className="text-success">
              {walletBalance.toLocaleString("fa-IR")} تومان
            </h4>
          </div>
          <button
            className="btn-custom-add mt-3 mt-sm-0 d-flex align-items-center gap-2"
            onClick={() => setShowModal(true)}
          >
            <AiOutlinePlus size={20} />
            افزایش موجودی
          </button>
        </Card.Body>
      </Card>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      <h5 className="mb-3">تاریخچه تراکنش‌ها</h5>
      <Table striped bordered hover responsive className="align-middle">
        <thead className="text-center">
          <tr>
            <th>شناسه</th>
            <th>تاریخ</th>
            <th>مبلغ</th>
            <th>نوع تراکنش</th>
            <th>وضعیت</th>
            <th>کد پیگیری</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center text-muted py-4">
                هیچ تاریخچه‌ای وجود ندارد.
              </td>
            </tr>
          ) : (
            transactions.map((transaction, index) => {
              const typeMap = {
                charge: "شارژ کیف پول",
                walletPayment: "پرداخت از کیف پول",
                productPayment: "پرداخت مستقیم",
              };

              const typeText = typeMap[transaction.type] || transaction.type;

              return (
                <tr key={transaction._id} className="text-center">
                  <td>{index + 1}</td>
                  <td>
                    {new Date(transaction.createdAt).toLocaleString("fa-IR", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </td>
                  <td
                    className={
                      transaction.amount > 0 ? "text-success" : "text-danger"
                    }
                  >
                    {transaction.amount.toLocaleString("fa-IR")} تومان
                  </td>
                  <td>{typeText}</td>
                  <td>
                    <span
                      className={getStatusClass(transaction.status).className}
                    >
                      {getStatusClass(transaction.status).text}{" "}
                    </span>
                  </td>
                  <td>{transaction.trackingCode}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>افزایش موجودی</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>مبلغ (تومان)</Form.Label>
              <Form.Control
                type="number"
                value={rawAmount}
                onChange={handleAmountChange}
                placeholder="مثلاً 500000"
                disabled={isLoading}
                min="0"
                max="100000000"
                step="1"
              />
              <Form.Text className="text-muted">
                {rawAmount
                  ? `معادل: ${amount} تومان`
                  : "لطفاً مبلغ را به تومان وارد کنید"}
              </Form.Text>
            </Form.Group>
            {error && (
              <Alert variant="danger" className="mt-3">
                {error}
              </Alert>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="success"
            onClick={handleCharge}
            disabled={isLoading || !rawAmount}
          >
            {isLoading ? "در حال اتصال..." : "پرداخت"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
            disabled={isLoading}
          >
            بستن
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  );
};

export default Wallet;

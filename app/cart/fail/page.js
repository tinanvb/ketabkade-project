"use client";
import PaymentResult from "@/app/components/common/PaymentResult";

export default function CartFailPage() {
  return (
    <PaymentResult
      status="fail"
      transactionType="order"
      redirectTo="/cart"
    />
  );
}
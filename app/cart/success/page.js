"use client";
import { useSearchParams } from "next/navigation";
import PaymentResult from "@/app/components/common/PaymentResult";

export default function CartSuccessPage() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");
  const amount = searchParams.get("amount");

  return (
    <PaymentResult
      status="success"
      amount={amount}
      ref={ref}
      transactionType="order"
      redirectTo="/user/orders-list"
    />
  );
}
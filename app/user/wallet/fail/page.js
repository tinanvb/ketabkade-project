// pages/user/wallet/fail.js
"use client";
import PaymentResult from "@/app/components/common/PaymentResult";

export default function WalletFailPage() {
  return (
    <PaymentResult
      status="fail"
      transactionType="wallet"
      redirectTo="/user/wallet"
    />
  );
}

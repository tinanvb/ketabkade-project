import axios from "axios";

const MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID;
const ZARINPAL_BASE = "https://sandbox.zarinpal.com/pg/v4";

export async function createPayment(amount, description, callback_url) {
  const amountInRial = amount * 10; // تبدیل تومان به ریال

  const res = await axios.post(`${ZARINPAL_BASE}/payment/request.json`, {
    merchant_id: MERCHANT_ID,
    amount:amountInRial,
    description,
    callback_url,
  });

  if (res.data.data.code === 100) {
    return {
      url: `https://sandbox.zarinpal.com/pg/StartPay/${res.data.data.authority}`,
      authority: res.data.data.authority,
    };
  } else {
    throw new Error("خطا در ایجاد پرداخت");
  }
}

export async function verifyPayment(authority, amount) {
  const amountInRial = amount * 10; // تبدیل تومان به ریال

  const res = await axios.post(`${ZARINPAL_BASE}/payment/verify.json`, {
    merchant_id: MERCHANT_ID,
    amount:amountInRial,
    authority,
  });

  if (res.data.data.code === 100) {
    return { status: "success", ref_id: res.data.data.ref_id };
  } else {
    return { status: "failed", code: res.data.data.code };
  }
}

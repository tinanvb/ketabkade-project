import Order from "@/models/Order";
import Payment from "@/models/Payment";
import Transaction from "@/models/Transaction";


async function generateTrackingCode() {
  const generateCode = () => {
    // تولید عدد تصادفی 6 رقمی (100000 تا 999999)
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  let trackingCode;
  let isUnique = false;

  while (!isUnique) {
    trackingCode = generateCode();
    // چک یکتایی در تمام مدل‌ها (برای جلوگیری از تکرار)
    const existingOrder = await Order.findOne({ trackingCode });
    const existingPayment = await Payment.findOne({ trackingCode });
    const existingTransaction = await Transaction.findOne({ trackingCode });
    if (!existingOrder && !existingPayment && !existingTransaction) {
      isUnique = true;
    }
  }

  return trackingCode;
}

export default generateTrackingCode;
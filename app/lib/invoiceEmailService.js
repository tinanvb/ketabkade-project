import nodemailer from "nodemailer";

export default async function invoiceEmailService(email, payment) {
  // تنظیمات transporter مشابه ماژول قبلی
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // محاسبه مجموع قیمت محصولات
  const totalAmount = payment.amount?.toLocaleString("fa-IR") || "نامشخص";
  
  // قالب HTML برای ایمیل فاکتور
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; direction: rtl; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #2c3e50; text-align: center;">فاکتور پرداخت</h2>
      <p style="color: #34495e; text-align: center;">با تشکر از خرید شما! جزئیات فاکتور شما به شرح زیر است:</p>
      
      <h4 style="color: #2980b9; margin-top: 20px;">اطلاعات پرداخت</h4>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <th style="padding: 8px; border: 1px solid #ddd; background-color: #f8f9fa;">کد پیگیری</th>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${payment.trackingCode || "-"}</td>
        </tr>
        <tr>
          <th style="padding: 8px; border: 1px solid #ddd; background-color: #f8f9fa;">مبلغ کل</th>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${totalAmount} تومان</td>
        </tr>
        <tr>
          <th style="padding: 8px; border: 1px solid #ddd; background-color: #f8f9fa;">وضعیت پرداخت</th>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center; color: ${payment.status === "completed" ? "#28a745" : payment.status === "failed" ? "#dc3545" : "#ffc107"};">
            ${payment.status === "completed" ? "موفق" : payment.status === "failed" ? "ناموفق" : payment.status === "pending" ? "در انتظار" : payment.status === "processing" ? "در حال پردازش" : "لغو شده"}
          </td>
        </tr>
        <tr>
          <th style="padding: 8px; border: 1px solid #ddd; background-color: #f8f9fa;">روش پرداخت</th>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${payment.method === "wallet" ? "کیف پول" : "زرین‌پال"}</td>
        </tr>
        <tr>
          <th style="padding: 8px; border: 1px solid #ddd; background-color: #f8f9fa;">تاریخ پرداخت</th>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
            ${payment.paidAt ? new Date(payment.paidAt).toLocaleString("fa-IR") : "-"}
          </td>
        </tr>
      </table>

      ${payment.products?.length > 0 ? `
        <h4 style="color: #2980b9; margin-top: 20px;">محصولات خریداری‌شده</h4>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr>
              <th style="padding: 8px; border: 1px solid #ddd; background-color: #f8f9fa;">نام محصول</th>
              <th style="padding: 8px; border: 1px solid #ddd; background-color: #f8f9fa;">قیمت</th>
            </tr>
          </thead>
          <tbody>
            ${payment.products.map(product => `
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${product.name}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
                  ${product.discountedPrice > 0 ? `
                    <span style="text-decoration: line-through; color: #6c757d;">${product.price?.toLocaleString("fa-IR")} تومان</span><br>
                    <span style="color: #28a745; font-weight: bold;">${(product.price - product.discountedPrice)?.toLocaleString("fa-IR")} تومان</span>
                  ` : `
                    <span style="font-weight: bold;">${product.price?.toLocaleString("fa-IR")} تومان</span>
                  `}
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      ` : ""}
      
      <h4 style="color: #2980b9; margin-top: 20px;">اطلاعات کاربر</h4>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <th style="padding: 8px; border: 1px solid #ddd; background-color: #f8f9fa;">نام کامل</th>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${payment.user?.firstname || "-"} ${payment.user?.lastname || ""}</td>
        </tr>
        <tr>
          <th style="padding: 8px; border: 1px solid #ddd; background-color: #f8f9fa;">ایمیل</th>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${payment.user?.email || "-"}</td>
        </tr>
      </table>

      <p style="color: #34495e; text-align: center; margin-top: 20px;">برای هرگونه سوال، با پشتیبانی ما تماس بگیرید.</p>
      <p style="color: #34495e; text-align: center;">با تشکر، تیم ما</p>
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "فاکتور پرداخت سفارش",
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("خطا در ارسال ایمیل فاکتور:", error);
    throw new Error("خطا در ارسال ایمیل فاکتور");
  }
}
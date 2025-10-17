import nodemailer from "nodemailer";

export default async function emailServices(email, smsMessage) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "ویرایش اطلاعات",
    html: `<p><strong>${smsMessage}</strong></p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error("خطا در ارسال ایمیل");
  }
}

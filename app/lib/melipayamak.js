const MELIPAYAMAK_API_URL = "https://rest.payamak-panel.com/api/SendSMS";
const MELIPAYAMAK_USERNAME = process.env.MELIPAYAMAK_USERNAME;
const MELIPAYAMAK_PASSWORD = process.env.MELIPAYAMAK_PASSWORD;

export async function sendSms(phone, message) {
  if (!MELIPAYAMAK_USERNAME || !MELIPAYAMAK_PASSWORD) {
    throw new Error("اطلاعات ورودی برای ارسال پیامک تنظیم نشده است");
  }

  const payload = {
    username: MELIPAYAMAK_USERNAME,
    password: MELIPAYAMAK_PASSWORD,
    to: phone,
    from: process.env.MELIPAYAMAK_FROM_NUMBER,
    text: message,
  };

  try {
    const response = await fetch(`${MELIPAYAMAK_API_URL}/SendSMS`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (data && data.RetStatus !== 1) {
      throw new Error(data.StrRetStatus || "خطایی در ارسال پیامک رخ داده است");
    }

    return data;
  } catch (e) {
    console.log(e);
    throw new Error("خطایی در ارسال پیامک رخ داده است");
  }
}

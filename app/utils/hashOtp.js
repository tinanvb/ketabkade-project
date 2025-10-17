import crypto from "crypto";

export function hashOtp(code) {
  const hmac = crypto.createHmac("sha256", process.env.OTP_SECRET);
  hmac.update(code);
  return hmac.digest("hex");
}

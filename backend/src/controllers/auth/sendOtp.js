import supabase from "../../config/supabase.js";
import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import fetch from "node-fetch";
import crypto from "crypto";

// Load environment variables
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.SENDER_EMAIL;
const BREVO_TEMPLATE_ID = process.env.BREVO_TEMPLATE_ID;

// Endpoint
const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

export const sendOtp = catchAsync(async (req, res, next) => {
  const { toEmail } = req.body;

  if (!toEmail) {
    return next(new AppError("Email is required", 400));
  }

  // 1. Generate secure random OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  const otpCreatedAt = new Date();

  // 2. Save OTP + timestamp in DB
  const { error } = await supabase
    .from("users")
    .update({ otp, otp_created_at: otpCreatedAt })
    .eq("email", toEmail);

  if (error) return next(new AppError("Database error", 500));

  // 3. Send Email via Brevo
  const payload = {
    sender: { name: "Algorizms", email: SENDER_EMAIL },
    to: [{ email: toEmail }],
    templateId: Number(BREVO_TEMPLATE_ID),
    params: { appName: "Ukaab", code: otp, expiresIn: "5 minutes" },
  };

  const response = await fetch(BREVO_ENDPOINT, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": BREVO_API_KEY,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Brevo error:", response.status, errorText);
    return next(new AppError("Email provider error", 502));
  }

  res.status(200).json({ status: "success", message: "OTP sent successfully" });
});
import supabase from "../../config/supabase.js";
import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";

export const verifyOtp = catchAsync(async (req, res, next) => {
  const { toEmail, otp } = req.body;

  if (!toEmail || !otp) {
    return next(new AppError("Email and OTP are required", 400));
  }

  // 1. Fetch user record
  const { data: user, error } = await supabase
    .from("users")
    .select("otp, otp_created_at")
    .eq("email", toEmail)
    .single();

  if (error || !user) return next(new AppError("User not found", 404));

  // 2. Check OTP validity
  if (user.otp !== otp) return next(new AppError("Invalid OTP", 400));

  // 3. Check expiry (5 mins)
  const now = new Date();
  const createdAt = new Date(user.otp_created_at);
  const diffMinutes = (now - createdAt) / 1000 / 60;

  if (diffMinutes > 5) return next(new AppError("OTP expired", 400));

  // 4. Success → clear OTP
  await supabase
    .from("users")
    .update({ otp: null, otp_created_at: null })
    .eq("email", toEmail);

  res.status(200).json({
    status: "success",
    message: "OTP verified successfully",
  });
});

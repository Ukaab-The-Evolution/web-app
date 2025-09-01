import supabase from "../../config/supabase.js";
import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import jwt from 'jsonwebtoken';
import {signToken} from "./authController.js";

// // Add the signToken function (same as in your authController)
// const signToken = (user_id, auth_user_id) => {
//   return jwt.sign(
//     { id: user_id, auth_user_id },
//     process.env.JWT_SECRET,
//     { expiresIn: process.env.JWT_EXPIRES_IN }
//   );
// };

export const verifyOtp = catchAsync(async (req, res, next) => {
  const { toEmail, otp } = req.body;

  if (!toEmail || !otp) {
    return next(new AppError("Email and OTP are required", 400));
  }

  // 1. Fetch user record with all necessary fields
  const { data: user, error } = await supabase
    .from("users")
    .select("user_id, auth_user_id, email, otp, otp_created_at, is_verified")
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

  // 4. Update user verification status (same as original function)
  const { error: updateError } = await supabase
    .from('users')
    .update({ 
      is_verified: true, // Note: field name is is_verified, not is_Verified
      otp: null, 
      otp_created_at: null 
    })
    .eq('user_id', user.user_id);

  if (updateError) {
    return next(new AppError('Failed to update user verification status', 500));
  }

  // 5. If user has email and auth_user_id, confirm their auth account
  if (user.email && user.auth_user_id) {
    try {
      // Use the same supabaseAdmin import from your authController
      const { supabaseAdmin } = await import('../../config/supabase.js');
      await supabaseAdmin.auth.admin.updateUserById(
        user.auth_user_id,
        { email_confirm: true }
      );
    } catch (authError) {
      console.warn('Could not update auth user email confirmation:', authError);
      // Continue anyway as this might not be critical for all flows
    }
  }

  // 6. Generate token (same as original function)
  const token = signToken(user.user_id, user.auth_user_id);
  
  // 7. Return success response with token
  res.status(200).json({
    status: 'success',
    token,
    message: 'Account verified successfully'
  });
});
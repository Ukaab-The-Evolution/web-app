import express from 'express';
import {
  signup,
  login,
  protect,
  updatePassword,
  getMe,
  forgotPassword,
  resetPassword,
  restrictTo,
  createAdmin,
  // verifyOtp,
  // resendOtp
} from '../controllers/auth/authController.js';
import { sendOtp } from '../controllers/auth/sendOtp.js';
import { verifyOtp } from '../controllers/auth/verifyOtp.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
router.post('/createAdmin', protect, restrictTo('admin'), createAdmin);
// router.post('/verify-otp', verifyOtp);
// router.post('/resend-otp', resendOtp);

// (New) OTP Using Brevo
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

// Protected routes
router.use(protect);
router.get('/me', getMe);
router.patch('/updatePassword', updatePassword);

export default router;

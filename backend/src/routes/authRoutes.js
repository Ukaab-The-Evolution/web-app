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
  // verifyEmail,
  // resendVerification,
  logout
} from '../controllers/auth/authController.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
// router.get('/verify-email', verifyEmail);
// router.post('/resend-verification', resendVerification);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Admin routes
router.post('/createAdmin', protect, restrictTo('admin'), createAdmin);

// Protected routes
router.use(protect);
router.get('/me', getMe);
router.patch('/updatePassword', updatePassword);

export default router;

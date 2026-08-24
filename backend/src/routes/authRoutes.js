import express from 'express';
import {
  signup,
  login,
  updatePassword,
  getMe,
  forgotPassword,
  resetPassword,
  logout
} from '../controllers/auth/authController.js';
import { protect } from '../middleware/protect.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
// router.get('/verify-email', verifyEmail);
// router.post('/resend-verification', resendVerification);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.use(protect);
router.get('/me', getMe);
router.patch('/updatePassword', updatePassword);

export default router;

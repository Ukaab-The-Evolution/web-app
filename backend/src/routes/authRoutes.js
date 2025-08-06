import express from 'express';
import {
  signup,
  login,
  protect,
  updatePassword,
  getMe,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

// Protected routes
router.use(protect);
router.get('/me', getMe);
router.patch('/updatePassword', updatePassword);

export default router;
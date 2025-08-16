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
  createAdmin
} from '../controllers/authController.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
router.post('/createAdmin', protect, restrictTo('admin'), createAdmin);

// Protected routes
router.use(protect);
router.get('/me', getMe);
router.patch('/updatePassword', updatePassword);

export default router;

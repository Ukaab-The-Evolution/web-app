import express from 'express';
import { protect } from '../middleware/protect.js';
import { requireRole } from '../middleware/auth.js';
import catchAsync from '../utils/catchAsync.js';
import {
  createLoad,
  getMyLoads,
  getAvailableLoads,
  getLoad,
  submitBid,
  getLoadBids,
  getLoadBookings,
  getMyBookings,
  updateBookingStatus,
  acceptBid,
} from '../controllers/loadController.js';

const router = express.Router();
router.use(protect);

router.post('/', requireRole('shipper'), catchAsync(createLoad));
router.get('/', requireRole('shipper'), catchAsync(getMyLoads));
router.get('/available', requireRole('driver', 'trucking_company'), catchAsync(getAvailableLoads));
router.get('/bookings/mine', requireRole('driver', 'trucking_company'), catchAsync(getMyBookings));
router.get('/:id', requireRole('driver', 'trucking_company', 'shipper'), catchAsync(getLoad));
router.post('/:id/bids', requireRole('driver'), catchAsync(submitBid));
router.get('/:id/bids', requireRole('driver', 'shipper', 'trucking_company'), catchAsync(getLoadBids));
router.get('/:id/bookings', requireRole('driver', 'shipper', 'trucking_company'), catchAsync(getLoadBookings));
router.post('/:id/bids/:bidId/accept', requireRole('shipper'), catchAsync(acceptBid));
router.patch('/bookings/:id/status', requireRole('driver', 'shipper'), catchAsync(updateBookingStatus));

export default router;

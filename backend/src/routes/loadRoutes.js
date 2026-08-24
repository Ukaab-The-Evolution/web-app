import express from 'express';
import { protect } from '../middleware/protect.js';
import { requireRole } from '../middleware/auth.js';
import catchAsync from '../utils/catchAsync.js';
import {
  createLoad,
  getAvailableLoads,
  getLoad,
  submitBid,
  getLoadBids,
  acceptBid,
} from '../controllers/loadController.js';

const router = express.Router();
router.use(protect);

router.post('/', requireRole('shipper'), catchAsync(createLoad));
router.get('/available', requireRole('driver', 'trucking_company', 'shipper'), catchAsync(getAvailableLoads));
router.get('/:id', requireRole('driver', 'trucking_company', 'shipper'), catchAsync(getLoad));
router.post('/:id/bids', requireRole('driver'), catchAsync(submitBid));
router.get('/:id/bids', requireRole('driver', 'shipper', 'trucking_company'), catchAsync(getLoadBids));
router.post('/:id/bids/:bidId/accept', requireRole('shipper'), catchAsync(acceptBid));

export default router;

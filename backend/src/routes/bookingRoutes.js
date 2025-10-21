import express from 'express';
import { postOrder } from '../controllers/bookingController/postOrder.js';
import { truckLocationUpdate } from '../controllers/bookingController/truckLocationUpdate.js';
import { respondOffer } from '../controllers/bookingController/respondOffer.js';

const router = express.Router();

// Protect all routes
// router.use(protect);

router.post('/orders', postOrder);
router.post('/trucks/location-update', truckLocationUpdate);
router.post('/offers/respond', respondOffer);

export default router;
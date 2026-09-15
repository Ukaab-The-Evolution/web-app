import express from 'express';
import { protect } from '../middleware/protect.js';
import { requireRole } from '../middleware/auth.js';
import catchAsync from '../utils/catchAsync.js';
import { createVehicle, getMyVehicles, updateVehicle, updateVehicleLocation } from '../controllers/vehicleController.js';

const router = express.Router();
router.use(protect);
router.get('/', requireRole('driver', 'trucking_company'), catchAsync(getMyVehicles));
router.post('/', requireRole('trucking_company'), catchAsync(createVehicle));
router.patch('/:id', requireRole('trucking_company'), catchAsync(updateVehicle));
router.patch('/:id/location', requireRole('driver'), catchAsync(updateVehicleLocation));
export default router;

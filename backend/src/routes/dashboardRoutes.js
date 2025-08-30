import express from 'express';
import { protect } from '../controllers/auth/authController.js';
import { 
  getOverviewStats, 
  getPieChartStats,
  getAvailableLoads,
  getShipperShipments,
  getLoadDetails,
  getShipmentDetails,
  submitBid,
  acceptLoad,
  searchLoads
} from '../controllers/dashboardController.js';

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// Existing routes
router.get('/overview', getOverviewStats);
router.get('/pie-chart', getPieChartStats);

// New routes for load/shipment listing
router.get('/loads/available', getAvailableLoads); // For drivers
router.get('/shipments', getShipperShipments); // For shippers
router.get('/search', searchLoads); // Search with filters

// Detailed views
router.get('/loads/:load_id', getLoadDetails);
router.get('/shipments/:load_id', getShipmentDetails);

// Bidding/acceptance
router.post('/bids', submitBid);
router.post('/accept-load', acceptLoad);

export default router;
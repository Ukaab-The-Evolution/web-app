import express from 'express';
import { protect } from '../controllers/authController.js';
import { 
  getOverviewStats, 
  getPieChartStats 
} from '../controllers/dashboardController.js';

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

router.get('/overview', getOverviewStats);
router.get('/pie-chart', getPieChartStats);

export default router;
import express from 'express';
import { protect } from '../middleware/protect.js';
import { getProfile, 
    updateProfile, 
    joinCompany, 
    generateInviteCode,
    getCompanyDrivers,
} from '../controllers/profileController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

router.get('/', getProfile);
router.patch('/', updateProfile);
router.post('/join-company', joinCompany);
router.post('/generate-invite-code', generateInviteCode);
router.get('/company-drivers', getCompanyDrivers);

export default router;

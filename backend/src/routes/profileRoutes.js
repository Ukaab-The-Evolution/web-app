import express from 'express';
import { protect } from '../controllers/auth/authController.js';
import { getProfile, 
    updateProfile, 
    joinCompany, 
    generateInviteCode 
} from '../controllers/profileController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

router.get('/', getProfile);
router.patch('/', updateProfile);
router.post('/join-company', joinCompany);
router.post('/generate-invite-code', generateInviteCode);

export default router;
import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/protect.js';
import { requireRole } from '../middleware/auth.js';
import { 
  uploadDocument, 
  getPendingDocuments, 
  reviewVerification 
} from '../controllers/uploadController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Protect all routes after this middleware
router.use(protect);

// User document upload
router.post('/upload', upload.single('document'), uploadDocument);

// Review routes are restricted to verified organization owners until a dedicated admin role is added.
router.use(requireRole('trucking_company'));

router.get('/pending', getPendingDocuments);
router.patch('/review', reviewVerification);

export default router;

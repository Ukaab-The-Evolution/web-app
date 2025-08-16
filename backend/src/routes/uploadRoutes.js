import express from 'express';
import multer from 'multer';
import { protect, restrictTo } from '../controllers/authController.js';
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

// Admin routes
router.use(restrictTo('admin'));

router.get('/pending', getPendingDocuments);
router.patch('/review', reviewVerification);

export default router;

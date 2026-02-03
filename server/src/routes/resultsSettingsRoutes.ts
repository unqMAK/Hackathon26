import express from 'express';
import {
    getResultsPublishStatus,
    updateResultsPublishStatus
} from '../controllers/resultsSettingsController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// Public route - anyone can check if results are published
router.get('/results', getResultsPublishStatus);

// Admin only - toggle results visibility
router.put('/results', protect, authorize('admin'), updateResultsPublishStatus);

export default router;

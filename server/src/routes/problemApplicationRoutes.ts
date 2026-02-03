import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware';
import {
    applyForProblem,
    getMyApplications,
    getAdminApplications,
    approveApplication,
    rejectApplication,
    getApplicationStats,
    withdrawApplication
} from '../controllers/problemApplicationController';

const router = express.Router();

// Student routes (protected)
router.post('/apply', protect, applyForProblem);
router.get('/my-applications', protect, getMyApplications);
router.delete('/:id', protect, withdrawApplication);

// Admin routes
router.get('/admin', protect, authorize('admin'), getAdminApplications);
router.get('/stats', protect, authorize('admin'), getApplicationStats);
router.put('/:id/approve', protect, authorize('admin'), approveApplication);
router.put('/:id/reject', protect, authorize('admin'), rejectApplication);

export default router;

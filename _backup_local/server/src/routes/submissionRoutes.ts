import express from 'express';
import {
    getSubmissions,
    createSubmission,
    updateSubmission,
    getTeamSubmissions,
    getSubmissionById,
    lockSubmission,
    scoreSubmission,
    deleteSubmission,
    getDeadline,
    updateDeadline
} from '../controllers/submissionController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// Deadline routes (must be before /:id routes)
router.get('/deadline', getDeadline);
router.put('/deadline', protect, authorize('admin'), updateDeadline);

// Team submissions route (must be before /:id routes)
router.get('/team/:teamId', protect, getTeamSubmissions);

// Main CRUD routes
router.get('/', protect, authorize('admin', 'judge', 'spoc'), getSubmissions);
router.post('/', protect, authorize('student'), createSubmission);

// Single submission routes
router.get('/:id', protect, getSubmissionById);
router.put('/:id', protect, authorize('student'), updateSubmission);
router.put('/:id/lock', protect, authorize('admin'), lockSubmission);
router.put('/:id/score', protect, authorize('judge', 'admin'), scoreSubmission);
router.delete('/:id', protect, authorize('admin'), deleteSubmission);

export default router;

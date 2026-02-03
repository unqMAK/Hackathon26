import express from 'express';
import {
    submitFeedback,
    getTeamFeedback,
    getMyFeedback,
    updateFeedback,
    deleteFeedback,
    addReply
} from '../controllers/feedbackController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// Mentor routes
router.post('/', protect, authorize('mentor'), submitFeedback);
router.get('/my', protect, authorize('mentor'), getMyFeedback);
router.put('/:id', protect, authorize('mentor'), updateFeedback);
router.delete('/:id', protect, authorize('mentor', 'admin'), deleteFeedback);

// Team feedback (mentor, admin, student for their own team)
router.get('/team/:teamId', protect, authorize('mentor', 'admin', 'student'), getTeamFeedback);
router.post('/:id/reply', protect, authorize('mentor', 'student'), addReply);

export default router;

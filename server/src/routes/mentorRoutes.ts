import express from 'express';
import {
    getMentors,
    createMentor,
    updateMentor,
    deleteMentor,
    assignMentor,
    unassignMentor,
    getMyTeams,
    getTeamDetails,
    getMentorStats
} from '../controllers/mentorController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// Admin routes
router.get('/', protect, authorize('admin'), getMentors);
router.post('/', protect, authorize('admin'), createMentor);
router.put('/assign', protect, authorize('admin'), assignMentor);
router.put('/unassign', protect, authorize('admin'), unassignMentor);
router.put('/:id', protect, authorize('admin'), updateMentor);
router.delete('/:id', protect, authorize('admin'), deleteMentor);

// Mentor routes
router.get('/my-teams', protect, authorize('mentor'), getMyTeams);
router.get('/stats', protect, authorize('mentor'), getMentorStats);
router.get('/team/:teamId', protect, authorize('mentor', 'admin'), getTeamDetails);

export default router;

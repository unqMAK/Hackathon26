import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware';
import {
    createAdmin,
    createJudge,
    createMentor,
    createSpoc,
    approveGovernanceTeam,
    rejectGovernanceTeam,
    getAdminPendingTeams
} from '../controllers/adminController';

const router = express.Router();

// Admin-only routes for creating users with elevated roles
router.post('/create-admin', protect, authorize('admin'), createAdmin);
router.post('/create-judge', protect, authorize('admin'), createJudge);
router.post('/create-mentor', protect, authorize('admin'), createMentor);
router.post('/create-spoc', protect, authorize('admin'), createSpoc);

// Governance Routes
router.get('/pending-teams', protect, authorize('admin'), getAdminPendingTeams);
router.put('/approve-team/:teamId', protect, authorize('admin'), approveGovernanceTeam);
router.put('/reject-team/:teamId', protect, authorize('admin'), rejectGovernanceTeam);

export default router;

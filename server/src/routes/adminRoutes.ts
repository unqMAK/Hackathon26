import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware';
import {
    createAdmin,
    createJudge,
    createMentor,
    createSpoc,
    approveGovernanceTeam,
    rejectGovernanceTeam,
    getAdminPendingTeams,
    deleteTeam,
    getPasswordResetRequests,
    approvePasswordReset,
    rejectPasswordReset,
    adminResetUserPassword,
    exportTeamsCSVFlat,
    exportTeamsCSVStructured,
    getProblemSelectionLock,
    setProblemSelectionLock,
    getTeamSelections
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
router.delete('/teams/:teamId', protect, authorize('admin'), deleteTeam);

// Password Reset Management Routes
router.get('/password-reset-requests', protect, authorize('admin'), getPasswordResetRequests);
router.put('/password-reset-requests/:requestId/approve', protect, authorize('admin'), approvePasswordReset);
router.put('/password-reset-requests/:requestId/reject', protect, authorize('admin'), rejectPasswordReset);
router.post('/reset-user-password', protect, authorize('admin'), adminResetUserPassword);

// CSV Export Routes
router.get('/export/teams-flat', protect, authorize('admin'), exportTeamsCSVFlat);
router.get('/export/teams-structured', protect, authorize('admin'), exportTeamsCSVStructured);

// Team Selections & Settings Routes
router.get('/team-selections', protect, authorize('admin'), getTeamSelections);
router.get('/settings/problem-lock', protect, authorize('admin'), getProblemSelectionLock);
router.put('/settings/problem-lock', protect, authorize('admin'), setProblemSelectionLock);

export default router;

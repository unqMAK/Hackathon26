import express from 'express';
import {
    getPendingTeams,
    getApprovedTeams,
    getRejectedTeams,
    approveTeam,
    rejectTeam,
    getInstituteStudents,
    getInvitationLogs,
    getInstituteMentors,
    getInstituteJudges,
    getDashboardStats
} from '../controllers/spocController';
import { protect } from '../middleware/authMiddleware';
import { requireSPOC } from '../middleware/roleMiddleware';

const router = express.Router();

// All routes require authentication and SPOC role
router.use(protect, requireSPOC);

// Dashboard stats
router.get('/stats', getDashboardStats);

// Team management
router.get('/teams/pending', getPendingTeams);
router.get('/teams/approved', getApprovedTeams);
router.get('/teams/rejected', getRejectedTeams);
router.put('/teams/:teamId/approve', approveTeam);
router.put('/teams/:teamId/reject', rejectTeam);

// Student management
router.get('/students', getInstituteStudents);

// Invitation logs
router.get('/invitations', getInvitationLogs);

// Mentors and Judges
router.get('/mentors', getInstituteMentors);
router.get('/judges', getInstituteJudges);

export default router;

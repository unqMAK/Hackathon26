import express from 'express';
import { getTeams, createTeam, updateTeam, getMyTeam, removeMember, getAvailableTeams, getTeamProgress, selectProblem, requestTeamApproval, registerTeam } from '../controllers/teamController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// Public registration route
router.post('/register', registerTeam);

router.get('/', protect, getTeams);
router.get('/available', protect, getAvailableTeams);
router.get('/my-team', protect, getMyTeam);
router.get('/:id/progress', protect, getTeamProgress);
router.post('/', protect, createTeam);
router.post('/select-problem', protect, selectProblem);
router.put('/:teamId/request-approval', protect, requestTeamApproval);
router.put('/:id', protect, updateTeam);
router.delete('/:teamId/members/:userId', protect, removeMember);

export default router;

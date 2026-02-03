import express from 'express';
import {
    submitEvaluation,
    getTeamEvaluations,
    getJudgeEvaluations,
    getMyEvaluations,
    getFinalResults,
    getAssignedTeams,
    assignTeamsToJudge,
    getJudgesWithAssignments,
    getPublicLeaderboard,
    getMyTeamResult
} from '../controllers/evaluationController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// Public route - leaderboard (respects publish status)
router.get('/public-leaderboard', getPublicLeaderboard);

// Student route - get my team's result
router.get('/my-result', protect, authorize('student'), getMyTeamResult);

// Judge routes
router.post('/', protect, authorize('judge'), submitEvaluation);
router.get('/my', protect, authorize('judge'), getMyEvaluations);
router.get('/assigned-teams', protect, authorize('judge'), getAssignedTeams);

// Judge/Admin routes
router.get('/team/:teamId', protect, authorize('judge', 'admin'), getTeamEvaluations);
router.get('/judge/:judgeId', protect, authorize('judge', 'admin'), getJudgeEvaluations);

// Admin routes
router.get('/final', protect, authorize('admin'), getFinalResults);
router.get('/judges', protect, authorize('admin'), getJudgesWithAssignments);
router.put('/assign', protect, authorize('admin'), assignTeamsToJudge);

export default router;


import { Request, Response } from 'express';
import Evaluation from '../models/Evaluation';
import Rubric from '../models/Rubric';
import Team from '../models/Team';
import User from '../models/User';
import Settings from '../models/Settings';
import mongoose from 'mongoose';

// Check if results are published
const checkResultsPublished = async (): Promise<boolean> => {
    const setting = await Settings.findOne({ key: 'publish_results' });
    return setting?.value?.published === true;
};

// Calculate weighted total score
const calculateTotalScore = async (scores: { rubricId: string; score: number }[]): Promise<number> => {
    let totalScore = 0;

    for (const { rubricId, score } of scores) {
        const rubric = await Rubric.findById(rubricId);
        if (rubric && rubric.isActive) {
            // (score / maxScore) * weight * 100
            totalScore += (score / rubric.maxScore) * rubric.weight * 100;
        }
    }

    return Math.round(totalScore * 100) / 100; // Round to 2 decimal places
};

// POST /api/evaluations - Submit evaluation (judge only)
export const submitEvaluation = async (req: Request, res: Response) => {
    try {
        const { teamId, scores, feedback } = req.body;
        const judgeId = (req as any).user._id;

        // Validate team exists
        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Check if judge is assigned to this team
        const judge = await User.findById(judgeId);
        if (!judge) {
            return res.status(404).json({ message: 'Judge not found' });
        }

        // Check assignment (if assignedTeams is set, validate)
        if (judge.assignedTeams && judge.assignedTeams.length > 0) {
            const isAssigned = judge.assignedTeams.some(
                (t: mongoose.Types.ObjectId) => t.toString() === teamId
            );
            if (!isAssigned) {
                return res.status(403).json({ message: 'You are not assigned to evaluate this team' });
            }
        }

        // Check if evaluation already exists
        const existingEval = await Evaluation.findOne({ teamId, judgeId });
        if (existingEval) {
            return res.status(400).json({ message: 'You have already submitted an evaluation for this team' });
        }

        // Validate scores match active rubrics
        const activeRubrics = await Rubric.find({ isActive: true });
        if (scores.length !== activeRubrics.length) {
            return res.status(400).json({
                message: `Please provide scores for all ${activeRubrics.length} rubrics`
            });
        }

        // Validate each score
        for (const { rubricId, score } of scores) {
            const rubric = activeRubrics.find(r => r._id.toString() === rubricId);
            if (!rubric) {
                return res.status(400).json({ message: `Invalid rubric ID: ${rubricId}` });
            }
            if (score < 0 || score > rubric.maxScore) {
                return res.status(400).json({
                    message: `Score for ${rubric.title} must be between 0 and ${rubric.maxScore}`
                });
            }
        }

        // Calculate total score
        const totalScore = await calculateTotalScore(scores);

        // Create evaluation
        const evaluation = await Evaluation.create({
            teamId,
            judgeId,
            scores,
            totalScore,
            feedback,
            submittedAt: new Date()
        });

        const populatedEval = await Evaluation.findById(evaluation._id)
            .populate('teamId', 'name')
            .populate('judgeId', 'name email')
            .populate('scores.rubricId', 'title maxScore');

        return res.status(201).json(populatedEval);
    } catch (error: any) {
        console.error('Submit evaluation error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'You have already evaluated this team' });
        }
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// GET /api/evaluations/team/:teamId - Get evaluations for a team
export const getTeamEvaluations = async (req: Request, res: Response) => {
    try {
        const { teamId } = req.params;
        const userRole = (req as any).user.role;
        const userId = (req as any).user._id;

        // Judges can only see their own evaluations for the team
        let query: any = { teamId };
        if (userRole === 'judge') {
            query.judgeId = userId;
        }

        const evaluations = await Evaluation.find(query)
            .populate('judgeId', 'name email')
            .populate('scores.rubricId', 'title maxScore weight')
            .sort({ submittedAt: -1 });

        return res.json(evaluations);
    } catch (error: any) {
        console.error('Get team evaluations error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// GET /api/evaluations/judge/:judgeId - Get evaluations by a judge
export const getJudgeEvaluations = async (req: Request, res: Response) => {
    try {
        const { judgeId } = req.params;
        const userId = (req as any).user._id;
        const userRole = (req as any).user.role;

        // Judges can only see their own evaluations
        if (userRole === 'judge' && judgeId !== userId.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const evaluations = await Evaluation.find({ judgeId })
            .populate({
                path: 'teamId',
                select: 'name problemId',
                populate: {
                    path: 'problemId',
                    select: 'title category'
                }
            })
            .populate('scores.rubricId', 'title maxScore')
            .sort({ submittedAt: -1 });

        return res.json(evaluations);
    } catch (error: any) {
        console.error('Get judge evaluations error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// GET /api/evaluations/my - Get current judge's evaluations
export const getMyEvaluations = async (req: Request, res: Response) => {
    try {
        const judgeId = (req as any).user._id;

        const evaluations = await Evaluation.find({ judgeId })
            .populate({
                path: 'teamId',
                select: 'name problemId',
                populate: {
                    path: 'problemId',
                    select: 'title category'
                }
            })
            .populate('scores.rubricId', 'title maxScore')
            .sort({ submittedAt: -1 });

        return res.json(evaluations);
    } catch (error: any) {
        console.error('Get my evaluations error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// GET /api/evaluations/final - Get leaderboard (admin only)
export const getFinalResults = async (req: Request, res: Response) => {
    try {
        const { instituteId, problemId } = req.query;

        // Get all teams with submissions
        let teamQuery: any = { status: 'approved' };
        if (instituteId) teamQuery.instituteId = instituteId;
        if (problemId) teamQuery.problemId = problemId;

        const teams = await Team.find(teamQuery)
            .populate('problemId', 'title category')
            .populate('leaderId', 'name');

        // Get all evaluations
        const evaluations = await Evaluation.find()
            .populate('judgeId', 'name');

        // Calculate average scores for each team
        const leaderboard = teams.map(team => {
            const teamEvals = evaluations.filter(
                e => e.teamId.toString() === team._id.toString()
            );

            const totalScores = teamEvals.map(e => e.totalScore);
            const avgScore = totalScores.length > 0
                ? totalScores.reduce((a, b) => a + b, 0) / totalScores.length
                : 0;

            return {
                teamId: team._id,
                teamName: team.name,
                problem: team.problemId,
                leader: team.leaderId,
                avgScore: Math.round(avgScore * 100) / 100,
                evaluationCount: teamEvals.length,
                evaluations: teamEvals.map(e => ({
                    judgeId: e.judgeId,
                    totalScore: e.totalScore,
                    submittedAt: e.submittedAt
                }))
            };
        });

        // Sort by average score descending
        leaderboard.sort((a, b) => b.avgScore - a.avgScore);

        // Add rank
        const rankedLeaderboard = leaderboard.map((entry, index) => ({
            ...entry,
            rank: index + 1
        }));

        return res.json(rankedLeaderboard);
    } catch (error: any) {
        console.error('Get final results error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// GET /api/evaluations/assigned-teams - Get teams assigned to judge
export const getAssignedTeams = async (req: Request, res: Response) => {
    try {
        const judgeId = (req as any).user._id;

        const judge = await User.findById(judgeId);
        if (!judge) {
            return res.status(404).json({ message: 'Judge not found' });
        }

        // Get assigned teams
        let teams;
        if (judge.assignedTeams && judge.assignedTeams.length > 0) {
            teams = await Team.find({
                _id: { $in: judge.assignedTeams },
                status: 'approved'
            })
                .populate('problemId', 'title category')
                .populate('leaderId', 'name email');
        } else {
            // If no specific assignment, show all approved teams
            teams = await Team.find({ status: 'approved' })
                .populate('problemId', 'title category')
                .populate('leaderId', 'name email');
        }

        // Get existing evaluations by this judge
        const myEvaluations = await Evaluation.find({ judgeId });
        const evaluatedTeamIds = myEvaluations.map(e => e.teamId.toString());

        // Add evaluation status to each team
        const teamsWithStatus = teams.map(team => ({
            ...team.toObject(),
            isEvaluated: evaluatedTeamIds.includes(team._id.toString())
        }));

        return res.json(teamsWithStatus);
    } catch (error: any) {
        console.error('Get assigned teams error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// PUT /api/admin/judges/assign - Assign teams to judge (admin only)
export const assignTeamsToJudge = async (req: Request, res: Response) => {
    try {
        const { judgeId, teamIds } = req.body;

        if (!judgeId) {
            return res.status(400).json({ message: 'Judge ID is required' });
        }
        if (!teamIds || !Array.isArray(teamIds)) {
            return res.status(400).json({ message: 'Team IDs array is required' });
        }

        const judge = await User.findById(judgeId);
        if (!judge || judge.role !== 'judge') {
            return res.status(404).json({ message: 'Judge not found' });
        }

        // Validate all teams exist
        const teams = await Team.find({ _id: { $in: teamIds } });
        if (teams.length !== teamIds.length) {
            return res.status(400).json({ message: 'Some teams were not found' });
        }

        // Update judge's assigned teams
        judge.assignedTeams = teamIds.map((id: string) => new mongoose.Types.ObjectId(id));
        await judge.save();

        return res.json({
            message: 'Teams assigned successfully',
            judge: {
                _id: judge._id,
                name: judge.name,
                email: judge.email,
                assignedTeams: judge.assignedTeams
            }
        });
    } catch (error: any) {
        console.error('Assign teams error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// GET /api/admin/judges - Get all judges with assignments
export const getJudgesWithAssignments = async (req: Request, res: Response) => {
    try {
        const judges = await User.find({ role: 'judge' })
            .select('name email assignedTeams')
            .populate('assignedTeams', 'name');

        return res.json(judges);
    } catch (error: any) {
        console.error('Get judges error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// GET /api/evaluations/public-leaderboard - Public leaderboard (respects publish status)
export const getPublicLeaderboard = async (req: Request, res: Response) => {
    try {
        const isPublished = await checkResultsPublished();

        if (!isPublished) {
            return res.json({
                visible: false,
                message: 'Results are not yet published. Please check back later.',
                leaderboard: []
            });
        }

        // Get all approved teams
        const teams = await Team.find({ status: 'approved' })
            .populate('problemId', 'title category')
            .populate('leaderId', 'name');

        // Get all evaluations
        const evaluations = await Evaluation.find();

        // Calculate average scores for each team
        const leaderboard = teams.map(team => {
            const teamEvals = evaluations.filter(
                e => e.teamId.toString() === team._id.toString()
            );

            const totalScores = teamEvals.map(e => e.totalScore);
            const avgScore = totalScores.length > 0
                ? totalScores.reduce((a, b) => a + b, 0) / totalScores.length
                : 0;

            return {
                teamId: team._id,
                teamName: team.name,
                problem: team.problemId,
                avgScore: Math.round(avgScore * 100) / 100,
                evaluationCount: teamEvals.length
            };
        });

        // Sort by average score descending and add rank
        leaderboard.sort((a, b) => b.avgScore - a.avgScore);
        const rankedLeaderboard = leaderboard.map((entry, index) => ({
            ...entry,
            rank: index + 1
        }));

        return res.json({
            visible: true,
            message: 'Results are now available!',
            leaderboard: rankedLeaderboard
        });
    } catch (error: any) {
        console.error('Get public leaderboard error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// GET /api/evaluations/my-result - Get current student's team result
export const getMyTeamResult = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;

        // Check if results are published
        const isPublished = await checkResultsPublished();

        if (!isPublished) {
            return res.json({
                visible: false,
                message: 'Results are not yet published. Please check back later.',
                result: null
            });
        }

        // Find user's team
        const user = await User.findById(userId);
        if (!user || !user.teamId) {
            return res.json({
                visible: true,
                message: 'You are not part of any team.',
                result: null
            });
        }

        // Get team
        const team = await Team.findById(user.teamId)
            .populate('problemId', 'title category');

        if (!team) {
            return res.json({
                visible: true,
                message: 'Team not found.',
                result: null
            });
        }

        // Get evaluations for this team
        const evaluations = await Evaluation.find({ teamId: team._id })
            .populate('scores.rubricId', 'title maxScore weight');

        const totalScores = evaluations.map(e => e.totalScore);
        const avgScore = totalScores.length > 0
            ? totalScores.reduce((a, b) => a + b, 0) / totalScores.length
            : 0;

        // Get rank
        const allTeams = await Team.find({ status: 'approved' });
        const allEvaluations = await Evaluation.find();

        const allScores = allTeams.map(t => {
            const teamEvals = allEvaluations.filter(
                e => e.teamId.toString() === t._id.toString()
            );
            const scores = teamEvals.map(e => e.totalScore);
            return {
                teamId: t._id.toString(),
                avgScore: scores.length > 0
                    ? scores.reduce((a, b) => a + b, 0) / scores.length
                    : 0
            };
        }).sort((a, b) => b.avgScore - a.avgScore);

        const rank = allScores.findIndex(s => s.teamId === team._id.toString()) + 1;

        return res.json({
            visible: true,
            message: 'Your results are available!',
            result: {
                teamId: team._id,
                teamName: team.name,
                problem: team.problemId,
                avgScore: Math.round(avgScore * 100) / 100,
                evaluationCount: evaluations.length,
                rank: rank || 'N/A',
                totalTeams: allTeams.length
            }
        });
    } catch (error: any) {
        console.error('Get my team result error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

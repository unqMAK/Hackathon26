import { Request, Response } from 'express';
import Team from '../models/Team';
import Problem from '../models/Problem';
import Settings from '../models/Settings';
import User from '../models/User';

const SELECTION_WINDOW_KEY = 'problemSelectionOpen';

// Check if selection window is open
export const getSelectionWindowStatus = async (req: Request, res: Response) => {
    try {
        const setting = await Settings.findOne({ key: SELECTION_WINDOW_KEY });
        res.json({ isOpen: setting?.value ?? true }); // Default to open if not set
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Toggle selection window (Admin only)
export const toggleSelectionWindow = async (req: Request, res: Response) => {
    try {
        const { isOpen } = req.body;

        await Settings.findOneAndUpdate(
            { key: SELECTION_WINDOW_KEY },
            { key: SELECTION_WINDOW_KEY, value: isOpen },
            { upsert: true, new: true }
        );

        res.json({ message: `Problem selection window ${isOpen ? 'opened' : 'closed'}`, isOpen });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Select a problem for team (Student/Team Leader)
export const selectProblem = async (req: Request, res: Response) => {
    try {
        const { problemId } = req.body;
        const userId = (req as any).user?._id;

        // Check if selection window is open
        const setting = await Settings.findOne({ key: SELECTION_WINDOW_KEY });
        if (setting && setting.value === false) {
            return res.status(403).json({ message: 'Problem selection is currently closed' });
        }

        // Find user's team where they are the leader
        const team = await Team.findOne({ leaderId: userId });
        if (!team) {
            return res.status(404).json({ message: 'You must be a team leader to select a problem' });
        }

        if (team.status !== 'approved') {
            return res.status(403).json({ message: 'Your team must be approved before selecting a problem' });
        }

        // Verify problem exists
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        // Update team's selected problem
        team.problemId = problemId;
        await team.save();

        res.json({
            message: `Successfully selected: ${problem.title}`,
            selectedProblem: {
                _id: problem._id,
                title: problem.title,
                category: problem.category
            }
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get current team's problem selection
export const getMySelection = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?._id;

        const team = await Team.findOne({
            $or: [{ leaderId: userId }, { members: userId }]
        }).populate('problemId');

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Get selection window status
        const setting = await Settings.findOne({ key: SELECTION_WINDOW_KEY });
        const isSelectionOpen = setting?.value ?? true;

        res.json({
            selectedProblem: team.problemId || null,
            isSelectionOpen,
            canSelect: team.status === 'approved' && isSelectionOpen && team.leaderId.toString() === userId?.toString()
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get all problem selections with team and contact details (Admin only)
export const getAllSelections = async (req: Request, res: Response) => {
    try {
        // Get all approved teams with their problem selections
        const teams = await Team.find({ status: 'approved' })
            .populate('problemId', 'title category')
            .populate('leaderId', 'name email phone')
            .populate('spocId', 'name email phone')
            .sort({ 'problemId': 1 });

        // Get selection window status
        const setting = await Settings.findOne({ key: SELECTION_WINDOW_KEY });
        const isSelectionOpen = setting?.value ?? true;

        // Group by problem
        const problemGroups: Record<string, any> = {};
        const unselectedTeams: any[] = [];

        for (const team of teams) {
            const teamData = {
                _id: team._id,
                teamName: team.name,
                instituteName: team.instituteName,
                instituteCode: team.instituteCode,
                leader: team.leaderId ? {
                    name: (team.leaderId as any).name,
                    email: (team.leaderId as any).email,
                    phone: (team.leaderId as any).phone || 'N/A'
                } : null,
                spoc: {
                    name: team.spocName,
                    email: team.spocEmail
                },
                mentor: {
                    name: team.mentorName,
                    email: team.mentorEmail
                }
            };

            if (team.problemId) {
                const problemId = (team.problemId as any)._id.toString();
                if (!problemGroups[problemId]) {
                    problemGroups[problemId] = {
                        problem: {
                            _id: (team.problemId as any)._id,
                            title: (team.problemId as any).title,
                            category: (team.problemId as any).category
                        },
                        teams: []
                    };
                }
                problemGroups[problemId].teams.push(teamData);
            } else {
                unselectedTeams.push(teamData);
            }
        }

        // Get all problems for stats
        const allProblems = await Problem.find().select('_id title category');
        const problemStats = allProblems.map(problem => ({
            _id: problem._id,
            title: problem.title,
            category: problem.category,
            teamCount: problemGroups[problem._id.toString()]?.teams.length || 0
        }));

        res.json({
            isSelectionOpen,
            problemSelections: Object.values(problemGroups),
            unselectedTeams,
            problemStats,
            totalApprovedTeams: teams.length,
            teamsWithSelection: teams.filter(t => t.problemId).length
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

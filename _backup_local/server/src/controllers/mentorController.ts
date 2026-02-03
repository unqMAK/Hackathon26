import { Request, Response } from 'express';
import User from '../models/User';
import Team from '../models/Team';
import MentorFeedback from '../models/MentorFeedback';
import PendingTeam from '../models/PendingTeam';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

// GET /api/mentors - Get all mentors (Admin only)
export const getMentors = async (req: Request, res: Response) => {
    try {
        const mentors = await User.find({ role: 'mentor' })
            .select('-password')
            .lean();

        const mentorsWithTeams = await Promise.all(mentors.map(async (mentor) => {
            const assignedTeams = await Team.find({ mentorId: mentor._id })
                .select('name status');

            return {
                ...mentor,
                assignedTeams
            };
        }));

        return res.json(mentorsWithTeams);
    } catch (error: any) {
        console.error('Get mentors error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// POST /api/mentors - Create mentor (Admin only)
export const createMentor = async (req: Request, res: Response) => {
    try {
        const { name, email, password, expertise } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Create mentor
        const mentor = await User.create({
            name,
            email,
            password,
            role: 'mentor',
            expertise: expertise || []
        });

        const mentorResponse = await User.findById(mentor._id).select('-password');
        return res.status(201).json(mentorResponse);
    } catch (error: any) {
        console.error('Create mentor error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// PUT /api/mentors/:id - Update mentor (Admin only)
export const updateMentor = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, email, expertise, password } = req.body;

        const mentor = await User.findById(id);
        if (!mentor || mentor.role !== 'mentor') {
            return res.status(404).json({ message: 'Mentor not found' });
        }

        if (name) mentor.name = name;
        if (email) mentor.email = email;
        if (expertise) mentor.expertise = expertise;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            mentor.password = await bcrypt.hash(password, salt);
        }

        await mentor.save();

        const updatedMentor = await User.findById(id).select('-password');
        return res.json(updatedMentor);
    } catch (error: any) {
        console.error('Update mentor error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// DELETE /api/mentors/:id - Delete mentor (Admin only)
export const deleteMentor = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const mentor = await User.findById(id);
        if (!mentor || mentor.role !== 'mentor') {
            return res.status(404).json({ message: 'Mentor not found' });
        }

        // Remove mentor from all assigned teams
        await Team.updateMany(
            { mentorId: id },
            { $unset: { mentorId: 1 } }
        );

        // Delete all feedback by this mentor
        await MentorFeedback.deleteMany({ mentorId: id });

        // Delete mentor
        await User.findByIdAndDelete(id);

        return res.json({ message: 'Mentor deleted successfully' });
    } catch (error: any) {
        console.error('Delete mentor error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// PUT /api/mentors/assign - Assign mentor to team (Admin only)
export const assignMentor = async (req: Request, res: Response) => {
    try {
        const { mentorId, teamId } = req.body;

        const mentor = await User.findById(mentorId);
        if (!mentor || mentor.role !== 'mentor') {
            return res.status(404).json({ message: 'Mentor not found' });
        }

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Update team's mentorId
        team.mentorId = new mongoose.Types.ObjectId(mentorId);
        await team.save();

        // Add team to mentor's assignedTeams
        if (!mentor.assignedTeams) {
            mentor.assignedTeams = [];
        }
        if (!mentor.assignedTeams.some(t => t.toString() === teamId)) {
            mentor.assignedTeams.push(new mongoose.Types.ObjectId(teamId));
            await mentor.save();
        }

        return res.json({ message: 'Mentor assigned successfully', team });
    } catch (error: any) {
        console.error('Assign mentor error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// PUT /api/mentors/unassign - Remove mentor from team (Admin only)
export const unassignMentor = async (req: Request, res: Response) => {
    try {
        const { teamId } = req.body;

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        const mentorId = team.mentorId;

        // Remove mentor from team
        team.mentorId = undefined;
        await team.save();

        // Remove team from mentor's assignedTeams
        if (mentorId) {
            await User.findByIdAndUpdate(mentorId, {
                $pull: { assignedTeams: teamId }
            });
        }

        return res.json({ message: 'Mentor unassigned successfully' });
    } catch (error: any) {
        console.error('Unassign mentor error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// GET /api/mentors/my-teams - Get assigned teams for current mentor
export const getMyTeams = async (req: Request, res: Response) => {
    try {
        const mentorId = (req as any).user._id;

        const teams = await Team.find({ mentorId })
            .populate('leaderId', 'name email')
            .populate('members', 'name email')
            .populate('problemId', 'title category');

        // Get feedback counts for each team
        const teamsWithFeedback = await Promise.all(teams.map(async (team) => {
            const feedbackCount = await MentorFeedback.countDocuments({
                teamId: team._id,
                mentorId
            });
            const latestFeedback = await MentorFeedback.findOne({
                teamId: team._id,
                mentorId
            }).sort({ createdAt: -1 });

            return {
                ...team.toObject(),
                feedbackCount,
                latestFeedback: latestFeedback ? {
                    phase: latestFeedback.phase,
                    status: latestFeedback.status,
                    date: latestFeedback.createdAt
                } : null
            };
        }));

        return res.json(teamsWithFeedback);
    } catch (error: any) {
        console.error('Get my teams error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// GET /api/mentors/team/:teamId - Get team details for mentor or admin
export const getTeamDetails = async (req: Request, res: Response) => {
    try {
        const { teamId } = req.params;
        const mentorId = (req as any).user._id;
        const userRole = (req as any).user.role;

        let team = await Team.findById(teamId)
            .populate('leaderId', 'name email')
            .populate('members', 'name email')
            .populate('problemId', 'title category description')
            .populate('mentorId', 'name email expertise');

        let isPending = false;

        if (!team) {
            // Check if it's a pending team awaiting approval
            const pendingTeamDoc = await PendingTeam.findById(teamId);
            if (!pendingTeamDoc) {
                return res.status(404).json({ message: 'Team not found' });
            }

            isPending = true;
            // Transform for frontend compatibility (TeamDetailsSheet expects team.leaderId.name)
            team = {
                ...pendingTeamDoc.toObject(),
                leaderId: {
                    name: (pendingTeamDoc as any).leaderName,
                    email: (pendingTeamDoc as any).leaderEmail
                }
            } as any;
        }

        // Access control: mentors can only access their assigned teams
        if (userRole === 'mentor' && !isPending) {
            const assignedMentorId = (team!.mentorId as any)?._id || team!.mentorId;
            if (assignedMentorId?.toString() !== mentorId.toString()) {
                return res.status(403).json({ message: 'You are not assigned to this team' });
            }
        } else if (userRole === 'mentor' && isPending) {
            return res.status(403).json({ message: 'Mentors cannot access pending registrations' });
        }

        // Get all feedback for this team (if it exists)
        const feedback = !isPending ? await MentorFeedback.find({ teamId })
            .populate('mentorId', 'name')
            .sort({ createdAt: -1 }) : [];

        // Get SPOC details
        const spoc = await User.findOne({
            role: 'spoc',
            $or: [
                { instituteId: team!.instituteId || team!.instituteName },
                { instituteCode: team!.instituteCode }
            ]
        }).select('name email');

        return res.json({ team, feedback, spoc });
    } catch (error: any) {
        console.error('Get team details error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// GET /api/mentors/stats - Get mentor statistics
export const getMentorStats = async (req: Request, res: Response) => {
    try {
        const mentorId = (req as any).user._id;

        const assignedTeams = await Team.countDocuments({ mentorId });
        const totalFeedback = await MentorFeedback.countDocuments({ mentorId });

        const approvedPhases = await MentorFeedback.countDocuments({
            mentorId,
            status: 'approved'
        });

        const pendingReviews = await Team.countDocuments({
            mentorId,
            $or: [
                { 'phases.ideation': 'pending' },
                { 'phases.prototype': 'pending' },
                { 'phases.development': 'pending' },
                { 'phases.final': 'pending' }
            ]
        });

        return res.json({
            assignedTeams,
            totalFeedback,
            approvedPhases,
            pendingReviews
        });
    } catch (error: any) {
        console.error('Get mentor stats error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

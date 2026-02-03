import { Response } from 'express';
import Team from '../models/Team';
import User from '../models/User';
import TeamInvite from '../models/TeamInvite';
import mongoose from 'mongoose';
import Notification from '../models/Notification';
import emailService from '../services/emailService';

// Get all pending teams from SPOC's institute
export const getPendingTeams = async (req: any, res: Response) => {
    try {
        const spocInstituteId = req.user.instituteId;

        const teams = await Team.find({
            instituteId: spocInstituteId,
            status: 'pending'
        })
            .populate('leaderId', 'name email')
            .populate('members', 'name email')
            .sort({ createdAt: -1 });

        res.json(teams);
    } catch (error) {
        console.error('Error in getPendingTeams:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get all approved teams from SPOC's institute
export const getApprovedTeams = async (req: any, res: Response) => {
    try {
        const spocInstituteId = req.user.instituteId;

        const teams = await Team.find({
            instituteId: spocInstituteId,
            status: 'approved'
        })
            .populate('leaderId', 'name email')
            .populate('members', 'name email')
            .populate('problemId', 'title description category difficulty')
            .populate('approvedBy', 'name email')
            .sort({ approvedAt: -1 });

        res.json(teams);
    } catch (error) {
        console.error('Error in getApprovedTeams:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get all rejected teams from SPOC's institute
export const getRejectedTeams = async (req: any, res: Response) => {
    try {
        const spocInstituteId = req.user.instituteId;

        const teams = await Team.find({
            instituteId: spocInstituteId,
            status: 'rejected'
        })
            .populate('leaderId', 'name email')
            .populate('members', 'name email')
            .populate('approvedBy', 'name email')
            .sort({ approvedAt: -1 });

        res.json(teams);
    } catch (error) {
        console.error('Error in getRejectedTeams:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Approve a team
export const approveTeam = async (req: any, res: Response) => {
    try {
        const { teamId } = req.params;
        const { notes } = req.body;
        const spocId = req.user._id;
        const spocInstituteId = req.user.instituteId;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(teamId)) {
            return res.status(400).json({ message: 'Invalid team ID' });
        }

        // Find team
        const team = await Team.findById(teamId);

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Verify team belongs to SPOC's institute
        if (team.instituteId !== spocInstituteId) {
            return res.status(403).json({ message: 'You can only approve teams from your institute' });
        }

        // Update team
        team.status = 'approved';
        team.spocNotes = notes || '';
        team.approvedBy = spocId;
        team.approvedAt = new Date();
        team.requestSent = false;

        await team.save();

        // Populate for response
        const updatedTeam = await Team.findById(teamId)
            .populate('leaderId', 'name email')
            .populate('members', 'name email')
            .populate('approvedBy', 'name email');

        // NOTIFICATION: Notify team members
        try {
            await Notification.create({
                title: 'Team Approved',
                message: `Your team "${team.name}" has been approved by the SPOC.`,
                type: 'success',
                recipientType: 'custom',
                recipients: team.members,
                triggeredBy: spocId,
                relatedTeamId: team._id
            });
        } catch (notifError) {
            console.error('Failed to create notification:', notifError);
        }

        res.json({
            message: 'Team approved successfully',
            team: updatedTeam
        });
    } catch (error) {
        console.error('Error in approveTeam:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Reject a team
export const rejectTeam = async (req: any, res: Response) => {
    try {
        const { teamId } = req.params;
        const { notes } = req.body;
        const spocId = req.user._id;
        const spocInstituteId = req.user.instituteId;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(teamId)) {
            return res.status(400).json({ message: 'Invalid team ID' });
        }

        // Find team
        const team = await Team.findById(teamId);

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Verify team belongs to SPOC's institute
        if (team.instituteId !== spocInstituteId) {
            return res.status(403).json({ message: 'You can only reject teams from your institute' });
        }

        // Update team
        team.status = 'rejected';
        team.spocNotes = notes || '';
        team.approvedBy = spocId;
        team.approvedAt = new Date();
        team.requestSent = false;

        await team.save();

        // Populate for response
        const updatedTeam = await Team.findById(teamId)
            .populate('leaderId', 'name email')
            .populate('members', 'name email')
            .populate('approvedBy', 'name email');

        // NOTIFICATION: Notify team leader
        try {
            await Notification.create({
                title: 'Team Rejected',
                message: `Your team "${team.name}" has been rejected. Reason: ${notes || 'No reason provided'}`,
                type: 'warning',
                recipientType: 'custom',
                recipients: team.members,
                triggeredBy: spocId,
                relatedTeamId: team._id
            });
        } catch (notifError) {
            console.error('Failed to create notification:', notifError);
        }

        // EMAIL: Send rejection email to team leader
        try {
            const leader = await User.findById(team.leaderId);
            if (leader) {
                await emailService.sendRejectionEmail(leader.email, leader.name, team.name, notes || 'No reason provided');
            }
        } catch (emailError) {
            console.error('Failed to send rejection email:', emailError);
        }

        res.json({
            message: 'Team rejected successfully',
            team: updatedTeam
        });
    } catch (error) {
        console.error('Error in rejectTeam:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get all students from SPOC's institute
export const getInstituteStudents = async (req: any, res: Response) => {
    try {
        const spocInstituteId = req.user.instituteId;

        const students = await User.find({
            instituteId: spocInstituteId,
            role: 'student'
        })
            .populate('teamId', 'name status')
            .select('name email instituteId teamId createdAt')
            .sort({ name: 1 });

        res.json(students);
    } catch (error) {
        console.error('Error in getInstituteStudents:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get invitation logs for SPOC's institute
export const getInvitationLogs = async (req: any, res: Response) => {
    try {
        const spocInstituteId = req.user.instituteId;

        const invitations = await TeamInvite.find({
            instituteId: spocInstituteId
        })
            .populate('teamId', 'name')
            .populate('fromUserId', 'name email')
            .populate('toUserId', 'name email')
            .sort({ createdAt: -1 })
            .limit(100); // Limit to recent 100 invitations

        res.json(invitations);
    } catch (error) {
        console.error('Error in getInvitationLogs:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get all mentors from SPOC's institute
export const getInstituteMentors = async (req: any, res: Response) => {
    try {
        const spocInstituteId = req.user.instituteId;

        const mentors = await User.find({
            instituteId: spocInstituteId,
            role: 'mentor'
        })
            .select('name email instituteId createdAt')
            .sort({ name: 1 });

        res.json(mentors);
    } catch (error) {
        console.error('Error in getInstituteMentors:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get all judges from SPOC's institute
export const getInstituteJudges = async (req: any, res: Response) => {
    try {
        const spocInstituteId = req.user.instituteId;

        const judges = await User.find({
            instituteId: spocInstituteId,
            role: 'judge'
        })
            .select('name email instituteId createdAt')
            .sort({ name: 1 });

        res.json(judges);
    } catch (error) {
        console.error('Error in getInstituteJudges:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get dashboard statistics
export const getDashboardStats = async (req: any, res: Response) => {
    try {
        const spocInstituteId = req.user.instituteId;
        console.log('=== SPOC DASHBOARD STATS ===');
        console.log('SPOC User:', req.user.name, 'ID:', req.user._id);
        console.log('SPOC Institute ID:', spocInstituteId);

        // Debug: Check if any teams exist at all for this institute
        const allTeamsForInst = await Team.find({ instituteId: spocInstituteId }).select('name status instituteId');
        console.log('All Teams for this Institute:', allTeamsForInst);

        // Debug: Check a few random teams to see their institute IDs
        const randomTeams = await Team.find({}).limit(3).select('name instituteId');
        console.log('Random Teams in DB (to check format):', randomTeams);

        const [pendingCount, approvedCount, rejectedCount, totalStudents, totalInvites, totalTeams] = await Promise.all([
            Team.countDocuments({ instituteId: spocInstituteId, status: 'pending' }),
            Team.countDocuments({ instituteId: spocInstituteId, status: 'approved' }),
            Team.countDocuments({ instituteId: spocInstituteId, status: 'rejected' }),
            User.countDocuments({ instituteId: spocInstituteId, role: 'student' }),
            TeamInvite.countDocuments({ instituteId: spocInstituteId, status: 'pending' }),
            Team.countDocuments({ instituteId: spocInstituteId })
        ]);

        console.log('Counts:', { pendingCount, approvedCount, rejectedCount, totalStudents, totalTeams });
        console.log('============================');

        res.json({
            pendingTeams: pendingCount,
            approvedTeams: approvedCount,
            rejectedTeams: rejectedCount,
            totalStudents,
            pendingInvites: totalInvites,
            totalTeams
        });
    } catch (error) {
        console.error('Error in getDashboardStats:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

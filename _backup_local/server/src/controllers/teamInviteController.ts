import { Request, Response } from 'express';
import mongoose from 'mongoose';
import TeamInvite from '../models/TeamInvite';
import Team from '../models/Team';
import User from '../models/User';
import Notification from '../models/Notification';

interface AuthRequest extends Request {
    user?: any;
}

// Send team invite
export const sendInvite = async (req: AuthRequest, res: Response) => {
    const { toUserId } = req.body;

    try {
        // Get sender's team
        const team = await Team.findOne({
            members: req.user._id
        });

        if (!team) {
            return res.status(404).json({ message: 'You are not part of any team' });
        }

        // Verify sender is team leader
        if (team.leaderId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only team leader can send invites' });
        }

        // Check if team is full (max 6 members)
        if (team.members.length >= 6) {
            return res.status(400).json({ message: 'Team is full (maximum 6 members)' });
        }

        // Verify recipient exists and is a student
        const recipient = await User.findById(toUserId);
        if (!recipient) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (recipient.role !== 'student') {
            return res.status(400).json({ message: 'Can only invite students' });
        }

        // Verify recipient is from the same institute
        if (recipient.instituteId !== team.instituteId) {
            return res.status(400).json({ message: 'You cannot invite students from another institute' });
        }

        // Check if recipient already has a team
        if (recipient.teamId) {
            return res.status(400).json({ message: 'User is already in a team' });
        }

        // Check if invite already exists
        const existingInvite = await TeamInvite.findOne({
            toUserId,
            teamId: team._id,
            status: 'pending'
        });

        if (existingInvite) {
            return res.status(400).json({ message: 'Invite already sent to this user' });
        }

        // Create invite
        const invite = new TeamInvite({
            toUserId,
            fromUserId: req.user._id,
            teamId: team._id,
            instituteId: team.instituteId,
            status: 'pending'
        });

        await invite.save();

        // Create notification for recipient
        try {
            await Notification.create({
                title: 'Team Invitation',
                message: `${req.user.name} invited you to join team "${team.name}"`,
                type: 'team_invite',
                recipientType: 'custom',
                recipients: [new mongoose.Types.ObjectId(toUserId)],
                triggeredBy: req.user._id,
                relatedTeamId: team._id,
                relatedInviteId: invite._id
            });
        } catch (notifError) {
            console.error('Failed to create notification:', notifError);
        }

        res.status(201).json(invite);
    } catch (error) {
        console.error('Send invite error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get pending invites for user
export const getPendingInvites = async (req: AuthRequest, res: Response) => {
    try {
        const invites = await TeamInvite.find({
            toUserId: req.user._id,
            status: 'pending',
            instituteId: req.user.instituteId // Only show invites from same institute
        })
            .populate('fromUserId', 'name email')
            .populate('teamId', 'name instituteId')
            .sort({ createdAt: -1 });

        res.json(invites);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get sent invites (for team leader)
export const getSentInvites = async (req: AuthRequest, res: Response) => {
    try {
        const team = await Team.findOne({ leaderId: req.user._id });

        if (!team) {
            return res.json([]);
        }

        const invites = await TeamInvite.find({
            teamId: team._id,
            status: 'pending'
        })
            .populate('toUserId', 'name email')
            .sort({ createdAt: -1 });

        res.json(invites);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Accept invite
export const acceptInvite = async (req: AuthRequest, res: Response) => {
    try {
        const invite = await TeamInvite.findById(req.params.inviteId)
            .populate('teamId')
            .populate('fromUserId', 'name');

        if (!invite) {
            return res.status(404).json({ message: 'Invite not found' });
        }

        // Verify invite is for current user
        if (invite.toUserId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Verify invite is still pending
        if (invite.status !== 'pending') {
            return res.status(400).json({ message: 'Invite is no longer pending' });
        }

        const team = await Team.findById(invite.teamId);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Verify user is from the same institute (double check)
        const user = await User.findById(req.user._id);
        if (user?.instituteId !== team.instituteId) {
            return res.status(400).json({ message: 'You cannot join a team from another institute' });
        }

        // Check if user already has a team
        if (user?.teamId) {
            return res.status(400).json({ message: 'You are already in a team' });
        }

        // Check if team is full
        if (team.members.length >= 6) {
            return res.status(400).json({ message: 'Team is full' });
        }

        // Add user to team
        team.members.push(req.user._id);
        await team.save();

        // Update user's teamId
        await User.findByIdAndUpdate(req.user._id, { teamId: team._id });

        // Update invite status
        invite.status = 'accepted';
        await invite.save();

        // Create notification for team leader
        try {
            await Notification.create({
                title: 'Invite Accepted',
                message: `${req.user.name} accepted your team invitation`,
                type: 'success',
                recipientType: 'custom',
                recipients: [invite.fromUserId._id],
                triggeredBy: req.user._id,
                relatedTeamId: team._id
            });
        } catch (notifError) {
            console.error('Failed to create notification:', notifError);
        }

        res.json({ message: 'Invite accepted', team });
    } catch (error) {
        console.error('Accept invite error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Reject invite
export const rejectInvite = async (req: AuthRequest, res: Response) => {
    try {
        const invite = await TeamInvite.findById(req.params.inviteId)
            .populate('fromUserId', 'name')
            .populate('teamId', 'name');

        if (!invite) {
            return res.status(404).json({ message: 'Invite not found' });
        }

        // Verify invite is for current user
        if (invite.toUserId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Verify invite is still pending
        if (invite.status !== 'pending') {
            return res.status(400).json({ message: 'Invite is no longer pending' });
        }

        // Update invite status
        invite.status = 'rejected';
        await invite.save();

        // Create notification for team leader
        try {
            await Notification.create({
                title: 'Invite Rejected',
                message: `${req.user.name} rejected your team invitation`,
                type: 'warning',
                recipientType: 'custom',
                recipients: [invite.fromUserId._id],
                triggeredBy: req.user._id,
                relatedTeamId: invite.teamId._id
            });
        } catch (notifError) {
            console.error('Failed to create notification:', notifError);
        }

        res.json({ message: 'Invite rejected' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Cancel invite (team leader only)
export const cancelInvite = async (req: AuthRequest, res: Response) => {
    try {
        const invite = await TeamInvite.findById(req.params.inviteId);

        if (!invite) {
            return res.status(404).json({ message: 'Invite not found' });
        }

        // Verify sender is the one who sent the invite
        if (invite.fromUserId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Verify invite is still pending
        if (invite.status !== 'pending') {
            return res.status(400).json({ message: 'Invite is no longer pending' });
        }

        // Delete invite
        await TeamInvite.findByIdAndDelete(req.params.inviteId);

        res.json({ message: 'Invite cancelled' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

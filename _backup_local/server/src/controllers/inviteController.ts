import { Response } from 'express';
import Team from '../models/Team';
import User from '../models/User';
import TeamInvite from '../models/TeamInvite';
import mongoose from 'mongoose';

// Send team invitation
export const sendInvite = async (req: any, res: Response) => {
    try {
        const { teamId, userId } = req.body;
        const senderId = req.user._id;

        // Validate inputs
        if (!teamId || !userId) {
            return res.status(400).json({ message: 'teamId and userId are required' });
        }

        if (!mongoose.Types.ObjectId.isValid(teamId) || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid teamId or userId' });
        }

        // Find team
        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Verify sender is team leader
        if (team.leaderId.toString() !== senderId.toString()) {
            return res.status(403).json({ message: 'Only team leader can send invitations' });
        }

        // Find invitee
        const invitee = await User.findById(userId);
        if (!invitee) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate same institute
        if (team.instituteId !== invitee.instituteId) {
            return res.status(400).json({
                message: 'You can only invite students from the same institute'
            });
        }

        // Check if invitee is already in a team
        if (invitee.teamId) {
            return res.status(400).json({ message: 'User is already in a team' });
        }

        // Check if already invited
        const existingInvite = await TeamInvite.findOne({
            teamId,
            toUserId: userId,
            status: 'pending'
        });

        if (existingInvite) {
            return res.status(400).json({ message: 'User has already been invited' });
        }

        // Check team capacity
        if (team.members.length >= 6) {
            return res.status(400).json({ message: 'Team is full (maximum 6 members)' });
        }

        // Create invitation
        const invite = new TeamInvite({
            teamId,
            fromUserId: senderId,
            toUserId: userId,
            instituteId: team.instituteId,
            status: 'pending'
        });

        await invite.save();

        // Populate for response
        const populatedInvite = await TeamInvite.findById(invite._id)
            .populate('teamId', 'name')
            .populate('fromUserId', 'name email')
            .populate('toUserId', 'name email');

        res.status(201).json({
            message: 'Invitation sent successfully',
            invite: populatedInvite
        });
    } catch (error) {
        console.error('Error in sendInvite:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Accept invitation
export const acceptInvite = async (req: any, res: Response) => {
    try {
        const { inviteId } = req.params;
        const userId = req.user._id;

        // Validate inviteId
        if (!mongoose.Types.ObjectId.isValid(inviteId)) {
            return res.status(400).json({ message: 'Invalid invite ID' });
        }

        // Find invitation
        const invite = await TeamInvite.findById(inviteId).populate('teamId');
        if (!invite) {
            return res.status(404).json({ message: 'Invitation not found' });
        }

        // Verify invitation is for this user
        if (invite.toUserId.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'This invitation is not for you' });
        }

        // Check if already responded
        if (invite.status !== 'pending') {
            return res.status(400).json({ message: 'Invitation has already been responded to' });
        }

        // Check if user is already in a team
        const user = await User.findById(userId);
        if (user?.teamId) {
            return res.status(400).json({ message: 'You are already in a team' });
        }

        // Find team
        const team = await Team.findById(invite.teamId);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Check team capacity
        if (team.members.length >= 6) {
            return res.status(400).json({ message: 'Team is full' });
        }

        // Update invitation
        invite.status = 'accepted';
        invite.respondedAt = new Date();
        await invite.save();

        // Add user to team
        team.members.push(userId);
        await team.save();

        // Update user's teamId
        await User.findByIdAndUpdate(userId, { teamId: team._id });

        // Decline all other pending invitations for this user
        await TeamInvite.updateMany(
            { toUserId: userId, status: 'pending', _id: { $ne: inviteId } },
            { status: 'rejected', respondedAt: new Date() }
        );

        res.json({
            message: 'Invitation accepted successfully',
            team
        });
    } catch (error) {
        console.error('Error in acceptInvite:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Decline invitation
export const declineInvite = async (req: any, res: Response) => {
    try {
        const { inviteId } = req.params;
        const userId = req.user._id;

        // Validate inviteId
        if (!mongoose.Types.ObjectId.isValid(inviteId)) {
            return res.status(400).json({ message: 'Invalid invite ID' });
        }

        // Find invitation
        const invite = await TeamInvite.findById(inviteId);
        if (!invite) {
            return res.status(404).json({ message: 'Invitation not found' });
        }

        // Verify invitation is for this user
        if (invite.toUserId.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'This invitation is not for you' });
        }

        // Check if already responded
        if (invite.status !== 'pending') {
            return res.status(400).json({ message: 'Invitation has already been responded to' });
        }

        // Update invitation
        invite.status = 'rejected';
        invite.respondedAt = new Date();
        await invite.save();

        res.json({
            message: 'Invitation declined successfully'
        });
    } catch (error) {
        console.error('Error in declineInvite:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get my invitations
export const getMyInvites = async (req: any, res: Response) => {
    try {
        const userId = req.user._id;

        const invites = await TeamInvite.find({
            toUserId: userId
        })
            .populate('teamId', 'name instituteId')
            .populate('fromUserId', 'name email')
            .sort({ createdAt: -1 });

        res.json(invites);
    } catch (error) {
        console.error('Error in getMyInvites:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get team invitations (for team leader)
export const getTeamInvites = async (req: any, res: Response) => {
    try {
        const { teamId } = req.params;
        const userId = req.user._id;

        // Validate teamId
        if (!mongoose.Types.ObjectId.isValid(teamId)) {
            return res.status(400).json({ message: 'Invalid team ID' });
        }

        // Find team
        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Verify user is team leader or member
        const isLeader = team.leaderId.toString() === userId.toString();
        const isMember = team.members.some(m => m.toString() === userId.toString());

        if (!isLeader && !isMember) {
            return res.status(403).json({ message: 'You are not authorized to view this team\'s invitations' });
        }

        const invites = await TeamInvite.find({
            teamId
        })
            .populate('toUserId', 'name email')
            .populate('fromUserId', 'name email')
            .sort({ createdAt: -1 });

        res.json(invites);
    } catch (error) {
        console.error('Error in getTeamInvites:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

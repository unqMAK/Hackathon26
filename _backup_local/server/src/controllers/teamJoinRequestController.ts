import { Request, Response } from 'express';
import TeamJoinRequest from '../models/TeamJoinRequest';
import Team from '../models/Team';
import User from '../models/User';
import Notification from '../models/Notification';

interface AuthRequest extends Request {
    user?: any;
}

// Send join request to team
export const sendJoinRequest = async (req: AuthRequest, res: Response) => {
    const { toTeamId } = req.body;

    try {
        // Check if user already has a team
        const user = await User.findById(req.user._id);
        if (user?.teamId) {
            return res.status(400).json({ message: 'You are already in a team' });
        }

        // Verify team exists
        const team = await Team.findById(toTeamId).populate('leaderId', 'name');
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Verify team is from the same institute
        if (req.user.instituteId !== team.instituteId) {
            return res.status(400).json({ message: 'Cross-institute team joining is not allowed' });
        }

        // Check if team is full
        if (team.members.length >= 6) {
            return res.status(400).json({ message: 'Team is full' });
        }

        // Check if request already exists
        const existingRequest = await TeamJoinRequest.findOne({
            toTeamId,
            fromUserId: req.user._id,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({ message: 'Join request already sent to this team' });
        }

        // Create join request
        const joinRequest = new TeamJoinRequest({
            toTeamId,
            fromUserId: req.user._id,
            status: 'pending'
        });

        await joinRequest.save();

        // Create notification for team leader
        try {
            await Notification.create({
                title: 'New Join Request',
                message: `${req.user.name} wants to join your team "${team.name}"`,
                type: 'team',
                recipientType: 'custom',
                recipients: [team.leaderId],
                triggeredBy: req.user._id,
                relatedTeamId: team._id
            });
        } catch (notifError) {
            console.error('Failed to create notification:', notifError);
        }

        res.status(201).json(joinRequest);
    } catch (error) {
        console.error('Send join request error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get pending join requests for team (leader only)
export const getPendingJoinRequests = async (req: AuthRequest, res: Response) => {
    try {
        // Get team where user is leader
        const team = await Team.findOne({ leaderId: req.user._id });

        if (!team) {
            return res.json([]);
        }

        const requests = await TeamJoinRequest.find({
            toTeamId: team._id,
            status: 'pending'
        })
            .populate('fromUserId', 'name email')
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Accept join request (leader only)
export const acceptJoinRequest = async (req: AuthRequest, res: Response) => {
    try {
        const joinRequest = await TeamJoinRequest.findById(req.params.requestId)
            .populate('fromUserId', 'name')
            .populate('toTeamId');

        if (!joinRequest) {
            return res.status(404).json({ message: 'Join request not found' });
        }

        const team = await Team.findById(joinRequest.toTeamId);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Verify requester is team leader
        if (team.leaderId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only team leader can accept join requests' });
        }

        // Verify request is still pending
        if (joinRequest.status !== 'pending') {
            return res.status(400).json({ message: 'Request is no longer pending' });
        }

        // Check if user already has a team
        const user = await User.findById(joinRequest.fromUserId);
        if (user?.teamId) {
            return res.status(400).json({ message: 'User is already in a team' });
        }

        // Verify user is from the same institute
        if (user?.instituteId !== team.instituteId) {
            return res.status(400).json({ message: 'You cannot accept a member from another institute' });
        }

        // Check if team is full
        if (team.members.length >= 6) {
            return res.status(400).json({ message: 'Team is full' });
        }

        // Add user to team
        team.members.push(joinRequest.fromUserId._id);
        await team.save();

        // Update user's teamId
        await User.findByIdAndUpdate(joinRequest.fromUserId._id, { teamId: team._id });

        // Update request status
        joinRequest.status = 'accepted';
        await joinRequest.save();

        // Create notification for student
        try {
            await Notification.create({
                title: 'Join Request Accepted',
                message: `Your request to join team "${team.name}" has been accepted`,
                type: 'success',
                recipientType: 'custom',
                recipients: [joinRequest.fromUserId._id],
                triggeredBy: req.user._id,
                relatedTeamId: team._id
            });
        } catch (notifError) {
            console.error('Failed to create notification:', notifError);
        }

        res.json({ message: 'Join request accepted', team });
    } catch (error) {
        console.error('Accept join request error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Reject join request (leader only)
export const rejectJoinRequest = async (req: AuthRequest, res: Response) => {
    try {
        const joinRequest = await TeamJoinRequest.findById(req.params.requestId)
            .populate('fromUserId', 'name')
            .populate('toTeamId', 'name');

        if (!joinRequest) {
            return res.status(404).json({ message: 'Join request not found' });
        }

        const team = await Team.findById(joinRequest.toTeamId);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Verify requester is team leader
        if (team.leaderId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only team leader can reject join requests' });
        }

        // Verify request is still pending
        if (joinRequest.status !== 'pending') {
            return res.status(400).json({ message: 'Request is no longer pending' });
        }

        // Update request status
        joinRequest.status = 'rejected';
        await joinRequest.save();

        // Create notification for student
        try {
            await Notification.create({
                title: 'Join Request Rejected',
                message: `Your request to join team "${(joinRequest.toTeamId as any).name}" has been rejected`,
                type: 'warning',
                recipientType: 'custom',
                recipients: [joinRequest.fromUserId._id],
                triggeredBy: req.user._id,
                relatedTeamId: team._id
            });
        } catch (notifError) {
            console.error('Failed to create notification:', notifError);
        }

        res.json({ message: 'Join request rejected' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

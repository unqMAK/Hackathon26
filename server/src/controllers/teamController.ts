import { Request, Response } from 'express';
import Team from '../models/Team';
import User from '../models/User';
import mongoose from 'mongoose';
import Notification from '../models/Notification';
import emailService from '../services/emailService';
import Settings from '../models/Settings';

export const getTeams = async (req: Request, res: Response) => {
    try {
        const teams = await Team.find({}).populate('leaderId', 'name email').populate('members', 'name email').populate('mentorId', 'name');
        res.json(teams);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const createTeam = async (req: any, res: Response) => {
    const { name, instituteId } = req.body;

    try {
        // Check if user already has a team
        const existingTeam = await Team.findOne({ members: req.user._id });
        if (existingTeam) {
            return res.status(400).json({ message: 'You are already in a team' });
        }

        const team = new Team({
            name,
            leaderId: req.user._id, // Set creator as leader
            members: [req.user._id], // Add creator to members
            instituteId: req.user.instituteId // Always set from user profile
        });

        const createdTeam = await team.save();

        // Update user with teamId
        await User.findByIdAndUpdate(req.user._id, { teamId: createdTeam._id });

        // NOTIFICATION: Notify SPOCs of the institute
        try {
            await Notification.create({
                title: 'New Team Created',
                message: `Team "${name}" has been created by ${req.user.name}.`,
                type: 'info',
                recipientType: 'spocs',
                instituteId: req.user.instituteId,
                triggeredBy: req.user._id,
                relatedTeamId: createdTeam._id
            });
        } catch (notifError) {
            console.error('Failed to create notification:', notifError);
        }

        res.status(201).json(createdTeam);
    } catch (error) {
        res.status(400).json({ message: 'Invalid team data' });
    }
};

export const updateTeam = async (req: Request, res: Response) => {
    try {
        const team = await Team.findById(req.params.id);

        if (team) {
            team.name = req.body.name || team.name;
            team.status = req.body.status || team.status;
            team.progress = req.body.progress || team.progress;
            team.problemId = req.body.problemId || team.problemId;
            team.mentorId = req.body.mentorId || team.mentorId;

            const updatedTeam = await team.save();
            res.json(updatedTeam);
        } else {
            res.status(404).json({ message: 'Team not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get current user's team
export const getMyTeam = async (req: any, res: Response) => {
    try {
        console.log('=== GET MY TEAM REQUEST ===');
        console.log('User ID:', req.user._id);

        const team = await Team.findOne({ members: req.user._id })
            .populate('leaderId', 'name email')
            .populate('members', 'name email')
            .populate('mentorId', 'name email')
            .populate('problemId', 'title description category difficulty');

        if (!team) {
            console.log('ERROR: User is not part of any team');
            return res.status(404).json({ message: 'You are not part of any team' });
        }

        console.log('Found team:', {
            _id: team._id,
            name: team.name,
            problemId: team.problemId,
            status: team.status
        });
        console.log('=== END GET MY TEAM REQUEST ===');

        res.json(team);
    } catch (error) {
        console.error('ERROR in getMyTeam:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Remove member from team (leader only)
export const removeMember = async (req: any, res: Response) => {
    const { userId } = req.params;

    try {
        const team = await Team.findOne({ members: req.user._id });

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Verify requester is team leader
        if (team.leaderId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only team leader can remove members' });
        }

        // Cannot remove leader
        if (userId === req.user._id.toString()) {
            return res.status(400).json({ message: 'Team leader cannot be removed' });
        }

        console.log(`Removing member ${userId} from team ${team._id}`);

        // Remove member from team using $pull for atomic update
        await Team.updateOne(
            { _id: team._id },
            { $pull: { members: userId } }
        );

        // We don't need to save 'team' since we used updateOne
        // But we should fetch the updated team if we needed to return it, but we don't.

        // Update user's teamId
        await User.findByIdAndUpdate(userId, { $unset: { teamId: 1 } });

        // NOTIFICATION: Notify removed member
        try {
            await Notification.create({
                title: 'Removed from Team',
                message: `You have been removed from team "${team.name}".`,
                type: 'warning',
                recipientType: 'custom',
                recipients: [userId],
                triggeredBy: req.user._id,
                relatedTeamId: team._id
            });
        } catch (notifError) {
            console.error('Failed to create notification:', notifError);
        }

        res.json({ message: 'Member removed from team' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get available teams (teams with less than max capacity)
export const getAvailableTeams = async (req: any, res: Response) => {
    try {
        // Only fetch teams from the same institute
        const teams = await Team.find({
            instituteId: req.user.instituteId
        })
            .populate('leaderId', 'name email')
            .populate('members', 'name email');

        // Filter teams that have less than 6 members
        const availableTeams = teams.filter(team => team.members.length < 6);

        res.json(availableTeams);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getTeamProgress = async (req: Request, res: Response) => {
    try {
        const team = await Team.findById(req.params.id);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Calculate stages based on progress
        // 0-25: Ideation
        // 26-50: Prototyping
        // 51-75: Development
        // 76-100: Final
        const progress = team.progress || 0;

        const stages = {
            ideation: progress >= 25 ? 'Completed' : 'In Progress',
            prototyping: progress >= 50 ? 'Completed' : (progress > 25 ? 'In Progress' : 'Not Started'),
            development: progress >= 75 ? 'Completed' : (progress > 50 ? 'In Progress' : 'Not Started'),
            final: progress === 100 ? 'Completed' : (progress > 75 ? 'In Progress' : 'Not Started')
        };

        res.json({
            overallCompletion: progress,
            stages
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const selectProblem = async (req: any, res: Response) => {
    try {
        console.log('=== SELECT PROBLEM REQUEST ===');
        console.log('Request body:', req.body);
        console.log('User ID:', req.user._id);

        const { problemId } = req.body;

        // Check if problem selection is locked
        const lockSetting = await Settings.findOne({ key: 'problemSelectionLocked' });
        if (lockSetting?.value === true) {
            console.log('ERROR: Problem selection is locked by admin');
            return res.status(403).json({ message: 'Problem selection is currently locked by the administrator. No changes allowed.' });
        }

        // Validate problemId
        if (!problemId) {
            console.log('ERROR: problemId is missing');
            return res.status(400).json({ message: 'problemId is required' });
        }

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(problemId)) {
            console.log('ERROR: Invalid problemId format:', problemId);
            return res.status(400).json({ message: 'Invalid problemId format' });
        }

        console.log('Validated problemId:', problemId);

        // Find the user's team
        const team = await Team.findOne({ members: req.user._id });
        console.log('Found team:', team ? team._id : 'null');

        if (!team) {
            console.log('ERROR: User is not part of any team');
            return res.status(404).json({ message: 'You are not part of any team' });
        }

        // Verify requester is team leader
        if (team.leaderId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only team leader can select a problem' });
        }

        // Verify team is approved
        if (team.status !== 'approved') {
            return res.status(403).json({ message: 'Team must be approved by SPOC to select a problem' });
        }

        console.log('Team BEFORE update:', {
            _id: team._id,
            name: team.name,
            problemId: team.problemId
        });

        // Convert to ObjectId and update the team's problemId
        team.problemId = new mongoose.Types.ObjectId(problemId);

        console.log('Team AFTER setting problemId (before save):', {
            _id: team._id,
            name: team.name,
            problemId: team.problemId,
            problemIdType: typeof team.problemId
        });

        // Save the team
        const savedTeam = await team.save();

        console.log('Team AFTER save:', {
            _id: savedTeam._id,
            name: savedTeam.name,
            problemId: savedTeam.problemId,
            problemIdSaved: !!savedTeam.problemId
        });

        // Return the updated team with populated fields
        const updatedTeam = await Team.findById(team._id)
            .populate('leaderId', 'name email')
            .populate('members', 'name email')
            .populate('mentorId', 'name email')
            .populate('problemId', 'title description category difficulty');

        console.log('Final populated team:', {
            _id: updatedTeam?._id,
            name: updatedTeam?.name,
            problemId: updatedTeam?.problemId,
            problemIdIsObject: typeof updatedTeam?.problemId === 'object'
        });
        console.log('=== END SELECT PROBLEM REQUEST ===');

        // NOTIFICATION: Notify team members
        try {
            const problemTitle = (updatedTeam?.problemId as any)?.title || 'a problem';
            await Notification.create({
                title: 'Problem Selected',
                message: `Your team has selected the problem: ${problemTitle}`,
                type: 'success',
                recipientType: 'custom',
                recipients: team.members,
                triggeredBy: req.user._id,
                relatedTeamId: team._id
            });
        } catch (notifError) {
            console.error('Failed to create notification:', notifError);
        }

        res.json({
            message: 'Problem selected successfully',
            team: updatedTeam
        });
    } catch (error) {
        console.error('ERROR in selectProblem:', error);
        res.status(500).json({
            message: 'Server Error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// Request SPOC approval
export const requestTeamApproval = async (req: any, res: Response) => {
    try {
        const { teamId } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(teamId)) {
            return res.status(400).json({ message: 'Invalid team ID' });
        }

        const team = await Team.findById(teamId);

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Verify requester is team leader
        if (team.leaderId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only team leader can request approval' });
        }

        // Verify team status is pending or rejected
        if (team.status !== 'pending' && team.status !== 'rejected') {
            return res.status(400).json({ message: 'Team must be pending or rejected to request approval' });
        }

        // Verify request not already sent
        if (team.requestSent && team.status === 'pending') {
            return res.status(400).json({ message: 'Approval request already sent' });
        }

        // Update team
        team.requestSent = true;
        team.requestedAt = new Date();
        // Reset status to pending if it was rejected
        if (team.status === 'rejected') {
            team.status = 'pending';
        }

        const updatedTeam = await team.save();

        // NOTIFICATION: Notify SPOCs
        try {
            await Notification.create({
                title: 'Team Approval Request',
                message: `Team "${team.name}" has requested approval.`,
                type: 'info',
                recipientType: 'spocs',
                instituteId: team.instituteId,
                triggeredBy: req.user._id,
                relatedTeamId: team._id
            });
        } catch (notifError) {
            console.error('Failed to create notification:', notifError);
        }

        res.json({
            message: 'Approval request sent successfully',
            team: updatedTeam
        });
    } catch (error) {
        console.error('Error in requestTeamApproval:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

import PendingTeam from '../models/PendingTeam';

// ... (other functions)

// Governance-Based Team Registration (Refactored to Two-Table Architecture)
export const registerTeam = async (req: Request, res: Response) => {
    try {
        const {
            leaderName,
            leaderEmail,
            leaderPhone,
            leaderPassword,
            instituteCode,
            instituteName,
            teamName,
            teamMembers,
            mentorName,
            mentorEmail,
            spocName,
            spocEmail,
            spocDistrict,
            spocState,
            consentFile,
            problemId
        } = req.body;

        // 1. Validations
        // Check Team Name Uniqueness (Main Table & Pending Table)
        const teamInMain = await Team.findOne({ name: teamName });
        const teamInPending = await PendingTeam.findOne({ name: teamName });
        if (teamInMain || teamInPending) {
            return res.status(400).json({ message: 'Team Name already exists (Active or Pending approval)' });
        }

        // Check Leader Email Uniqueness (User Table & Pending Table)
        const userInMain = await User.findOne({ email: leaderEmail });
        const userInPending = await PendingTeam.findOne({ leaderEmail });
        if (userInMain || userInPending) {
            return res.status(400).json({ message: 'Leader email is already registered (Active or Pending approval)' });
        }

        // Check Team Size
        if (!teamMembers || teamMembers.length !== 4) {
            return res.status(400).json({ message: 'Team must have exactly 5 members (Leader + 4 Members)' });
        }

        // Check for duplicate emails within the registration
        const allEmails = [leaderEmail, ...teamMembers.map((m: any) => m.email)];
        const uniqueEmails = new Set(allEmails);
        if (uniqueEmails.size !== 5) {
            return res.status(400).json({ message: 'All team members must have unique emails' });
        }

        // Check if any member email is in Main User Table or already in another Pending Registration
        const existingUsers = await User.find({ email: { $in: allEmails } });
        const usersWithTeam = existingUsers.filter(u => u.teamId);
        if (usersWithTeam.length > 0) {
            return res.status(400).json({
                message: `Members [${usersWithTeam.map(u => u.email).join(', ')}] are already in an active team.`
            });
        }

        const otherPendingWithMembers = await PendingTeam.find({
            $or: [
                { "pendingMembers.email": { $in: allEmails } },
                { "leaderEmail": { $in: allEmails } }
            ]
        });
        if (otherPendingWithMembers.length > 0) {
            return res.status(400).json({ message: 'One or more members are already part of another pending registration.' });
        }

        // 2. Create Pending Team (NO User or Team record yet)
        const pendingTeam = await PendingTeam.create({
            name: teamName,
            leaderName,
            leaderEmail,
            leaderPhone,
            leaderPassword, // This will be hashed by PendingTeam schema's pre-save hook
            instituteCode,
            instituteName,
            mentorName,
            mentorEmail,
            spocName,
            spocEmail,
            spocDistrict,
            spocState,
            consentFile,
            problemId: problemId || undefined,
            pendingMembers: teamMembers,
            status: 'pending'
        });

        // EMAIL: Send registration confirmation to team leader
        try {
            await emailService.sendRegistrationEmail(leaderEmail, leaderName, teamName);
        } catch (emailError) {
            console.error('Failed to send registration email:', emailError);
        }

        res.status(201).json({
            message: 'Team registration staged successfully! Please wait for Admin approval.',
            pendingTeamId: pendingTeam._id
        });
    } catch (error: any) {
        console.error('Registration Staging Error:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

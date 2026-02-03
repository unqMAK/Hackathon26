import { Request, Response } from 'express';
import MentorFeedback from '../models/MentorFeedback';
import Team from '../models/Team';
import mongoose from 'mongoose';

// POST /api/feedback - Submit feedback (Mentor only)
export const submitFeedback = async (req: Request, res: Response) => {
    try {
        const { teamId, phase, status, feedback, attachments } = req.body;
        const mentorId = (req as any).user._id;

        // Validate team exists
        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Check if mentor is assigned to this team
        if (team.mentorId?.toString() !== mentorId.toString()) {
            return res.status(403).json({ message: 'You are not assigned to this team' });
        }

        // Create feedback
        const mentorFeedback = await MentorFeedback.create({
            teamId,
            mentorId,
            phase,
            status,
            feedback,
            attachments: attachments || []
        });

        // Update team's phase status
        if (team.phases) {
            (team.phases as any)[phase] = status;
        } else {
            team.phases = {
                ideation: 'pending',
                prototype: 'pending',
                development: 'pending',
                final: 'pending'
            };
            (team.phases as any)[phase] = status;
        }

        // Calculate progress based on approved phases
        const phases = team.phases;
        let approvedCount = 0;
        if (phases.ideation === 'approved') approvedCount++;
        if (phases.prototype === 'approved') approvedCount++;
        if (phases.development === 'approved') approvedCount++;
        if (phases.final === 'approved') approvedCount++;
        team.progress = Math.round((approvedCount / 4) * 100);

        await team.save();

        const populatedFeedback = await MentorFeedback.findById(mentorFeedback._id)
            .populate('mentorId', 'name email')
            .populate('teamId', 'name');

        return res.status(201).json(populatedFeedback);
    } catch (error: any) {
        console.error('Submit feedback error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// GET /api/feedback/team/:teamId - Get all feedback for a team
export const getTeamFeedback = async (req: Request, res: Response) => {
    try {
        const { teamId } = req.params;
        const userId = (req as any).user._id;
        const userRole = (req as any).user.role;

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Mentors can only see feedback for their assigned teams
        if (userRole === 'mentor' && team.mentorId?.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const feedback = await MentorFeedback.find({ teamId })
            .populate('mentorId', 'name email')
            .sort({ createdAt: -1 });

        return res.json(feedback);
    } catch (error: any) {
        console.error('Get team feedback error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// GET /api/feedback/my - Get all feedback by current mentor
export const getMyFeedback = async (req: Request, res: Response) => {
    try {
        const mentorId = (req as any).user._id;

        const feedback = await MentorFeedback.find({ mentorId })
            .populate('teamId', 'name problemId')
            .sort({ createdAt: -1 });

        return res.json(feedback);
    } catch (error: any) {
        console.error('Get my feedback error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// PUT /api/feedback/:id - Update feedback
export const updateFeedback = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, feedback, attachments } = req.body;
        const mentorId = (req as any).user._id;

        const existingFeedback = await MentorFeedback.findById(id);
        if (!existingFeedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        // Only the mentor who created the feedback can update it
        if (existingFeedback.mentorId.toString() !== mentorId.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (status) existingFeedback.status = status;
        if (feedback) existingFeedback.feedback = feedback;
        if (attachments) existingFeedback.attachments = attachments;

        await existingFeedback.save();

        // Update team's phase status if status changed
        if (status) {
            const team = await Team.findById(existingFeedback.teamId);
            if (team && team.phases) {
                (team.phases as any)[existingFeedback.phase] = status;

                // Recalculate progress
                const phases = team.phases;
                let approvedCount = 0;
                if (phases.ideation === 'approved') approvedCount++;
                if (phases.prototype === 'approved') approvedCount++;
                if (phases.development === 'approved') approvedCount++;
                if (phases.final === 'approved') approvedCount++;
                team.progress = Math.round((approvedCount / 4) * 100);

                await team.save();
            }
        }

        const updatedFeedback = await MentorFeedback.findById(id)
            .populate('mentorId', 'name email');

        return res.json(updatedFeedback);
    } catch (error: any) {
        console.error('Update feedback error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// DELETE /api/feedback/:id - Delete feedback
export const deleteFeedback = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const mentorId = (req as any).user._id;
        const userRole = (req as any).user.role;

        const feedback = await MentorFeedback.findById(id);
        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        // Only the mentor who created it or admin can delete
        if (userRole !== 'admin' && feedback.mentorId.toString() !== mentorId.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await MentorFeedback.findByIdAndDelete(id);

        return res.json({ message: 'Feedback deleted successfully' });
    } catch (error: any) {
        console.error('Delete feedback error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};
// POST /api/feedback/:id/reply - Add reply to feedback
export const addReply = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { message } = req.body;
        const userId = (req as any).user._id;

        const feedback = await MentorFeedback.findById(id);
        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        // Check if user is authorized (mentor of the team or student of the team)
        // We need to fetch the team to check membership
        const team = await Team.findById(feedback.teamId);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        const isMentor = team.mentorId?.toString() === userId.toString();
        const isMember = team.members.some(m => m.toString() === userId.toString());

        if (!isMentor && !isMember) {
            return res.status(403).json({ message: 'Access denied' });
        }

        feedback.replies.push({
            userId,
            message,
            createdAt: new Date()
        });

        await feedback.save();

        const updatedFeedback = await MentorFeedback.findById(id)
            .populate('mentorId', 'name email')
            .populate('replies.userId', 'name email');

        return res.json(updatedFeedback);
    } catch (error: any) {
        console.error('Add reply error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

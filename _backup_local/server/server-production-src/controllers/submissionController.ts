import { Request, Response } from 'express';
import Submission from '../models/Submission';
import Team from '../models/Team';
import Settings from '../models/Settings';
import Notification from '../models/Notification';
import mongoose from 'mongoose';

// Helper: Check if deadline has passed
const isDeadlinePassed = async (): Promise<{ passed: boolean; deadline: Date | null }> => {
    const deadlineSetting = await Settings.findOne({ key: 'submission_deadline' });
    if (!deadlineSetting || !deadlineSetting.value?.isActive) {
        return { passed: false, deadline: null };
    }
    const deadline = new Date(deadlineSetting.value.deadline);
    return { passed: new Date() > deadline, deadline };
};

// Helper: Check if user is team member
const isTeamMember = (team: any, userId: string): boolean => {
    const userIdStr = userId.toString();
    if (team.leaderId.toString() === userIdStr) return true;
    return team.members.some((m: any) => m.toString() === userIdStr);
};

// Helper: Create notification
const createNotification = async (
    recipients: string[],
    title: string,
    message: string,
    type: 'info' | 'warning' | 'success' | 'team' | 'system',
    triggeredBy: string,
    relatedTeamId?: string,
    relatedSubmissionId?: string
) => {
    try {
        await Notification.create({
            title,
            message,
            type,
            recipientType: 'custom',
            recipients,
            triggeredBy,
            relatedTeamId,
            relatedSubmissionId
        });
    } catch (error) {
        console.error('Failed to create notification:', error);
    }
};

// POST /api/submissions - Create new submission (team leader only)
export const createSubmission = async (req: Request, res: Response) => {
    try {
        const { teamId, files, repoUrl, notes } = req.body;
        const userId = (req as any).user._id;

        // Validate team exists
        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Only team leader can submit
        const leaderId = team.leaderId.toString();
        if (leaderId !== userId.toString()) {
            return res.status(403).json({ message: 'Only the team leader can submit projects' });
        }

        if (team.status !== 'approved') {
            return res.status(400).json({ message: 'Team must be approved to submit' });
        }

        // Check deadline
        const { passed, deadline } = await isDeadlinePassed();
        if (passed) {
            return res.status(403).json({
                message: 'Submission deadline has passed',
                deadline
            });
        }

        // Check if previous submission exists and is locked
        const existingSubmission = await Submission.findOne({
            teamId,
            isDeleted: false
        }).sort({ version: -1 });

        if (existingSubmission?.status === 'locked') {
            return res.status(403).json({ message: 'Previous submission is locked and cannot be updated' });
        }

        // Calculate new version
        const newVersion = existingSubmission ? existingSubmission.version + 1 : 1;

        // Validate files array
        const validatedFiles = (files || []).map((f: any) => ({
            url: f.url,
            filename: f.filename || f.url.split('/').pop(),
            size: f.size,
            provider: 'url'
        }));

        // Create submission
        const submission = await Submission.create({
            teamId,
            submittedBy: userId,
            files: validatedFiles,
            repoUrl,
            notes,
            version: newVersion,
            status: existingSubmission ? 'updated' : 'submitted',
            isFinal: false
        });

        // Populate for response
        const populatedSubmission = await Submission.findById(submission._id)
            .populate('teamId', 'name')
            .populate('submittedBy', 'name email');

        // Notify team members
        const memberIds = [team.leaderId, ...team.members]
            .map(id => id.toString())
            .filter(id => id !== userId.toString());

        if (memberIds.length > 0) {
            await createNotification(
                memberIds,
                'Team Submission',
                `A new submission (v${newVersion}) has been made for team "${team.name}"`,
                'team',
                userId,
                teamId,
                submission._id.toString()
            );
        }

        // Notify Mentors, Judges, Admins
        try {
            // Notify Mentors of the institute
            await Notification.create({
                title: 'New Submission',
                message: `Team "${team.name}" has uploaded a new submission (v${newVersion}).`,
                type: 'info',
                recipientType: 'mentors',
                instituteId: team.instituteId,
                triggeredBy: userId,
                relatedTeamId: team._id,
                relatedSubmissionId: submission._id
            });

            // Notify Judges of the institute
            await Notification.create({
                title: 'New Submission',
                message: `Team "${team.name}" has uploaded a new submission (v${newVersion}).`,
                type: 'info',
                recipientType: 'judges',
                instituteId: team.instituteId,
                triggeredBy: userId,
                relatedTeamId: team._id,
                relatedSubmissionId: submission._id
            });
        } catch (error) {
            console.error('Failed to notify mentors/judges:', error);
        }

        return res.status(201).json(populatedSubmission);
    } catch (error: any) {
        console.error('Create submission error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// PUT /api/submissions/:id - Update submission
export const updateSubmission = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { files, repoUrl, notes } = req.body;
        const userId = (req as any).user._id;

        const submission = await Submission.findById(id);
        if (!submission || submission.isDeleted) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        // Check if locked
        if (submission.status === 'locked') {
            return res.status(403).json({ message: 'Submission is locked and cannot be updated' });
        }

        // Only team leader can update
        const team = await Team.findById(submission.teamId);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        const leaderId = team.leaderId.toString();
        if (leaderId !== userId.toString()) {
            return res.status(403).json({ message: 'Only the team leader can update submissions' });
        }

        // Check deadline
        const { passed } = await isDeadlinePassed();
        if (passed) {
            return res.status(403).json({ message: 'Submission deadline has passed' });
        }

        // Create new version instead of updating
        const validatedFiles = (files || submission.files).map((f: any) => ({
            url: f.url,
            filename: f.filename || f.url.split('/').pop(),
            size: f.size,
            provider: f.provider || 'url'
        }));

        const newSubmission = await Submission.create({
            teamId: submission.teamId,
            submittedBy: userId,
            files: validatedFiles,
            repoUrl: repoUrl !== undefined ? repoUrl : submission.repoUrl,
            notes: notes !== undefined ? notes : submission.notes,
            version: submission.version + 1,
            status: 'updated',
            isFinal: false
        });

        const populatedSubmission = await Submission.findById(newSubmission._id)
            .populate('teamId', 'name')
            .populate('submittedBy', 'name email');

        return res.json(populatedSubmission);
    } catch (error: any) {
        console.error('Update submission error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// GET /api/submissions/team/:teamId - Get team submissions
export const getTeamSubmissions = async (req: Request, res: Response) => {
    try {
        const { teamId } = req.params;
        const userId = (req as any).user._id;
        const userRole = (req as any).user.role;

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Check access: team member, admin, judge, or spoc
        const isAdmin = ['admin', 'judge', 'spoc'].includes(userRole);
        if (!isAdmin && !isTeamMember(team, userId)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const submissions = await Submission.find({
            teamId,
            isDeleted: false
        })
            .sort({ version: -1 })
            .populate('submittedBy', 'name email');

        return res.json(submissions);
    } catch (error: any) {
        console.error('Get team submissions error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// GET /api/submissions/:id - Get single submission
export const getSubmissionById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user._id;
        const userRole = (req as any).user.role;

        const submission = await Submission.findById(id)
            .populate('teamId', 'name leaderId members')
            .populate('submittedBy', 'name email');

        if (!submission || submission.isDeleted) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        // Check access
        const team: any = submission.teamId;
        const isAdmin = ['admin', 'judge', 'spoc'].includes(userRole);
        if (!isAdmin && team && !isTeamMember(team, userId)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        return res.json(submission);
    } catch (error: any) {
        console.error('Get submission error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// GET /api/submissions - Get all submissions (admin/judge/spoc)
export const getSubmissions = async (req: Request, res: Response) => {
    try {
        const {
            team,
            status,
            isFinal,
            page = 1,
            limit = 20,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const userRole = (req as any).user.role;
        const userInstituteId = (req as any).user.instituteId;

        const query: any = { isDeleted: false };

        if (team) {
            query.teamId = team;
        }
        if (status) {
            query.status = status;
        }
        if (isFinal !== undefined) {
            query.isFinal = isFinal === 'true';
        }

        const skip = (Number(page) - 1) * Number(limit);
        const sortOptions: any = { [sortBy as string]: sortOrder === 'asc' ? 1 : -1 };

        // For SPOC, filter by their institute
        let submissions;
        let total;

        if (userRole === 'spoc' && userInstituteId) {
            // First get team IDs for this institute
            const instituteTeams = await Team.find({ instituteId: userInstituteId }).select('_id');
            const teamIds = instituteTeams.map(t => t._id);
            query.teamId = { $in: teamIds };
        }

        [submissions, total] = await Promise.all([
            Submission.find(query)
                .sort(sortOptions)
                .skip(skip)
                .limit(Number(limit))
                .populate('teamId', 'name instituteId problemId')
                .populate('submittedBy', 'name email'),
            Submission.countDocuments(query)
        ]);

        return res.json({
            submissions,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error: any) {
        console.error('Get submissions error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// PUT /api/submissions/:id/lock - Lock submission (admin only)
export const lockSubmission = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { isFinal } = req.body;

        const submission = await Submission.findById(id);
        if (!submission || submission.isDeleted) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        submission.status = 'locked';
        if (isFinal !== undefined) {
            submission.isFinal = isFinal;
        }
        await submission.save();

        const populatedSubmission = await Submission.findById(id)
            .populate('teamId', 'name')
            .populate('submittedBy', 'name email');

        return res.json(populatedSubmission);
    } catch (error: any) {
        console.error('Lock submission error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// PUT /api/submissions/:id/score - Score/feedback submission (judge/admin)
export const scoreSubmission = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { score, feedback } = req.body;
        const userId = (req as any).user._id;

        const submission = await Submission.findById(id);
        if (!submission || submission.isDeleted) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        if (score !== undefined) {
            submission.score = score;
        }
        if (feedback !== undefined) {
            submission.feedback = feedback;
        }
        await submission.save();

        // Notify team
        const team = await Team.findById(submission.teamId);
        if (team) {
            const memberIds = [team.leaderId, ...team.members].map(id => id.toString());
            await createNotification(
                memberIds,
                'Submission Feedback',
                `Your submission has received feedback from a judge`,
                'success',
                userId,
                team._id.toString(),
                submission._id.toString()
            );
        }

        return res.json(submission);
    } catch (error: any) {
        console.error('Score submission error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// DELETE /api/submissions/:id - Soft delete (admin only)
export const deleteSubmission = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const submission = await Submission.findById(id);
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        submission.isDeleted = true;
        await submission.save();

        return res.json({ message: 'Submission deleted successfully' });
    } catch (error: any) {
        console.error('Delete submission error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// GET /api/submissions/deadline - Get submission deadline
export const getDeadline = async (req: Request, res: Response) => {
    try {
        let deadlineSetting = await Settings.findOne({ key: 'submission_deadline' });

        if (!deadlineSetting) {
            // Create default deadline (7 days from now)
            const defaultDeadline = new Date();
            defaultDeadline.setDate(defaultDeadline.getDate() + 7);

            deadlineSetting = await Settings.create({
                key: 'submission_deadline',
                value: {
                    deadline: defaultDeadline.toISOString(),
                    isActive: true,
                    title: 'Project Submission Deadline'
                }
            });
        }

        return res.json(deadlineSetting.value);
    } catch (error: any) {
        console.error('Get deadline error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// PUT /api/submissions/deadline - Update deadline (admin only)
export const updateDeadline = async (req: Request, res: Response) => {
    try {
        const { deadline, isActive, title } = req.body;

        const updatedSetting = await Settings.findOneAndUpdate(
            { key: 'submission_deadline' },
            {
                value: {
                    deadline,
                    isActive: isActive !== undefined ? isActive : true,
                    title: title || 'Project Submission Deadline'
                }
            },
            { upsert: true, new: true }
        );

        return res.json(updatedSetting.value);
    } catch (error: any) {
        console.error('Update deadline error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

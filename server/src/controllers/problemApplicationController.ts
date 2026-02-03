import { Request, Response } from 'express';
import ProblemApplication from '../models/ProblemApplication';
import Team from '../models/Team';
import Problem from '../models/Problem';
import Notification from '../models/Notification';
import mongoose from 'mongoose';

// POST /api/problem-applications/apply - Submit application to a problem
export const applyForProblem = async (req: any, res: Response) => {
    try {
        const { problemId, supportingLinks, supportingFiles, comments } = req.body;
        const userId = req.user._id;

        // Validate problemId
        if (!problemId) {
            return res.status(400).json({ message: 'problemId is required' });
        }

        if (!mongoose.Types.ObjectId.isValid(problemId)) {
            return res.status(400).json({ message: 'Invalid problemId format' });
        }

        // Find user's team
        const team = await Team.findOne({ members: userId });
        if (!team) {
            return res.status(404).json({ message: 'You are not part of any team' });
        }

        // Verify requester is team leader
        if (team.leaderId.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Only team leader can apply for problems' });
        }

        // Verify team is approved
        if (team.status !== 'approved') {
            return res.status(403).json({ message: 'Team must be approved by SPOC to apply for problems' });
        }

        // Check if problem exists
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        // Check if already applied for this problem
        const existingApplication = await ProblemApplication.findOne({
            teamId: team._id,
            problemId: problemId
        });

        if (existingApplication) {
            return res.status(400).json({
                message: 'You have already applied for this problem',
                existingStatus: existingApplication.status
            });
        }

        // Create application
        const application = await ProblemApplication.create({
            teamId: team._id,
            problemId: problemId,
            status: 'pending',
            supportingLinks: supportingLinks || [],
            supportingFiles: supportingFiles || [],
            comments: comments || '',
            submittedBy: userId
        });

        // Notify team members
        try {
            await Notification.create({
                title: 'Problem Application Submitted',
                message: `Your team has applied for problem: ${problem.title}`,
                type: 'info',
                recipientType: 'custom',
                recipients: team.members,
                triggeredBy: userId,
                relatedTeamId: team._id
            });
        } catch (notifError) {
            console.error('Failed to create notification:', notifError);
        }

        const populatedApplication = await ProblemApplication.findById(application._id)
            .populate('problemId', 'title description category')
            .populate('submittedBy', 'name email');

        res.status(201).json({
            message: 'Application submitted successfully',
            application: populatedApplication
        });
    } catch (error: any) {
        console.error('Error in applyForProblem:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// GET /api/problem-applications/my-applications - Get team's applications
export const getMyApplications = async (req: any, res: Response) => {
    try {
        const userId = req.user._id;

        // Find user's team
        const team = await Team.findOne({ members: userId });
        if (!team) {
            return res.status(404).json({ message: 'You are not part of any team' });
        }

        const applications = await ProblemApplication.find({ teamId: team._id })
            .populate('problemId', 'title description category difficulty tags')
            .populate('submittedBy', 'name email')
            .populate('reviewedBy', 'name email')
            .sort({ createdAt: -1 });

        res.json(applications);
    } catch (error: any) {
        console.error('Error in getMyApplications:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// GET /api/problem-applications/admin - Admin: Get all applications
export const getAdminApplications = async (req: any, res: Response) => {
    try {
        const { status, problemId } = req.query;

        let query: any = {};
        if (status && status !== 'all') {
            query.status = status;
        }
        if (problemId) {
            query.problemId = problemId;
        }

        const applications = await ProblemApplication.find(query)
            .populate('teamId', 'name instituteCode instituteName leaderId members')
            .populate('problemId', 'title description category difficulty')
            .populate('submittedBy', 'name email')
            .populate('reviewedBy', 'name email')
            .sort({ createdAt: -1 });

        // Also populate team leader info
        const populatedApplications = await Promise.all(
            applications.map(async (app) => {
                const appObj = app.toObject();
                if (appObj.teamId && (appObj.teamId as any).leaderId) {
                    const leader = await mongoose.model('User').findById((appObj.teamId as any).leaderId).select('name email');
                    (appObj.teamId as any).leader = leader;
                }
                return appObj;
            })
        );

        res.json(populatedApplications);
    } catch (error: any) {
        console.error('Error in getAdminApplications:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// PUT /api/problem-applications/:id/approve - Admin: Approve application
export const approveApplication = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const { reviewNote } = req.body;
        const adminId = req.user._id;

        const application = await ProblemApplication.findById(id);
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        if (application.status !== 'pending') {
            return res.status(400).json({ message: `Application is already ${application.status}` });
        }

        // Update application status
        application.status = 'approved';
        application.reviewedBy = adminId;
        application.reviewNote = reviewNote || '';
        application.reviewedAt = new Date();
        await application.save();

        // Update team's problemId (shortlist them)
        const team = await Team.findById(application.teamId);
        if (team) {
            team.problemId = application.problemId;
            await team.save();

            // Notify team
            const problem = await Problem.findById(application.problemId);
            try {
                await Notification.create({
                    title: 'Application Approved! 🎉',
                    message: `Congratulations! Your application for "${problem?.title}" has been approved. You are now shortlisted for this problem.`,
                    type: 'success',
                    recipientType: 'custom',
                    recipients: team.members,
                    triggeredBy: adminId,
                    relatedTeamId: team._id
                });
            } catch (notifError) {
                console.error('Failed to create notification:', notifError);
            }
        }

        const populatedApplication = await ProblemApplication.findById(application._id)
            .populate('teamId', 'name instituteCode instituteName')
            .populate('problemId', 'title description category')
            .populate('reviewedBy', 'name email');

        res.json({
            message: 'Application approved successfully',
            application: populatedApplication
        });
    } catch (error: any) {
        console.error('Error in approveApplication:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// PUT /api/problem-applications/:id/reject - Admin: Reject application
export const rejectApplication = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const { reviewNote } = req.body;
        const adminId = req.user._id;

        const application = await ProblemApplication.findById(id);
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        if (application.status !== 'pending') {
            return res.status(400).json({ message: `Application is already ${application.status}` });
        }

        // Update application status
        application.status = 'rejected';
        application.reviewedBy = adminId;
        application.reviewNote = reviewNote || '';
        application.reviewedAt = new Date();
        await application.save();

        // Notify team
        const team = await Team.findById(application.teamId);
        const problem = await Problem.findById(application.problemId);
        if (team) {
            try {
                await Notification.create({
                    title: 'Application Update',
                    message: `Your application for "${problem?.title}" was not approved.${reviewNote ? ` Feedback: ${reviewNote}` : ''}`,
                    type: 'warning',
                    recipientType: 'custom',
                    recipients: team.members,
                    triggeredBy: adminId,
                    relatedTeamId: team._id
                });
            } catch (notifError) {
                console.error('Failed to create notification:', notifError);
            }
        }

        const populatedApplication = await ProblemApplication.findById(application._id)
            .populate('teamId', 'name instituteCode instituteName')
            .populate('problemId', 'title description category')
            .populate('reviewedBy', 'name email');

        res.json({
            message: 'Application rejected',
            application: populatedApplication
        });
    } catch (error: any) {
        console.error('Error in rejectApplication:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// GET /api/problem-applications/stats - Get application statistics
export const getApplicationStats = async (req: any, res: Response) => {
    try {
        const stats = await ProblemApplication.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const result = {
            total: 0,
            pending: 0,
            approved: 0,
            rejected: 0
        };

        stats.forEach(stat => {
            result[stat._id as keyof typeof result] = stat.count;
            result.total += stat.count;
        });

        res.json(result);
    } catch (error: any) {
        console.error('Error in getApplicationStats:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// DELETE /api/problem-applications/:id - Withdraw application (only if pending)
export const withdrawApplication = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const application = await ProblemApplication.findById(id);
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Find user's team
        const team = await Team.findOne({ members: userId });
        if (!team || team._id.toString() !== application.teamId.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Only team leader can withdraw
        if (team.leaderId.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Only team leader can withdraw applications' });
        }

        // Can only withdraw pending applications
        if (application.status !== 'pending') {
            return res.status(400).json({ message: 'Can only withdraw pending applications' });
        }

        await ProblemApplication.findByIdAndDelete(id);

        res.json({ message: 'Application withdrawn successfully' });
    } catch (error: any) {
        console.error('Error in withdrawApplication:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

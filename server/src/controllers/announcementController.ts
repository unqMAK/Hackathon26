import { Request, Response } from 'express';
import Announcement from '../models/Announcement';
import AnnouncementRead from '../models/AnnouncementRead';
import User from '../models/User';
import Team from '../models/Team';
import mongoose from 'mongoose';
import Notification from '../models/Notification';

// Helper: Get target users based on audience
const getTargetUsers = async (
    audience: string,
    targetInstituteId?: string,
    targetTeamId?: string
): Promise<mongoose.Types.ObjectId[]> => {
    let query: any = { role: 'student' };

    if (audience === 'institute' && targetInstituteId) {
        query.instituteId = targetInstituteId;
    } else if (audience === 'team' && targetTeamId) {
        query.teamId = new mongoose.Types.ObjectId(targetTeamId);
    }
    // For 'all', we get all students

    const users = await User.find(query).select('_id');
    return users.map(u => u._id);
};

// POST /api/announcements - Create announcement (Admin, SPOC)
export const createAnnouncement = async (req: Request, res: Response) => {
    try {
        const { title, message, type, audience, targetInstituteId, targetTeamId, displayLocation } = req.body;
        const userId = (req as any).user._id;
        const userRole = (req as any).user.role;
        const userInstituteId = (req as any).user.instituteId;

        // Validation
        if (!title || !message) {
            return res.status(400).json({ message: 'Title and message are required' });
        }

        // SPOC can only send to their own institute or teams
        let finalTargetInstituteId = targetInstituteId;
        if (userRole === 'spoc') {
            if (audience === 'all') {
                return res.status(403).json({
                    message: 'SPOCs can only send announcements to their own institute or teams'
                });
            }
            if (audience === 'institute') {
                finalTargetInstituteId = userInstituteId;
            }
            if (audience === 'team' && targetTeamId) {
                // Verify team belongs to SPOC's institute
                const team = await Team.findById(targetTeamId);
                if (!team || team.instituteId !== userInstituteId) {
                    return res.status(403).json({
                        message: 'You can only send announcements to teams in your institute'
                    });
                }
            }
        }

        // Create announcement
        const announcement = await Announcement.create({
            title,
            message,
            type: type || 'general',
            audience: audience || 'all',
            displayLocation: displayLocation || 'both',
            targetInstituteId: finalTargetInstituteId,
            targetTeamId: targetTeamId || null,
            createdBy: userId
        });

        // Get target users and create read records
        const targetUsers = await getTargetUsers(
            audience || 'all',
            finalTargetInstituteId,
            targetTeamId
        );

        // Create AnnouncementRead records for all target users
        if (targetUsers.length > 0) {
            const readRecords = targetUsers.map(userId => ({
                announcementId: announcement._id,
                userId,
                isRead: false
            }));

            await AnnouncementRead.insertMany(readRecords, { ordered: false }).catch(() => {
                // Ignore duplicate key errors
            });
        }

        const populatedAnnouncement = await Announcement.findById(announcement._id)
            .populate('createdBy', 'name email');

        // NOTIFICATION: Create a unified notification
        try {
            let notifRecipientType: any = 'students'; // Default for 'all'
            let notifRecipients: any[] = [];
            let notifInstituteId = undefined;

            if (audience === 'institute') {
                notifRecipientType = 'custom';
                notifInstituteId = finalTargetInstituteId;
            } else if (audience === 'team') {
                notifRecipientType = 'custom';
                notifRecipients = targetUsers; // targetUsers are team members
            }

            await Notification.create({
                title: `New Announcement: ${title}`,
                message: message.substring(0, 100) + (message.length > 100 ? '...' : ''), // Truncate message
                type: 'info',
                recipientType: notifRecipientType,
                recipients: notifRecipients.length > 0 ? notifRecipients : undefined,
                instituteId: notifInstituteId,
                triggeredBy: userId,
                relatedAnnouncementId: announcement._id
            });
        } catch (notifError) {
            console.error('Failed to create notification:', notifError);
        }

        return res.status(201).json(populatedAnnouncement);
    } catch (error: any) {
        console.error('Create announcement error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// PUT /api/announcements/:id - Update announcement (Admin, SPOC)
export const updateAnnouncement = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, message, type } = req.body;
        const userId = (req as any).user._id;
        const userRole = (req as any).user.role;

        const announcement = await Announcement.findById(id);
        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        // SPOC can only edit their own announcements
        if (userRole === 'spoc' && announcement.createdBy.toString() !== userId.toString()) {
            return res.status(403).json({
                message: 'You can only edit your own announcements'
            });
        }

        // Update fields
        if (title) announcement.title = title;
        if (message) announcement.message = message;
        if (type) announcement.type = type;

        await announcement.save();

        const populatedAnnouncement = await Announcement.findById(announcement._id)
            .populate('createdBy', 'name email');

        return res.json(populatedAnnouncement);
    } catch (error: any) {
        console.error('Update announcement error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// DELETE /api/announcements/:id - Delete announcement (Admin, SPOC)
export const deleteAnnouncement = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user._id;
        const userRole = (req as any).user.role;

        const announcement = await Announcement.findById(id);
        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        // SPOC can only delete their own announcements
        if (userRole === 'spoc' && announcement.createdBy.toString() !== userId.toString()) {
            return res.status(403).json({
                message: 'You can only delete your own announcements'
            });
        }

        // Delete all read records for this announcement
        await AnnouncementRead.deleteMany({ announcementId: id });

        // Delete the announcement
        await Announcement.findByIdAndDelete(id);

        return res.json({ message: 'Announcement deleted successfully' });
    } catch (error: any) {
        console.error('Delete announcement error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// GET /api/announcements - Get announcements (based on role and audience)
export const getAnnouncements = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const userRole = (req as any).user.role;
        const userInstituteId = (req as any).user.instituteId;
        const userTeamId = (req as any).user.teamId;

        let query: any = {};

        if (userRole === 'admin') {
            // Admin sees all announcements
        } else if (userRole === 'spoc') {
            // SPOC sees their own announcements + all announcements targeting their institute
            query.$or = [
                { createdBy: userId },
                { audience: 'all' },
                { audience: 'institute', targetInstituteId: userInstituteId }
            ];
        } else {
            // Students see announcements meant for them
            query.$or = [
                { audience: 'all' }
            ];
            if (userInstituteId) {
                query.$or.push({ audience: 'institute', targetInstituteId: userInstituteId });
            }
            if (userTeamId) {
                query.$or.push({ audience: 'team', targetTeamId: userTeamId });
            }
        }
        // For students, filter announcements that should appear on dashboard
        if (userRole === 'student') {
            query.displayLocation = { $in: ['dashboard', 'both'] };
        }

        const announcements = await Announcement.find(query)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        // For students, get read status
        if (userRole === 'student') {
            const readStatuses = await AnnouncementRead.find({
                userId,
                announcementId: { $in: announcements.map(a => a._id) }
            });

            const readMap = new Map(
                readStatuses.map(r => [r.announcementId.toString(), r.isRead])
            );

            const announcementsWithStatus = announcements.map(a => ({
                ...a.toObject(),
                isRead: readMap.get(a._id.toString()) || false,
                createdByName: (a.createdBy as any)?.name || 'Unknown'
            }));

            return res.json(announcementsWithStatus);
        }

        // For admin/spoc, just return announcements
        const formatted = announcements.map(a => ({
            ...a.toObject(),
            createdByName: (a.createdBy as any)?.name || 'Unknown'
        }));

        return res.json(formatted);
    } catch (error: any) {
        console.error('Get announcements error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// GET /api/announcements/unread-count - Get unread count for current user
export const getUnreadCount = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;

        const count = await AnnouncementRead.countDocuments({
            userId,
            isRead: false
        });

        return res.json({ unreadCount: count });
    } catch (error: any) {
        console.error('Get unread count error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// PUT /api/announcements/:id/read - Mark announcement as read
export const markAsRead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user._id;

        const readRecord = await AnnouncementRead.findOneAndUpdate(
            { announcementId: id, userId },
            { isRead: true, readAt: new Date() },
            { upsert: true, new: true }
        );

        return res.json(readRecord);
    } catch (error: any) {
        console.error('Mark as read error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// PUT /api/announcements/read-all - Mark all announcements as read
export const markAllAsRead = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;

        await AnnouncementRead.updateMany(
            { userId, isRead: false },
            { isRead: true, readAt: new Date() }
        );

        return res.json({ message: 'All announcements marked as read' });
    } catch (error: any) {
        console.error('Mark all as read error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// GET /api/announcements/admin - Get all announcements for admin management
export const getAdminAnnouncements = async (req: Request, res: Response) => {
    try {
        const userRole = (req as any).user.role;
        const userId = (req as any).user._id;
        const userInstituteId = (req as any).user.instituteId;

        let query: any = {};

        if (userRole === 'spoc') {
            // SPOC only sees announcements they created or that target their institute
            query.$or = [
                { createdBy: userId },
                { targetInstituteId: userInstituteId }
            ];
        }

        const announcements = await Announcement.find(query)
            .populate('createdBy', 'name email')
            .populate('targetTeamId', 'name')
            .sort({ createdAt: -1 });

        const formatted = announcements.map(a => ({
            ...a.toObject(),
            createdByName: (a.createdBy as any)?.name || 'Unknown',
            targetTeamName: (a.targetTeamId as any)?.name || null
        }));

        return res.json(formatted);
    } catch (error: any) {
        console.error('Get admin announcements error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// GET /api/announcements/public - Get public announcements for home page ticker (no auth required)
export const getPublicAnnouncements = async (req: Request, res: Response) => {
    try {
        // Only get announcements meant for all users (public) AND meant for home page display
        // Also include legacy announcements that don't have displayLocation set (treat as 'both')
        const announcements = await Announcement.find({
            audience: 'all',
            $or: [
                { displayLocation: { $in: ['home', 'both'] } },
                { displayLocation: { $exists: false } },
                { displayLocation: null }
            ]
        })
            .select('title message type createdAt displayLocation')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        return res.json(announcements);
    } catch (error: any) {
        console.error('Get public announcements error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

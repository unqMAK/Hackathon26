import { Request, Response } from 'express';
import Notification from '../models/Notification';
import User from '../models/User';

// 1. Create Notification (Admin/SPOC)
export const createNotification = async (req: Request, res: Response) => {
    try {
        const { title, message, type, recipientType, recipients, instituteId } = req.body;
        const triggeredBy = (req as any).user._id;

        const notification = await Notification.create({
            title,
            message,
            type,
            recipientType,
            recipients,
            instituteId,
            triggeredBy
        });

        res.status(201).json(notification);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Get User Notifications
export const getUserNotifications = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const userId = user._id;
        const userRole = user.role;
        const userInstituteId = user.instituteId; // Assuming user has instituteId

        // Build query to find relevant notifications
        const query: any = {
            isActive: true,
            $or: [
                { recipientType: 'all' }, // Everyone
                { recipientType: `${userRole}s` }, // Role-based (e.g., 'students')
                { recipients: userId }, // Direct recipient
                {
                    recipientType: 'custom',
                    instituteId: userInstituteId // Institute-based
                }
            ]
        };

        // If user is SPOC, they might see 'spocs' type
        if (userRole === 'spoc') {
            query.$or.push({ recipientType: 'spocs' });
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(50); // Limit to last 50 notifications

        // Add 'isRead' flag for the current user
        const formattedNotifications = notifications.map(notif => {
            const obj = notif.toObject();
            return {
                ...obj,
                isRead: notif.isReadBy.some(id => id.toString() === userId.toString()),
                relatedId: obj.relatedInviteId || obj.relatedJoinRequestId || obj.relatedTeamId || obj.relatedSubmissionId || obj.relatedAnnouncementId
            };
        });

        res.json(formattedNotifications);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Get Unread Count
export const getUnreadCount = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const userId = user._id;
        const userRole = user.role;
        const userInstituteId = user.instituteId;

        const query: any = {
            isActive: true,
            isReadBy: { $ne: userId }, // Not read by user
            $or: [
                { recipientType: 'all' },
                { recipientType: `${userRole}s` },
                { recipients: userId },
                {
                    recipientType: 'custom',
                    instituteId: userInstituteId
                }
            ]
        };

        if (userRole === 'spoc') {
            query.$or.push({ recipientType: 'spocs' });
        }

        const count = await Notification.countDocuments(query);
        res.json({ count });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// 4. Mark Single Notification as Read
export const markNotificationRead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user._id;

        const notification = await Notification.findByIdAndUpdate(
            id,
            { $addToSet: { isReadBy: userId } }, // Add to set to avoid duplicates
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json(notification);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// 5. Mark All as Read
export const markAllRead = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const userId = user._id;
        const userRole = user.role;
        const userInstituteId = user.instituteId;

        // Find all unread notifications for this user
        const query: any = {
            isActive: true,
            isReadBy: { $ne: userId },
            $or: [
                { recipientType: 'all' },
                { recipientType: `${userRole}s` },
                { recipients: userId },
                {
                    recipientType: 'custom',
                    instituteId: userInstituteId
                }
            ]
        };

        if (userRole === 'spoc') {
            query.$or.push({ recipientType: 'spocs' });
        }

        await Notification.updateMany(
            query,
            { $addToSet: { isReadBy: userId } }
        );

        res.json({ message: 'All notifications marked as read' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// 6. Soft Delete Notification (Admin/SPOC)
export const softDeleteNotification = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification deleted' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

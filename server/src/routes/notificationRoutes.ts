import express from 'express';
import {
    createNotification,
    getUserNotifications,
    getUnreadCount,
    markNotificationRead,
    markAllRead,
    softDeleteNotification
} from '../controllers/notificationController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// Get all notifications for the logged-in user
router.get('/', protect, getUserNotifications);

// Get unread count
router.get('/unread-count', protect, getUnreadCount);

// Create a new notification (Admin/SPOC only)
router.post('/', protect, authorize('admin', 'spoc'), createNotification);

// Mark all as read
router.put('/read-all', protect, markAllRead);

// Mark single notification as read
router.put('/:id/read', protect, markNotificationRead);

// Soft delete notification (Admin/SPOC only)
router.delete('/:id', protect, authorize('admin', 'spoc'), softDeleteNotification);

export default router;

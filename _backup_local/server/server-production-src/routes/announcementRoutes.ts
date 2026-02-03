import express from 'express';
import {
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    getAnnouncements,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    getAdminAnnouncements
} from '../controllers/announcementController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Student/User routes
router.get('/', getAnnouncements);
router.get('/unread-count', getUnreadCount);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);

// Admin/SPOC management routes
router.get('/admin', authorize('admin', 'spoc'), getAdminAnnouncements);
router.post('/', authorize('admin', 'spoc'), createAnnouncement);
router.put('/:id', authorize('admin', 'spoc'), updateAnnouncement);
router.delete('/:id', authorize('admin', 'spoc'), deleteAnnouncement);

export default router;

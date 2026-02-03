import express from 'express';
import {
    getEvents,
    createEvent,
    updateEvent,
    deleteEvent,
} from '../controllers/timelineController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').get(getEvents).post(protect, authorize('admin'), createEvent);
router
    .route('/:id')
    .put(protect, authorize('admin'), updateEvent)
    .delete(protect, authorize('admin'), deleteEvent);

export default router;

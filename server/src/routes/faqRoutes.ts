import express from 'express';
import { getAllFAQs, getAllFAQsAdmin, createFAQ, updateFAQ, deleteFAQ } from '../controllers/faqController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// Public route
router.get('/', getAllFAQs);

// Admin routes
router.get('/admin', protect, authorize('admin'), getAllFAQsAdmin);
router.post('/', protect, authorize('admin'), createFAQ);
router.put('/:id', protect, authorize('admin'), updateFAQ);
router.delete('/:id', protect, authorize('admin'), deleteFAQ);

export default router;

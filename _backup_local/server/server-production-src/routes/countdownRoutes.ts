import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/roleMiddleware';
import { getCountdown, updateCountdown, disableCountdown } from '../controllers/countdownController';

const router = express.Router();

// Public route
router.get('/', getCountdown);

// Protected routes (Admin only)
router.put('/', protect, requireAdmin, updateCountdown);
router.put('/disable', protect, requireAdmin, disableCountdown);

export default router;

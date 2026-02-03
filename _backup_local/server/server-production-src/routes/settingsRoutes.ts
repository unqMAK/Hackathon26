import express from 'express';
import { getDeadline, updateDeadline } from '../controllers/settingsController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/deadline', protect, getDeadline);
router.put('/deadline', protect, authorize('admin'), updateDeadline);

export default router;

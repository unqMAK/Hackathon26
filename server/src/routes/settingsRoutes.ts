import express from 'express';
import { getDeadline, updateDeadline, getProblemLockStatus } from '../controllers/settingsController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/deadline', protect, getDeadline);
router.put('/deadline', protect, authorize('admin'), updateDeadline);
router.get('/problem-lock', protect, getProblemLockStatus);

export default router;

import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware';
import {
    getSelectionWindowStatus,
    toggleSelectionWindow,
    selectProblem,
    getMySelection,
    getAllSelections
} from '../controllers/problemSelectionController';

const router = express.Router();

// Public route - check if selection window is open
router.get('/status', getSelectionWindowStatus);

// Student routes (requires auth)
router.get('/my-selection', protect, getMySelection);
router.put('/select', protect, selectProblem);

// Admin routes
router.post('/toggle-window', protect, authorize('admin'), toggleSelectionWindow);
router.get('/all', protect, authorize('admin'), getAllSelections);

export default router;

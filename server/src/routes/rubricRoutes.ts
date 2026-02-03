import express from 'express';
import {
    getRubrics,
    createRubric,
    updateRubric,
    deleteRubric,
    reorderRubrics,
    validateWeights
} from '../controllers/rubricController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// Public route - get active rubrics
router.get('/', protect, getRubrics);

// Admin routes
router.post('/', protect, authorize('admin'), createRubric);
router.put('/reorder', protect, authorize('admin'), reorderRubrics);
router.get('/validate-weights', protect, authorize('admin'), validateWeights);
router.put('/:id', protect, authorize('admin'), updateRubric);
router.delete('/:id', protect, authorize('admin'), deleteRubric);

export default router;

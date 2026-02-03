import express from 'express';
import { getProblems, createProblem, getProblemById } from '../controllers/problemController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', getProblems);
router.get('/:id', getProblemById);
router.post('/', protect, authorize('admin'), createProblem);

export default router;

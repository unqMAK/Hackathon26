import express from 'express';
import { getUsers, deleteUser, searchAvailableStudents } from '../controllers/userController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect, authorize('admin', 'spoc'), getUsers);
router.get('/search-available', protect, searchAvailableStudents);
router.delete('/:id', protect, authorize('admin'), deleteUser);

export default router;

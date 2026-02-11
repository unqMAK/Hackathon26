import express from 'express';
import { getPublicVideos, getAllVideosAdmin, createVideo, updateVideo, deleteVideo } from '../controllers/videoController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// Public
router.get('/', getPublicVideos);

// Admin protected
router.get('/admin', protect, authorize('admin'), getAllVideosAdmin);
router.post('/', protect, authorize('admin'), createVideo);
router.put('/:id', protect, authorize('admin'), updateVideo);
router.delete('/:id', protect, authorize('admin'), deleteVideo);

export default router;

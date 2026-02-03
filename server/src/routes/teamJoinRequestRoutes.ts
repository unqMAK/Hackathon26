import express from 'express';
import {
    sendJoinRequest,
    getPendingJoinRequests,
    acceptJoinRequest,
    rejectJoinRequest
} from '../controllers/teamJoinRequestController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/send', protect, sendJoinRequest);
router.get('/pending', protect, getPendingJoinRequests);
router.post('/accept/:requestId', protect, acceptJoinRequest);
router.post('/reject/:requestId', protect, rejectJoinRequest);

export default router;

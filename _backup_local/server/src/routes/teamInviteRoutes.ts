import express from 'express';
import {
    sendInvite,
    getPendingInvites,
    getSentInvites,
    acceptInvite,
    rejectInvite,
    cancelInvite
} from '../controllers/teamInviteController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/send', protect, sendInvite);
router.get('/pending', protect, getPendingInvites);
router.get('/sent', protect, getSentInvites);
router.post('/accept/:inviteId', protect, acceptInvite);
router.post('/reject/:inviteId', protect, rejectInvite);
router.delete('/cancel/:inviteId', protect, cancelInvite);

export default router;

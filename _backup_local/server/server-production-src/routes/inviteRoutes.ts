import express from 'express';
import {
    sendInvite,
    acceptInvite,
    declineInvite,
    getMyInvites,
    getTeamInvites
} from '../controllers/inviteController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Send invitation (team leader only - validated in controller)
router.post('/send', sendInvite);

// Accept/decline invitations
router.put('/:inviteId/accept', acceptInvite);
router.put('/:inviteId/decline', declineInvite);

// Get invitations
router.get('/my-invites', getMyInvites);
router.get('/team/:teamId', getTeamInvites);

export default router;

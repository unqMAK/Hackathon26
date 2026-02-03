import express from 'express';
import { registerUser, loginUser, getMe, requestPasswordReset } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.post('/request-password-reset', requestPasswordReset);

export default router;

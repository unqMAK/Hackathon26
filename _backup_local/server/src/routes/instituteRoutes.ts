import express from 'express';
import { validateInstituteCode, createInstitute, getInstitutes } from '../controllers/instituteController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/validate/:code', validateInstituteCode);
router.post('/', createInstitute);
router.get('/', protect, authorize('admin'), getInstitutes);

export default router;

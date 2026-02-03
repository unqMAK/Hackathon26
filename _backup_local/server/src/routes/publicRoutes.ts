import express from 'express';
import { getPublicSpocs, getInstituteGovernance } from '../controllers/publicController';
import { upload, uploadConsent } from '../controllers/uploadController';

const router = express.Router();

router.get('/spocs', getPublicSpocs);
router.get('/institute-lookup/:code', getInstituteGovernance);
router.post('/upload-consent', upload.single('consentFile'), uploadConsent);

export default router;

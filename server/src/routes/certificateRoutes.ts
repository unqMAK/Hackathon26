import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware';
import {
    getCertificateConfig,
    updateCertificateConfig,
    generateCertificates,
    getMyCertificates,
    downloadCertificate
} from '../controllers/certificateController';

const router = express.Router();

// Public Config (for preview or general info)
router.get('/config', getCertificateConfig);

// Admin Config Management
router.put('/config', protect, authorize('admin'), updateCertificateConfig);

// Admin Bulk Generation
router.post('/generate', protect, authorize('admin'), generateCertificates);

// User Certificates
router.get('/my', protect, getMyCertificates);

// Download Certificate
router.get('/:id/download', protect, downloadCertificate);

export default router;

import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { protect, authorize } from '../middleware/authMiddleware';
import {
    submitIdea,
    getMySubmission,
    getAllSubmissions,
    getSubmissionStats,
    reviewSubmission,
    downloadDocument,
    allowResubmission,
    toggleSubmissionWindow,
    getSubmissionWindowStatus
} from '../controllers/ideaSubmissionController';

const router = express.Router();

// Multer config — accept only .doc/.docx, max 10MB
const uploadDir = path.join(__dirname, '../../uploads/ideas');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedExts = ['.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExts.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Only .doc and .docx files are allowed'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Student routes
router.post('/', protect, upload.single('document'), submitIdea);
router.get('/my', protect, getMySubmission);

// Admin routes
router.get('/admin', protect, authorize('admin'), getAllSubmissions);
router.get('/admin/stats', protect, authorize('admin'), getSubmissionStats);
router.put('/admin/:id/review', protect, authorize('admin'), reviewSubmission);
router.get('/admin/:id/download', protect, authorize('admin'), downloadDocument);
router.delete('/admin/:id/allow-resubmission', protect, authorize('admin'), allowResubmission);
router.post('/admin/toggle-submission', protect, authorize('admin'), toggleSubmissionWindow);
router.get('/submission-status', getSubmissionWindowStatus);

export default router;

import express from 'express';
import { submitContactForm } from '../controllers/contactController';

const router = express.Router();

// POST /api/contact - Submit contact form (public route)
router.post('/', submitContactForm);

export default router;

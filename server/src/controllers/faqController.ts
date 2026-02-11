import { Request, Response } from 'express';
import FAQ from '../models/FAQ';

// GET /api/faqs - Public: Get all active FAQs grouped by section
export const getAllFAQs = async (req: Request, res: Response) => {
    try {
        const faqs = await FAQ.find({ isActive: true }).sort({ section: 1, order: 1 });

        // Group by section
        const grouped: { [key: string]: any[] } = {};
        faqs.forEach(faq => {
            if (!grouped[faq.section]) {
                grouped[faq.section] = [];
            }
            grouped[faq.section].push(faq);
        });

        res.json({ faqs, grouped });
    } catch (error: any) {
        console.error('Error fetching FAQs:', error);
        res.status(500).json({ message: 'Failed to fetch FAQs' });
    }
};

// GET /api/faqs/admin - Admin: Get ALL FAQs (including inactive)
export const getAllFAQsAdmin = async (req: Request, res: Response) => {
    try {
        const faqs = await FAQ.find().sort({ section: 1, order: 1 });
        const sections = [...new Set(faqs.map(f => f.section))];
        res.json({ faqs, sections });
    } catch (error: any) {
        console.error('Error fetching admin FAQs:', error);
        res.status(500).json({ message: 'Failed to fetch FAQs' });
    }
};

// POST /api/faqs - Admin: Create a new FAQ
export const createFAQ = async (req: Request, res: Response) => {
    try {
        const { question, answer, section, order, isActive } = req.body;

        if (!question || !answer) {
            return res.status(400).json({ message: 'Question and answer are required' });
        }

        // Auto-assign order if not provided
        let assignedOrder = order;
        if (assignedOrder === undefined || assignedOrder === null) {
            const maxOrderFaq = await FAQ.findOne({ section: section || 'General' }).sort({ order: -1 });
            assignedOrder = maxOrderFaq ? maxOrderFaq.order + 1 : 0;
        }

        const faq = new FAQ({
            question,
            answer,
            section: section || 'General',
            order: assignedOrder,
            isActive: isActive !== undefined ? isActive : true
        });

        const created = await faq.save();
        res.status(201).json(created);
    } catch (error: any) {
        console.error('Error creating FAQ:', error);
        res.status(400).json({ message: error.message || 'Failed to create FAQ' });
    }
};

// PUT /api/faqs/:id - Admin: Update a FAQ
export const updateFAQ = async (req: Request, res: Response) => {
    try {
        const faq = await FAQ.findById(req.params.id);
        if (!faq) {
            return res.status(404).json({ message: 'FAQ not found' });
        }

        const { question, answer, section, order, isActive } = req.body;
        if (question !== undefined) faq.question = question;
        if (answer !== undefined) faq.answer = answer;
        if (section !== undefined) faq.section = section;
        if (order !== undefined) faq.order = order;
        if (isActive !== undefined) faq.isActive = isActive;

        const updated = await faq.save();
        res.json(updated);
    } catch (error: any) {
        console.error('Error updating FAQ:', error);
        res.status(400).json({ message: error.message || 'Failed to update FAQ' });
    }
};

// DELETE /api/faqs/:id - Admin: Delete a FAQ
export const deleteFAQ = async (req: Request, res: Response) => {
    try {
        const faq = await FAQ.findById(req.params.id);
        if (!faq) {
            return res.status(404).json({ message: 'FAQ not found' });
        }

        await faq.deleteOne();
        res.json({ message: 'FAQ deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting FAQ:', error);
        res.status(500).json({ message: 'Failed to delete FAQ' });
    }
};

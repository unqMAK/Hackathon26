import { Request, Response } from 'express';
import Rubric from '../models/Rubric';

// GET /api/rubrics - Get all active rubrics
export const getRubrics = async (req: Request, res: Response) => {
    try {
        const { all } = req.query;

        // If admin requests all, include inactive
        const query = all === 'true' ? {} : { isActive: true };

        const rubrics = await Rubric.find(query).sort({ order: 1 });
        return res.json(rubrics);
    } catch (error: any) {
        console.error('Get rubrics error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// POST /api/rubrics - Create new rubric (admin only)
export const createRubric = async (req: Request, res: Response) => {
    try {
        const { title, description, maxScore, weight, order } = req.body;

        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }
        if (weight === undefined || weight < 0 || weight > 1) {
            return res.status(400).json({ message: 'Weight must be between 0 and 1' });
        }

        // Get max order if not provided
        let rubricOrder = order;
        if (rubricOrder === undefined) {
            const lastRubric = await Rubric.findOne().sort({ order: -1 });
            rubricOrder = lastRubric ? lastRubric.order + 1 : 0;
        }

        const rubric = await Rubric.create({
            title,
            description,
            maxScore: maxScore || 10,
            weight,
            order: rubricOrder,
            isActive: true
        });

        return res.status(201).json(rubric);
    } catch (error: any) {
        console.error('Create rubric error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// PUT /api/rubrics/:id - Update rubric (admin only)
export const updateRubric = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, description, maxScore, weight, order, isActive } = req.body;

        const rubric = await Rubric.findById(id);
        if (!rubric) {
            return res.status(404).json({ message: 'Rubric not found' });
        }

        if (title !== undefined) rubric.title = title;
        if (description !== undefined) rubric.description = description;
        if (maxScore !== undefined) rubric.maxScore = maxScore;
        if (weight !== undefined) {
            if (weight < 0 || weight > 1) {
                return res.status(400).json({ message: 'Weight must be between 0 and 1' });
            }
            rubric.weight = weight;
        }
        if (order !== undefined) rubric.order = order;
        if (isActive !== undefined) rubric.isActive = isActive;

        await rubric.save();
        return res.json(rubric);
    } catch (error: any) {
        console.error('Update rubric error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// DELETE /api/rubrics/:id - Delete rubric (admin only)
export const deleteRubric = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const rubric = await Rubric.findById(id);
        if (!rubric) {
            return res.status(404).json({ message: 'Rubric not found' });
        }

        await rubric.deleteOne();
        return res.json({ message: 'Rubric deleted successfully' });
    } catch (error: any) {
        console.error('Delete rubric error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// PUT /api/rubrics/reorder - Reorder rubrics (admin only)
export const reorderRubrics = async (req: Request, res: Response) => {
    try {
        const { rubricIds } = req.body;

        if (!rubricIds || !Array.isArray(rubricIds)) {
            return res.status(400).json({ message: 'rubricIds array is required' });
        }

        // Update order for each rubric
        const updates = rubricIds.map((id: string, index: number) =>
            Rubric.findByIdAndUpdate(id, { order: index })
        );

        await Promise.all(updates);

        const rubrics = await Rubric.find({ isActive: true }).sort({ order: 1 });
        return res.json(rubrics);
    } catch (error: any) {
        console.error('Reorder rubrics error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// GET /api/rubrics/validate-weights - Validate total weights
export const validateWeights = async (req: Request, res: Response) => {
    try {
        const rubrics = await Rubric.find({ isActive: true });
        const totalWeight = rubrics.reduce((sum, r) => sum + r.weight, 0);

        return res.json({
            totalWeight,
            isValid: Math.abs(totalWeight - 1.0) < 0.01,
            rubricCount: rubrics.length
        });
    } catch (error: any) {
        console.error('Validate weights error:', error);
        return res.status(500).json({ message: error.message || 'Server Error' });
    }
};

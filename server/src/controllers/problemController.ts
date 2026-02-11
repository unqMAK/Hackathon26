import { Request, Response } from 'express';
import Problem from '../models/Problem';

export const getProblems = async (req: Request, res: Response) => {
    try {
        const problems = await Problem.aggregate([
            {
                $lookup: {
                    from: 'teams',
                    localField: '_id',
                    foreignField: 'problemId',
                    as: 'teams'
                }
            },
            {
                $addFields: {
                    teamCount: { $size: '$teams' }
                }
            },
            {
                $project: {
                    teams: 0
                }
            }
        ]);
        res.json(problems);
    } catch (error: any) {
        console.error('Error fetching problems:', error);

        // Check for MongoDB connection errors
        const isMongoError = error.name === 'MongoNetworkError' ||
            error.name === 'MongooseServerSelectionError' ||
            error.name === 'MongoServerSelectionError' ||
            error.message?.includes('ECONNREFUSED') ||
            error.message?.includes('connect ETIMEDOUT') ||
            error.message?.includes('buffering timed out');

        if (isMongoError) {
            res.status(503).json({
                message: 'Database connection failed. Please ensure MongoDB is running.',
                errorType: 'MONGODB_CONNECTION_ERROR',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        } else {
            res.status(500).json({
                message: 'Failed to fetch problem statements. Please try again later.',
                errorType: 'SERVER_ERROR'
            });
        }
    }
};

export const createProblem = async (req: Request, res: Response) => {
    const { title, description, category, difficulty } = req.body;

    try {
        const problem = new Problem({
            title,
            description,
            category,
            difficulty
        });

        const createdProblem = await problem.save();
        res.status(201).json(createdProblem);
    } catch (error) {
        res.status(400).json({ message: 'Invalid problem data' });
    }
};

export const getProblemById = async (req: Request, res: Response) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (problem) {
            res.json(problem);
        } else {
            res.status(404).json({ message: 'Problem not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const updateProblem = async (req: Request, res: Response) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        const allowedFields = ['title', 'description', 'category', 'difficulty', 'tags', 'type', 'youtubeLink', 'representativeName', 'representativeDesignation'];
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                (problem as any)[field] = req.body[field];
            }
        }

        const updated = await problem.save();
        res.json(updated);
    } catch (error: any) {
        console.error('Error updating problem:', error);
        res.status(400).json({ message: error.message || 'Failed to update problem' });
    }
};

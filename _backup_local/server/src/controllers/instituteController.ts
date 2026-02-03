import { Request, Response } from 'express';
import Institute from '../models/Institute';
import User from '../models/User';
import Team from '../models/Team';

export const validateInstituteCode = async (req: Request, res: Response) => {
    try {
        const { code } = req.params;

        if (!code) {
            return res.status(400).json({ message: 'Institute code is required' });
        }

        const institute = await Institute.findOne({
            code: code.toUpperCase(),
            isActive: true
        });

        if (!institute) {
            return res.status(404).json({ message: 'Invalid institute code' });
        }

        res.json({
            name: institute.name,
            code: institute.code
        });
    } catch (error) {
        console.error('Error validating institute code:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createInstitute = async (req: Request, res: Response) => {
    try {
        const { name, code } = req.body;

        const existingInstitute = await Institute.findOne({ code: code.toUpperCase() });
        if (existingInstitute) {
            return res.status(400).json({ message: 'Institute with this code already exists' });
        }

        const institute = await Institute.create({
            name,
            code: code.toUpperCase()
        });

        res.status(201).json(institute);
    } catch (error) {
        console.error('Error creating institute:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all institutes with counts
export const getInstitutes = async (req: Request, res: Response) => {
    try {
        const institutes = await Institute.find().sort({ name: 1 });

        const institutesWithCounts = await Promise.all(institutes.map(async (inst) => {
            const spocCount = await User.countDocuments({
                role: 'spoc',
                $or: [
                    { instituteId: inst.name }, // Legacy check if stored by name
                    { instituteCode: inst.code }, // Check by code
                    { instituteId: inst.code } // Check if ID is code
                ]
            });

            const mentorCount = await User.countDocuments({
                role: 'mentor',
                $or: [
                    { instituteId: inst.name }, // Legacy check if stored by name
                    { instituteCode: inst.code }, // Check by code
                    { instituteId: inst.code } // Check if ID is code
                ]
            });

            const teamCount = await Team.countDocuments({
                $or: [
                    { instituteId: inst.code },
                    { instituteId: inst.name }
                ]
            });

            return {
                _id: inst._id,
                name: inst.name,
                code: inst.code,
                location: 'India', // Placeholder or add to model
                spocCount,
                mentorCount,
                teamCount
            };
        }));

        res.json(institutesWithCounts);
    } catch (error) {
        console.error('Error getting institutes:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

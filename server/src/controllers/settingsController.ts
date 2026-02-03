import { Request, Response } from 'express';
import Settings from '../models/Settings';

export const getDeadline = async (req: Request, res: Response) => {
    try {
        let deadlineSetting = await Settings.findOne({ key: 'hackathon_deadline' });

        if (!deadlineSetting) {
            // Default deadline: 3 days from now
            const defaultDate = new Date();
            defaultDate.setDate(defaultDate.getDate() + 3);
            deadlineSetting = await Settings.create({
                key: 'hackathon_deadline',
                value: defaultDate.toISOString()
            });
        }

        res.json({ deadline: deadlineSetting.value });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

export const updateDeadline = async (req: Request, res: Response) => {
    try {
        const { deadline } = req.body;
        const setting = await Settings.findOneAndUpdate(
            { key: 'hackathon_deadline' },
            { value: deadline },
            { new: true, upsert: true }
        );
        res.json(setting);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// Get problem selection lock status (for students)
export const getProblemLockStatus = async (req: Request, res: Response) => {
    try {
        const setting = await Settings.findOne({ key: 'problemSelectionLocked' });
        res.json({ locked: setting?.value ?? false });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

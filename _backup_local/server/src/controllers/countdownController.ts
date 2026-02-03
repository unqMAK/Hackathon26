import { Request, Response } from 'express';
import Countdown from '../models/Countdown';

// @desc    Get countdown configuration
// @route   GET /api/countdown
// @access  Public
export const getCountdown = async (req: Request, res: Response) => {
    try {
        const countdown = await Countdown.findOne({ isActive: true });

        if (!countdown) {
            return res.status(404).json({ message: 'No active countdown found' });
        }

        res.status(200).json(countdown);
    } catch (error) {
        console.error('Error fetching countdown:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update or create countdown configuration
// @route   PUT /api/countdown
// @access  Private/Admin
export const updateCountdown = async (req: Request, res: Response) => {
    try {
        const { title, targetDate, isActive } = req.body;

        // Validate targetDate
        if (!targetDate || isNaN(Date.parse(targetDate))) {
            return res.status(400).json({ message: 'Invalid target date' });
        }

        // Use upsert to create or update the singleton document
        const countdown = await Countdown.findOneAndUpdate(
            {},
            {
                title: title || 'Event Starts In',
                targetDate: new Date(targetDate),
                isActive: isActive !== undefined ? isActive : true
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        res.status(200).json(countdown);
    } catch (error) {
        console.error('Error updating countdown:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Disable countdown
// @route   PUT /api/countdown/disable
// @access  Private/Admin
export const disableCountdown = async (req: Request, res: Response) => {
    try {
        const countdown = await Countdown.findOneAndUpdate(
            {},
            { isActive: false },
            { new: true }
        );

        if (!countdown) {
            return res.status(404).json({ message: 'No countdown configuration found' });
        }

        res.status(200).json({ message: 'Countdown disabled successfully', countdown });
    } catch (error) {
        console.error('Error disabling countdown:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

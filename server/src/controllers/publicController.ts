import { Request, Response } from 'express';
import User from '../models/User';

// Get all SPOCs with their institute details
export const getPublicSpocs = async (req: Request, res: Response) => {
    try {
        const spocs = await User.find({ role: 'spoc' })
            .select('name email instituteId instituteName instituteCode district state')
            .sort({ instituteId: 1 });

        res.json(spocs);
    } catch (error) {
        console.error('Error in getPublicSpocs:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get existing SPOC and Mentor for an institute code
export const getInstituteGovernance = async (req: Request, res: Response) => {
    const { code } = req.params;
    try {
        const spoc = await User.findOne({ role: 'spoc', instituteCode: code })
            .select('name email instituteName district state');

        const mentor = await User.findOne({ role: 'mentor', instituteCode: code })
            .select('name email');

        res.json({ spoc, mentor });
    } catch (error) {
        console.error('Error in getInstituteGovernance:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

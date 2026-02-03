import { Request, Response } from 'express';
import User from '../models/User';

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Search available students (not in any team)
export const searchAvailableStudents = async (req: any, res: Response) => {
    const { q } = req.query;

    try {
        const query: any = {
            role: 'student',
            instituteId: req.user.instituteId, // Only show students from same institute
            $or: [
                { teamId: { $exists: false } },
                { teamId: null }
            ]
        };

        // Add search filter if query provided
        if (q) {
            query.$and = [
                {
                    $or: [
                        { name: { $regex: q, $options: 'i' } },
                        { email: { $regex: q, $options: 'i' } }
                    ]
                }
            ];
        }

        const students = await User.find(query)
            .select('name email instituteId')
            .limit(20);

        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

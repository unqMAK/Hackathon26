import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET as string, {
        expiresIn: '30d',
    });
};

import Institute from '../models/Institute';

export const registerUser = async (req: Request, res: Response) => {
    return res.status(403).json({
        message: 'Direct student registration is disabled. Please register your team via the /register-team portal.'
    });

    // Legacy logic below (kept for reference or internal use if needed)
    /*
    const { name, email, password, instituteCode } = req.body;
    ...
    */
};

import Team from '../models/Team';

export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {

        // --- STRICT GOVERNANCE CHECK: TEAM LEADER ONLY ---
        if (user.role === 'student') {
            if (!user.teamId) {
                // Should not ideally happen for active students, but just in case
                return res.status(403).json({ message: 'Access Denied: You are not assigned to any team.' });
            }

            const team = await Team.findById(user.teamId);
            if (team && String(team.leaderId) !== String(user._id)) {
                return res.status(403).json({
                    message: 'Access Restricted. Only the Team Leader can login to the dashboard.'
                });
            }
        }
        // -------------------------------------------------

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            instituteId: user.instituteId,
            token: generateToken(user._id as unknown as string),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

export const getMe = async (req: any, res: Response) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            instituteId: user.instituteId,
            teamId: user.teamId
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

import PasswordResetRequest from '../models/PasswordResetRequest';

// Request password reset - creates a pending request for admin approval
export const requestPasswordReset = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            // Don't reveal if email exists or not for security
            return res.status(200).json({
                message: 'If an account with that email exists, a password reset request has been submitted for admin review.'
            });
        }

        // Check if there's already a pending request
        const existingRequest = await PasswordResetRequest.findOne({
            userId: user._id,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({
                message: 'A password reset request is already pending for this account. Please wait for admin approval.'
            });
        }

        // Create new password reset request
        const resetRequest = new PasswordResetRequest({
            userId: user._id,
            email: user.email,
            userName: user.name,
            userPhone: (user as any).phone || '',
            status: 'pending',
            requestedAt: new Date()
        });

        await resetRequest.save();

        res.status(200).json({
            message: 'Password reset request submitted successfully. An administrator will review your request and you will receive an email with your new password once approved.'
        });
    } catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({ message: 'Server error while processing password reset request' });
    }
};

import { Request, Response } from 'express';
import User from '../models/User';
import Institute from '../models/Institute';
import Team from '../models/Team';
import Notification from '../models/Notification';
import emailService from '../services/emailService';

// Create Admin
// Create Admin
export const createAdmin = async (req: Request, res: Response) => {
    const { name, email, password, instituteId, instituteName, instituteCode, state, district } = req.body;
    console.log('Creating admin:', { name, email, instituteId, instituteName, instituteCode, state, district });

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            console.log('User already exists:', email);
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: 'admin',
            instituteId,
            instituteName,
            instituteCode,
            state,
            district
        });

        // Sync with Institute Registry
        if (instituteCode) {
            const normalizedCode = instituteCode.toUpperCase();
            await Institute.findOneAndUpdate(
                { code: normalizedCode },
                {
                    name: instituteName || instituteId, // Prefer instituteName, fallback to Id if old format
                    code: normalizedCode,
                    isActive: true
                },
                { upsert: true, new: true }
            );
        }

        console.log('Admin created successfully:', user._id);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            instituteId: user.instituteId
        });
    } catch (error: any) {
        console.error('Error creating admin:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create Judge
export const createJudge = async (req: Request, res: Response) => {
    const { name, email, password, instituteId, instituteName, instituteCode, state, district } = req.body;
    console.log('Creating judge:', { name, email, instituteId, instituteName, instituteCode, state, district });

    if (!instituteName && !instituteId) {
        return res.status(400).json({ message: 'Institute Name is required' });
    }

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            console.log('User already exists:', email);
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: 'judge',
            instituteId,
            instituteName,
            instituteCode,
            state,
            district
        });

        // Sync with Institute Registry
        if (instituteCode) {
            const normalizedCode = instituteCode.toUpperCase();
            await Institute.findOneAndUpdate(
                { code: normalizedCode },
                {
                    name: instituteName || instituteId,
                    code: normalizedCode,
                    isActive: true
                },
                { upsert: true, new: true }
            );
        }

        console.log('Judge created successfully:', user._id);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            instituteId: user.instituteId
        });
    } catch (error: any) {
        console.error('Error creating judge:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create Mentor
export const createMentor = async (req: Request, res: Response) => {
    const { name, email, password, instituteId, instituteName, instituteCode, state, district } = req.body;
    console.log('Creating mentor:', { name, email, instituteId, instituteName, instituteCode, state, district });

    if (!instituteName && !instituteId) {
        return res.status(400).json({ message: 'Institute Name is required' });
    }

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            console.log('User already exists:', email);
            return res.status(400).json({ message: 'User already exists' });
        }

        // Check if a mentor already exists for this instituteCode
        if (instituteCode) {
            const existingMentor = await User.findOne({ role: 'mentor', instituteCode });
            if (existingMentor) {
                return res.status(400).json({
                    message: `A Mentor (${existingMentor.name}) is already registered for institute code ${instituteCode}. Only one mentor per institute is allowed.`
                });
            }
        }

        const user = await User.create({
            name,
            email,
            password,
            role: 'mentor',
            instituteId,
            instituteName,
            instituteCode,
            state,
            district
        });

        // Sync with Institute Registry
        if (instituteCode) {
            const normalizedCode = instituteCode.toUpperCase();
            await Institute.findOneAndUpdate(
                { code: normalizedCode },
                {
                    name: instituteName || instituteId,
                    code: normalizedCode,
                    isActive: true
                },
                { upsert: true, new: true }
            );
        }

        console.log('Mentor created successfully:', user._id);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            instituteId: user.instituteId
        });
    } catch (error: any) {
        console.error('Error creating mentor:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create SPOC
export const createSpoc = async (req: Request, res: Response) => {
    console.log('CREATE SPOC REQ BODY:', req.body); // DEBUG
    const { name, email, password, instituteId, instituteName, instituteCode, state, district } = req.body;
    console.log('Creating SPOC:', { name, email, instituteId, instituteName, instituteCode, state, district });

    if (!instituteName && !instituteId) {
        return res.status(400).json({ message: 'Institute Name is required' });
    }

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            console.log('User already exists:', email);
            return res.status(400).json({ message: 'User already exists' });
        }

        // Check if a SPOC already exists for this instituteCode
        if (instituteCode) {
            const existingSpoc = await User.findOne({ role: 'spoc', instituteCode });
            if (existingSpoc) {
                return res.status(400).json({
                    message: `A SPOC (${existingSpoc.name}) is already registered for institute code ${instituteCode}. Only one SPOC per institute is allowed.`
                });
            }
        }

        const user = await User.create({
            name,
            email,
            password,
            role: 'spoc',
            instituteId,
            instituteName,
            instituteCode,
            state,
            district
        });

        // Sync with Institute Registry
        if (instituteCode) {
            const normalizedCode = instituteCode.toUpperCase();
            console.log('Syncing institute:', { instituteCode: normalizedCode, instituteName });
            try {
                const inst = await Institute.findOneAndUpdate(
                    { code: normalizedCode },
                    {
                        name: instituteName || instituteId, // instituteId parameter holds the Name
                        code: normalizedCode,
                        isActive: true
                    },
                    { upsert: true, new: true }
                );
                console.log('Institute synced result:', inst);
            } catch (instError) {
                console.error('Error syncing institute:', instError);
            }
        } else {
            console.log('No instituteCode provided, skipping sync');
        }

        console.log('SPOC created successfully:', user._id);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            instituteId: user.instituteId
        });
    } catch (error: any) {
        console.error('Error creating SPOC:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

import PendingTeam from '../models/PendingTeam';

// Governance: Approve Team (Refactored for PendingTeam Architecture)
export const approveGovernanceTeam = async (req: Request, res: Response) => {
    const { teamId } = req.params; // This will now be the pendingTeamId
    const adminId = (req as any).user._id;

    try {
        const pendingTeam = await PendingTeam.findById(teamId);
        if (!pendingTeam) return res.status(404).json({ message: 'Pending team registration not found' });

        const instCode = pendingTeam.instituteCode;

        // --- GOVERNANCE HANDLING ---
        let spoc = await User.findOne({ role: 'spoc', instituteCode: instCode });
        let spocPassword = '';
        let mentor = await User.findOne({ role: 'mentor', instituteCode: instCode });
        let mentorPassword = '';

        // 1. Create Leader User
        // NOTE: PendingTeam already hashes the password. We must bypass User's pre-save hook.
        console.log('--- LEADER CREATION DEBUG ---');
        console.log(`PendingTeam.leaderPassword (first 30 chars): ${pendingTeam.leaderPassword?.substring(0, 30)}...`);

        const leader = new User({
            name: pendingTeam.leaderName,
            email: pendingTeam.leaderEmail,
            role: 'student',
            instituteCode: pendingTeam.instituteCode,
            instituteName: pendingTeam.instituteName,
            instituteId: pendingTeam.instituteName,
            password: 'PLACEHOLDER' // Will be replaced below
        });
        await leader.save();

        // Directly set the already-hashed password, bypassing the pre-save hook
        await User.updateOne(
            { _id: leader._id },
            { $set: { password: pendingTeam.leaderPassword } }
        );

        // Verify the password was set correctly
        const verifyLeader = await User.findById(leader._id);
        console.log(`Saved User.password (first 30 chars): ${verifyLeader?.password?.substring(0, 30)}...`);
        console.log(`Passwords match: ${pendingTeam.leaderPassword === verifyLeader?.password ? '✅ YES' : '❌ NO'}`);
        console.log('--- END DEBUG ---');

        // 2. SPOC Account (Reuse if exists, otherwise create)
        if (!spoc) {
            spocPassword = Math.random().toString(36).slice(-10);
            spoc = await User.create({
                name: pendingTeam.spocName,
                email: pendingTeam.spocEmail,
                password: spocPassword,
                role: 'spoc',
                instituteCode: pendingTeam.instituteCode,
                instituteName: pendingTeam.instituteName,
                instituteId: pendingTeam.instituteName,
                district: pendingTeam.spocDistrict,
                state: pendingTeam.spocState
            });
            console.log(`Created new SPOC for ${instCode}`);
        } else {
            console.log(`Reusing existing SPOC for ${instCode}: ${spoc.email}`);
            // Update district/state if missing on existing SPOC
            if ((!spoc.district || !spoc.state) && (pendingTeam.spocDistrict || pendingTeam.spocState)) {
                await User.updateOne(
                    { _id: spoc._id },
                    { $set: { district: pendingTeam.spocDistrict, state: pendingTeam.spocState } }
                );
                console.log(`Updated SPOC ${spoc.email} with district/state`);
            }
        }

        // 3. Mentor Account (Reuse if exists, otherwise create)
        if (!mentor) {
            mentorPassword = Math.random().toString(36).slice(-10);
            mentor = await User.create({
                name: pendingTeam.mentorName,
                email: pendingTeam.mentorEmail,
                password: mentorPassword,
                role: 'mentor',
                instituteCode: pendingTeam.instituteCode,
                instituteName: pendingTeam.instituteName,
                instituteId: pendingTeam.instituteName
            });
            console.log(`Created new Mentor for ${instCode}`);
        } else {
            console.log(`Reusing existing Mentor for ${instCode}: ${mentor.email}`);
        }

        // 3.5. Sync with Institute Registry (Auto-create institute on approval)
        // 3.5. Sync with Institute Registry (Auto-create institute on approval)
        if (pendingTeam.instituteCode) {
            const normalizedCode = pendingTeam.instituteCode.toUpperCase();
            console.log('Syncing institute on team approval:', {
                code: normalizedCode,
                name: pendingTeam.instituteName
            });
            try {
                const institute = await Institute.findOneAndUpdate(
                    { code: normalizedCode },
                    {
                        name: pendingTeam.instituteName,
                        code: normalizedCode,
                        isActive: true
                    },
                    { upsert: true, new: true }
                );
                console.log('Institute synced/created:', institute);
            } catch (instError) {
                console.error('Error syncing institute (non-critical):', instError);
                // Don't block approval if institute sync fails
            }
        }

        // 4. Create Main Team Table entry
        const team = await Team.create({
            name: pendingTeam.name,
            leaderId: leader._id,
            members: [leader._id],
            instituteCode: pendingTeam.instituteCode,
            instituteName: pendingTeam.instituteName,
            instituteId: pendingTeam.instituteName,
            mentorName: pendingTeam.mentorName,
            mentorEmail: pendingTeam.mentorEmail,
            spocName: pendingTeam.spocName,
            spocEmail: pendingTeam.spocEmail,
            spocDistrict: pendingTeam.spocDistrict,
            spocState: pendingTeam.spocState,
            spocId: spoc._id,
            mentorId: mentor._id,
            consentFile: pendingTeam.consentFile,
            problemId: pendingTeam.problemId || undefined,
            pendingMembers: pendingTeam.pendingMembers,
            status: 'approved',
            approvedBy: adminId,
            approvedAt: new Date()
        });

        // Link team to leader
        leader.teamId = team._id as any;
        await leader.save();

        // 5. Create other Member accounts
        const memberIds = [leader._id];
        const studentCredentials: { name: string; email: string; password: string }[] = [];
        const studentPasswords: string[] = [];

        for (const m of pendingTeam.pendingMembers) {
            const pwd = Math.random().toString(36).slice(-10);
            studentPasswords.push(`${m.email}: ${pwd}`);
            studentCredentials.push({ name: m.name, email: m.email, password: pwd });
            const student = await User.create({
                name: m.name,
                email: m.email,
                password: pwd,
                role: 'student',
                instituteCode: pendingTeam.instituteCode,
                instituteName: pendingTeam.instituteName,
                instituteId: pendingTeam.instituteName,
                teamId: team._id
            });
            memberIds.push(student._id as any);
        }

        // Update Team with all member IDs
        team.members = memberIds;
        await team.save();

        // 6. Delete PendingTeam document
        await PendingTeam.findByIdAndDelete(teamId);

        // 7. Notify Leader
        try {
            await Notification.create({
                title: 'Team Approved!',
                message: `Your team "${team.name}" has been approved. Welcome to the hackathon!`,
                type: 'success',
                recipientType: 'custom',
                recipients: [leader._id],
                triggeredBy: adminId,
                relatedTeamId: team._id
            });
        } catch (nErr) { console.error('Notification error:', nErr); }

        console.log('--- TEAM APPROVED (TWO-TABLE) ---');
        console.log(`Team: ${team.name}`);
        console.log(`Leader [${pendingTeam.leaderEmail}]: Account provisioned`);
        console.log(`SPOC [${pendingTeam.spocEmail}]: ${spocPassword}`);
        console.log(`Mentor [${pendingTeam.mentorEmail}]: ${mentorPassword}`);
        console.log(`Students:\n${studentPasswords.join('\n')}`);

        // --- EMAIL NOTIFICATIONS (Only Leader, SPOC, Mentor) ---
        try {
            // 1. Team Leader - Send Welcome Email
            await emailService.sendWelcomeEmail(pendingTeam.leaderEmail, pendingTeam.leaderName, team.name);

            // 2. SPOC - Send Credentials (if new) or Notification (if existing)
            if (spocPassword) {
                await emailService.sendCredentialEmail(pendingTeam.spocEmail, pendingTeam.spocName, 'Institute SPOC', spocPassword, false);
            } else if (spoc) {
                await emailService.sendCredentialEmail(spoc.email, spoc.name, 'Institute SPOC', undefined, true);
            }

            // 3. Mentor - Send Credentials (if new) or Notification (if existing)
            if (mentorPassword) {
                await emailService.sendCredentialEmail(pendingTeam.mentorEmail, pendingTeam.mentorName, 'Institute Mentor', mentorPassword, false);
            } else if (mentor) {
                await emailService.sendCredentialEmail(mentor.email, mentor.name, 'Institute Mentor', undefined, true);
            }
        } catch (emailError: any) {
            console.error('Email sending failed (non-critical):', emailError.message);
        }

        res.json({
            message: 'Team approved. Credentials sent to Leader, SPOC, and Mentor.',
            credentials: {
                spoc: spocPassword ? { email: spoc.email, password: spocPassword } : null,
                mentor: mentorPassword ? { email: mentor.email, password: mentorPassword } : null
            }
        });
    } catch (error: any) {
        console.error('Approval Error:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// Governance: Reject Team (Two-Table)
export const rejectGovernanceTeam = async (req: Request, res: Response) => {
    const { teamId } = req.params;
    const { reason } = req.body;

    try {
        const pendingTeam = await PendingTeam.findById(teamId);
        if (!pendingTeam) return res.status(404).json({ message: 'Pending team not found' });

        // Since NO users were created yet, we just delete the PendingTeam
        await PendingTeam.findByIdAndDelete(teamId);
        console.log(`Rejected and Deleted PendingTeam record: ${teamId}`);

        res.json({ message: 'Team registration rejected and staging data cleared.' });
    } catch (error: any) {
        console.error('Rejection Error:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// Get Pending Teams for Admin (From PendingTable)
export const getAdminPendingTeams = async (req: Request, res: Response) => {
    try {
        const teams = await PendingTeam.find({ status: 'pending' })
            .sort({ createdAt: -1 });

        // Transform for frontend compatibility (Frontend expects team.leaderId.name)
        const transformedTeams = teams.map(team => ({
            ...team.toObject(),
            leaderId: {
                name: team.leaderName,
                email: team.leaderEmail
            }
        }));

        res.json(transformedTeams);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

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
        if (error.code === 11000) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }
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
        if (error.code === 11000) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }
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
        if (error.code === 11000) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }
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
        if (error.code === 11000) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }
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
        // Helper to find or create user
        const findOrCreateUser = async (
            name: string,
            email: string,
            role: string,
            password?: string, // Only used if creating new
            additionalProps: any = {}
        ) => {
            let user = await User.findOne({ email });
            let isNew = false;
            let actualPassword = '';

            if (!user) {
                isNew = true;
                actualPassword = password || Math.random().toString(36).slice(-10);
                user = await User.create({
                    name,
                    email,
                    password: actualPassword,
                    role,
                    instituteCode: pendingTeam.instituteCode,
                    instituteName: pendingTeam.instituteName,
                    instituteId: pendingTeam.instituteName,
                    ...additionalProps
                });
                console.log(`Created new ${role}: ${email}`);
            } else {
                console.log(`Reusing existing user for ${role}: ${email} (Role: ${user.role})`);
                // Optional: Update district/state if provided and missing
                if (additionalProps.district || additionalProps.state) {
                    if (!user.district || !user.state) {
                        await User.updateOne(
                            { _id: user._id },
                            { $set: { district: additionalProps.district, state: additionalProps.state } }
                        );
                    }
                }
            }
            return { user, isNew, actualPassword };
        };

        // 1. Create Leader User (or Reuse)
        // Check if leader exists
        let leader = await User.findOne({ email: pendingTeam.leaderEmail });
        if (!leader) {
            // Create Leader
            leader = new User({
                name: pendingTeam.leaderName,
                email: pendingTeam.leaderEmail,
                role: 'student',
                instituteCode: pendingTeam.instituteCode,
                instituteName: pendingTeam.instituteName,
                instituteId: pendingTeam.instituteName,
                password: 'PLACEHOLDER'
            });
            await leader.save();
            // Bypass pre-save hook for password
            await User.updateOne(
                { _id: leader._id },
                { $set: { password: pendingTeam.leaderPassword } }
            );
            console.log(`Created Leader: ${pendingTeam.leaderEmail}`);
        } else {
            console.log(`Reusing Leader: ${pendingTeam.leaderEmail}`);
            // STRICT CHECK: Leader cannot be in another team
            if (leader.teamId) {
                const existingTeam = await Team.findById(leader.teamId);
                // If team exists, block. If dangling reference (team deleted but ID remains), maybe allow?
                // Safer to block and require cleanup.
                if (existingTeam) {
                    throw new Error(`Team Leader (${leader.email}) is already a member of another team (${existingTeam.name}).`);
                }
                // If team doesn't exist (dangling), we could allow, but warn.
                console.warn(`Leader ${leader.email} has dangling teamId ${leader.teamId}. overwriting.`);
            }
        }

        // 2. SPOC
        const spocData = await findOrCreateUser(
            pendingTeam.spocName,
            pendingTeam.spocEmail,
            'spoc',
            undefined,
            { district: pendingTeam.spocDistrict, state: pendingTeam.spocState }
        );
        const spoc = spocData.user;

        // 3. Mentor
        const mentorData = await findOrCreateUser(
            pendingTeam.mentorName,
            pendingTeam.mentorEmail,
            'mentor'
        );
        const mentor = mentorData.user;

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
            const memberData = await findOrCreateUser(
                m.name,
                m.email,
                'student',
                undefined,
                { teamId: team._id }
            );

            memberIds.push(memberData.user._id as any);
            if (memberData.isNew) {
                const pwd = memberData.actualPassword;
                studentPasswords.push(`${m.email}: ${pwd}`);
                studentCredentials.push({ name: m.name, email: m.email, password: pwd });
            } else {
                // Existing member
                const existingUser = memberData.user;
                if (existingUser.role === 'student' && existingUser.teamId) {
                    // Check if team exists
                    const existingTeam = await Team.findById(existingUser.teamId);
                    if (existingTeam) {
                        // Rollback? We created the team already!
                        // If we fail here, we leave a Team half-created.
                        // We should probably check members BEFORE creating Team?
                        // But we are in a loop effectively.
                        // Ideally we check ALL members before creating team.
                        // But we also create users here.
                        // Robustness tradeoff. If we throw here, the Transaction is aborted if using Transactions.
                        // MongoDB transactions? We are not using them explicitly.
                        // So we have a Partial Failure.
                        // Ideally we should delete the Team we just created?
                        await Team.findByIdAndDelete(team._id);
                        throw new Error(`Team Member (${existingUser.email}) is already a member of another team (${existingTeam.name}). Approval Aborted.`);
                    }
                }
                // Updated check passed or dangling.
                await User.updateOne({ _id: memberData.user._id }, { $set: { teamId: team._id } });
            }
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
        console.log(`Leader [${pendingTeam.leaderEmail}]: Account provisioned/reused`);
        console.log(`SPOC [${pendingTeam.spocEmail}]: ${spocData.isNew ? spocData.actualPassword : 'REUSED'}`);
        console.log(`Mentor [${pendingTeam.mentorEmail}]: ${mentorData.isNew ? mentorData.actualPassword : 'REUSED'}`);

        // --- EMAIL NOTIFICATIONS (Only Leader, SPOC, Mentor) ---
        try {
            // 1. Team Leader - Send Welcome Email
            await emailService.sendWelcomeEmail(pendingTeam.leaderEmail, pendingTeam.leaderName, team.name);

            // 2. SPOC - Send Credentials (if new) or Notification (if existing)
            if (spocData.isNew) {
                await emailService.sendCredentialEmail(pendingTeam.spocEmail, pendingTeam.spocName, 'Institute SPOC', spocData.actualPassword, false);
            } else {
                await emailService.sendCredentialEmail(spoc.email, spoc.name, 'Institute SPOC', undefined, true);
            }

            // 3. Mentor - Send Credentials (if new) or Notification (if existing)
            if (mentorData.isNew) {
                await emailService.sendCredentialEmail(pendingTeam.mentorEmail, pendingTeam.mentorName, 'Institute Mentor', mentorData.actualPassword, false);
            } else {
                await emailService.sendCredentialEmail(mentor.email, mentor.name, 'Institute Mentor', undefined, true);
            }
        } catch (emailError: any) {
            console.error('Email sending failed (non-critical):', emailError.message);
        }

        res.json({
            message: 'Team approved. Credentials sent to Leader, SPOC, and Mentor.',
            credentials: {
                spoc: spocData.isNew ? { email: spoc.email, password: spocData.actualPassword } : null,
                mentor: mentorData.isNew ? { email: mentor.email, password: mentorData.actualPassword } : null
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

        // EMAIL: Send rejection email to team leader before deleting
        try {
            await emailService.sendRejectionEmail(
                pendingTeam.leaderEmail,
                pendingTeam.leaderName,
                pendingTeam.name,
                reason || 'Your registration did not meet the requirements.'
            );
        } catch (emailError) {
            console.error('Failed to send rejection email:', emailError);
        }

        // Since NO users were created yet, we just delete the PendingTeam
        await PendingTeam.findByIdAndDelete(teamId);
        console.log(`Rejected and Deleted PendingTeam record: ${teamId}`);

        res.json({ message: 'Team registration rejected and staging data cleared.' });
    } catch (error: any) {
        console.error('Rejection Error:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};


// Governance: Delete Approved Team
export const deleteTeam = async (req: Request, res: Response) => {
    const { teamId } = req.params;

    try {
        const team = await Team.findById(teamId);
        if (!team) return res.status(404).json({ message: 'Team not found' });

        // Delete associated users (Leader, Members)
        // Note: SPOC and Mentor might be shared, so we usually don't delete them automatically
        // unless we built a check. For safety, let's only delete Student members linked to this team.
        await User.deleteMany({ _id: { $in: team.members }, role: { $in: ['student', 'leader'] } });

        // Delete the Team
        await Team.findByIdAndDelete(teamId);

        console.log(`Deleted Team ${teamId} and associated student accounts.`);
        res.json({ message: 'Team and associated student accounts deleted successfully' });
    } catch (error: any) {
        console.error('Delete Team Error:', error);
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

// ==================== PASSWORD RESET MANAGEMENT ====================
import PasswordResetRequest from '../models/PasswordResetRequest';
import bcrypt from 'bcryptjs';

// Helper function to generate random password
const generateRandomPassword = (length = 10): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};

// Get all password reset requests for admin
export const getPasswordResetRequests = async (req: Request, res: Response) => {
    try {
        const requests = await PasswordResetRequest.find()
            .populate('userId', 'name email phone role')
            .populate('processedBy', 'name email')
            .sort({ requestedAt: -1 });

        res.json(requests);
    } catch (error) {
        console.error('Error fetching password reset requests:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Approve password reset request
export const approvePasswordReset = async (req: Request, res: Response) => {
    const { requestId } = req.params;
    const { manualPassword } = req.body; // Optional: admin can set a specific password
    const adminId = (req as any).user._id;

    try {
        const resetRequest = await PasswordResetRequest.findById(requestId);

        if (!resetRequest) {
            return res.status(404).json({ message: 'Password reset request not found' });
        }

        if (resetRequest.status !== 'pending') {
            return res.status(400).json({ message: 'This request has already been processed' });
        }

        const user = await User.findById(resetRequest.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate or use manual password
        const newPassword = manualPassword || generateRandomPassword();

        // Hash the password manually to avoid issues with save middleware
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update user password directly
        await User.updateOne(
            { _id: user._id },
            { $set: { password: hashedPassword } }
        );

        // Update request status
        resetRequest.status = 'approved';
        resetRequest.processedAt = new Date();
        resetRequest.processedBy = adminId;
        await resetRequest.save();

        // Send email with new password
        try {
            await emailService.sendPasswordResetEmail(user.email, user.name, newPassword);
        } catch (emailError) {
            console.error('Failed to send password reset email:', emailError);
            // Don't fail the request, password was still reset
        }

        res.json({
            message: 'Password reset approved. New password sent to user.',
            email: user.email
        });
    } catch (error) {
        console.error('Error approving password reset:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Reject password reset request
export const rejectPasswordReset = async (req: Request, res: Response) => {
    const { requestId } = req.params;
    const { reason } = req.body;
    const adminId = (req as any).user._id;

    try {
        const resetRequest = await PasswordResetRequest.findById(requestId);

        if (!resetRequest) {
            return res.status(404).json({ message: 'Password reset request not found' });
        }

        if (resetRequest.status !== 'pending') {
            return res.status(400).json({ message: 'This request has already been processed' });
        }

        resetRequest.status = 'rejected';
        resetRequest.processedAt = new Date();
        resetRequest.processedBy = adminId;
        resetRequest.rejectionReason = reason || 'Request rejected by administrator';
        await resetRequest.save();

        res.json({ message: 'Password reset request rejected' });
    } catch (error) {
        console.error('Error rejecting password reset:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin direct password reset for any user
export const adminResetUserPassword = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found with this email' });
        }

        // If password is provided, use it (manual mode). Otherwise, auto-generate.
        const passwordToSet = password || generateRandomPassword();

        // Hash and update password directly
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(passwordToSet, salt);

        await User.updateOne(
            { _id: user._id },
            { $set: { password: hashedPassword } }
        );

        // Send email with new password
        try {
            await emailService.sendPasswordResetEmail(user.email, user.name, passwordToSet);
        } catch (emailError) {
            console.error('Failed to send password reset email:', emailError);
        }

        res.json({
            message: 'Password reset successfully. New password sent to user.',
            email: user.email
        });
    } catch (error) {
        console.error('Error resetting user password:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// CSV Export - Teams format matching the required export structure
export const exportTeamsCSVFlat = async (req: Request, res: Response) => {
    try {
        const teams = await Team.find({})
            .populate('leaderId', 'name email phone')
            .populate('members', 'name email phone')
            .populate('problemId', 'title category type')
            .sort({ createdAt: -1 })
            .lean();

        // CSV Headers matching the exact required format
        const headers = [
            'Sr.No',
            'Team Name',
            'Leader Name',
            'Leader Email',
            'Leader Phone',
            'Member 2 Name',
            'Member 2 Email',
            'Member 3 Name',
            'Member 3 Email',
            'Member 4 Name',
            'Member 4 Email',
            'Member 5 Name',
            'Member 5 Email',
            'Mentor Name',
            'Mentor Email',
            'Institute Name',
            'Institute Code',
            'District',
            'State',
            'Problem Statement',
            'Problem Category',
            'GitHub/Repo Link',
            'Drive/File Links',
            'Other Links',
            'Status',
            'Approved Date'
        ];

        const rows: string[][] = [];
        let srNo = 1;

        for (const team of teams) {
            const leader = team.leaderId as any;
            const members = (team.members as any[]) || [];
            const problem = team.problemId as any;

            // Get all members (excluding leader if present in members array)
            const otherMembers = members.filter(m =>
                m._id?.toString() !== leader?._id?.toString()
            );

            // Also include pending members
            const pendingMembers = team.pendingMembers || [];

            // Combine approved and pending members (max 4 additional to leader)
            const allOtherMembers: { name: string; email: string; phone?: string }[] = [
                ...otherMembers.map((m: any) => ({ name: m.name || '', email: m.email || '', phone: m.phone || '' })),
                ...pendingMembers.map(p => ({ name: p.name || '', email: p.email || '', phone: '' }))
            ];

            // Pad to 4 members (Member 2-5)
            while (allOtherMembers.length < 4) {
                allOtherMembers.push({ name: '', email: '', phone: '' });
            }

            // Get approved date
            const approvedDate = (team as any).approvedAt
                ? new Date((team as any).approvedAt).toISOString().split('T')[0]
                : ((team as any).createdAt ? new Date((team as any).createdAt).toISOString().split('T')[0] : '');

            // Determine problem statement text
            const problemTitle = problem?.title || 'Not Selected';
            const problemCategory = problem?.type || 'N/A';

            rows.push([
                String(srNo++),
                team.name || '',
                leader?.name || '',
                leader?.email || '',
                leader?.phone || 'N/A',
                allOtherMembers[0]?.name || '',
                allOtherMembers[0]?.email || '',
                allOtherMembers[1]?.name || '',
                allOtherMembers[1]?.email || '',
                allOtherMembers[2]?.name || '',
                allOtherMembers[2]?.email || '',
                allOtherMembers[3]?.name || '',
                allOtherMembers[3]?.email || '',
                team.mentorName || '',
                team.mentorEmail || '',
                team.instituteName || '',
                team.instituteCode || '',
                team.spocDistrict || '',
                team.spocState || '',
                problemTitle,
                problemCategory,
                '', // GitHub/Repo Link (not in current model)
                '', // Drive/File Links (not in current model)
                '', // Other Links (not in current model)
                team.status || '',
                approvedDate
            ]);
        }

        // Build CSV content
        const escapeCSV = (value: string) => {
            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        };

        const csvContent = [
            headers.map(escapeCSV).join(','),
            ...rows.map(row => row.map(escapeCSV).join(','))
        ].join('\n');

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `teams_export_${timestamp}.csv`;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(csvContent);

    } catch (error) {
        console.error('Error exporting teams CSV:', error);
        res.status(500).json({ message: 'Server error while exporting teams' });
    }
};

// CSV Export - Structured format (team summaries with statistics)
export const exportTeamsCSVStructured = async (req: Request, res: Response) => {
    try {
        const teams = await Team.find({})
            .populate('leaderId', 'name email phone')
            .populate('members', 'name email phone')
            .populate('problemId', 'title')
            .lean();

        // CSV Headers for structured format
        const headers = [
            'Team ID',
            'Team Name',
            'Team Status',
            'Institute Code',
            'Institute Name',
            'SPOC Name',
            'SPOC Email',
            'SPOC District',
            'SPOC State',
            'Mentor Name',
            'Mentor Email',
            'Problem Title',
            'Leader Name',
            'Leader Email',
            'Leader Phone',
            'Total Members',
            'Pending Members',
            'Progress',
            'Ideation Phase',
            'Prototype Phase',
            'Development Phase',
            'Final Phase',
            'Consent File URL',
            'Created At',
            'Approved At',
            'All Member Emails'
        ];

        const rows: string[][] = [];

        for (const team of teams) {
            const leader = team.leaderId as any;
            const members = team.members as any[];

            // Collect all member emails
            const allEmails: string[] = [];
            if (leader?.email) allEmails.push(leader.email);
            if (members) {
                for (const m of members) {
                    if (m.email && m.email !== leader?.email) {
                        allEmails.push(m.email);
                    }
                }
            }

            rows.push([
                team._id?.toString() || '',
                team.name || '',
                team.status || '',
                team.instituteCode || '',
                team.instituteName || '',
                team.spocName || '',
                team.spocEmail || '',
                team.spocDistrict || '',
                team.spocState || '',
                team.mentorName || '',
                team.mentorEmail || '',
                (team.problemId as any)?.title || 'Not Assigned',
                leader?.name || '',
                leader?.email || '',
                leader?.phone || '',
                String(members?.length || 0),
                String(team.pendingMembers?.length || 0),
                String(team.progress || 0),
                team.phases?.ideation || 'pending',
                team.phases?.prototype || 'pending',
                team.phases?.development || 'pending',
                team.phases?.final || 'pending',
                team.consentFile || '',
                (team as any).createdAt ? new Date((team as any).createdAt).toISOString() : '',
                (team as any).approvedAt ? new Date((team as any).approvedAt).toISOString() : '',
                allEmails.join('; ')
            ]);
        }

        // Build CSV content
        const escapeCSV = (value: string) => {
            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        };

        const csvContent = [
            headers.map(escapeCSV).join(','),
            ...rows.map(row => row.map(escapeCSV).join(','))
        ].join('\n');

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `hacksphere_teams_structured_${timestamp}.csv`;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(csvContent);

    } catch (error) {
        console.error('Error exporting teams CSV:', error);
        res.status(500).json({ message: 'Server error while exporting teams' });
    }
};

// ==================== SETTINGS MANAGEMENT ====================
import Settings from '../models/Settings';

// Get problem selection lock status
export const getProblemSelectionLock = async (req: Request, res: Response) => {
    try {
        const setting = await Settings.findOne({ key: 'problemSelectionLocked' });
        res.json({ locked: setting?.value ?? false });
    } catch (error) {
        console.error('Error getting problem selection lock:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Set problem selection lock status
export const setProblemSelectionLock = async (req: Request, res: Response) => {
    const { locked } = req.body;

    try {
        await Settings.findOneAndUpdate(
            { key: 'problemSelectionLocked' },
            { key: 'problemSelectionLocked', value: locked },
            { upsert: true, new: true }
        );

        console.log(`Problem selection lock set to: ${locked}`);
        res.json({
            message: locked ? 'Problem selection locked' : 'Problem selection unlocked',
            locked
        });
    } catch (error) {
        console.error('Error setting problem selection lock:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all team selections for admin view
export const getTeamSelections = async (req: Request, res: Response) => {
    try {
        // Get all approved teams with their problem selections
        const teams = await Team.find({ status: 'approved' })
            .populate('leaderId', 'name email phone')
            .populate('problemId', 'title category type')
            .sort({ createdAt: -1 })
            .lean();

        // Transform for frontend
        const selections = teams.map((team: any) => ({
            _id: team._id,
            teamName: team.name,
            instituteCode: team.instituteCode,
            instituteName: team.instituteName,
            leaderName: team.leaderId?.name || 'N/A',
            leaderEmail: team.leaderId?.email || 'N/A',
            leaderPhone: team.leaderId?.phone || 'N/A',
            selectedProblem: team.problemId ? {
                _id: team.problemId._id,
                title: team.problemId.title,
                category: team.problemId.category,
                type: team.problemId.type
            } : null,
            hasSelection: !!team.problemId,
            memberCount: team.members?.length || 0
        }));

        // Get lock status
        const lockSetting = await Settings.findOne({ key: 'problemSelectionLocked' });

        res.json({
            selections,
            locked: lockSetting?.value ?? false,
            stats: {
                totalTeams: selections.length,
                teamsWithSelection: selections.filter(s => s.hasSelection).length,
                teamsWithoutSelection: selections.filter(s => !s.hasSelection).length
            }
        });
    } catch (error) {
        console.error('Error getting team selections:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


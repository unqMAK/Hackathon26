import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User';
import Team from '../models/Team';
import { sendInvite } from '../controllers/teamInviteController';
import { sendJoinRequest } from '../controllers/teamJoinRequestController';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const testStrictValidation = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('✅ Connected to MongoDB');

        // 1. Create Users in DIFFERENT Institutes
        const userA = await User.create({
            name: 'User A (Inst A)',
            email: 'usera@test.com',
            password: 'password123',
            role: 'student',
            instituteId: 'INSTITUTE_A'
        });

        const userB = await User.create({
            name: 'User B (Inst B)',
            email: 'userb@test.com',
            password: 'password123',
            role: 'student',
            instituteId: 'INSTITUTE_B'
        });

        console.log('Created users:', {
            userA: { id: userA._id, institute: userA.instituteId },
            userB: { id: userB._id, institute: userB.instituteId }
        });

        // 2. Create Team for User A
        const teamA = await Team.create({
            name: 'Team A',
            leaderId: userA._id,
            members: [userA._id],
            instituteId: 'INSTITUTE_A'
        });
        await User.findByIdAndUpdate(userA._id, { teamId: teamA._id });

        console.log('Created Team A:', { id: teamA._id, institute: teamA.instituteId });

        // 3. Test 1: User A invites User B (Should FAIL)
        console.log('\n--- Test 1: Cross-Institute Invite (A -> B) ---');
        const reqInvite = {
            user: userA,
            body: { toUserId: userB._id.toString() }
        };
        const resInvite = {
            status: (code: number) => ({
                json: (data: any) => console.log(`Invite Response [${code}]:`, data)
            }),
            json: (data: any) => console.log('Invite Response [200]:', data)
        };

        await sendInvite(reqInvite as any, resInvite as any);

        // 4. Test 2: User B requests to join Team A (Should FAIL)
        console.log('\n--- Test 2: Cross-Institute Join Request (B -> Team A) ---');
        const reqJoin = {
            user: userB,
            body: { toTeamId: teamA._id.toString() }
        };
        const resJoin = {
            status: (code: number) => ({
                json: (data: any) => console.log(`Join Response [${code}]:`, data)
            }),
            json: (data: any) => console.log('Join Response [200]:', data)
        };

        await sendJoinRequest(reqJoin as any, resJoin as any);

        // Cleanup
        await User.deleteOne({ _id: userA._id });
        await User.deleteOne({ _id: userB._id });
        await Team.deleteOne({ _id: teamA._id });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

testStrictValidation();

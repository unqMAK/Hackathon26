import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User';
import Team from '../models/Team';
import { removeMember } from '../controllers/teamController';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const testTeamRemoval = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('✅ Connected to MongoDB');

        // 1. Create Leader and Member
        const leader = await User.create({
            name: 'Leader User',
            email: 'leader@test.com',
            password: 'password123',
            role: 'student',
            instituteId: 'TEST_INST'
        });

        const member = await User.create({
            name: 'Member User',
            email: 'member@test.com',
            password: 'password123',
            role: 'student',
            instituteId: 'TEST_INST'
        });

        console.log('Created users:', leader._id, member._id);

        // 2. Create Team
        const team = await Team.create({
            name: 'Removal Test Team',
            leaderId: leader._id,
            members: [leader._id, member._id],
            instituteId: 'TEST_INST'
        });

        // Update users with teamId
        await User.findByIdAndUpdate(leader._id, { teamId: team._id });
        await User.findByIdAndUpdate(member._id, { teamId: team._id });

        console.log('Created team:', team._id);

        // 3. Verify Member sees team
        const memberTeamBefore = await Team.findOne({ members: member._id });
        console.log('Member sees team BEFORE removal:', !!memberTeamBefore);

        if (!memberTeamBefore) {
            throw new Error('Setup failed: Member should see team');
        }

        // 4. Simulate Remove Member Request
        // We need to mock req and res
        const req = {
            user: leader, // Leader is requesting
            params: {
                userId: member._id.toString()
            }
        };

        const res = {
            json: (data: any) => console.log('Response JSON:', data),
            status: (code: number) => ({
                json: (data: any) => console.log(`Response Status ${code}:`, data)
            })
        };

        console.log('Removing member...');
        await removeMember(req as any, res as any);

        // 5. Verify Member does NOT see team
        const memberTeamAfter = await Team.findOne({ members: member._id });
        console.log('Member sees team AFTER removal:', !!memberTeamAfter);

        const memberUserAfter = await User.findById(member._id);
        console.log('Member has teamId AFTER removal:', !!memberUserAfter?.teamId);

        if (memberTeamAfter) {
            console.error('FAIL: Member still sees team!');
        } else if (memberUserAfter?.teamId) {
            console.error('FAIL: Member still has teamId in User model!');
        } else {
            console.log('SUCCESS: Member correctly removed from Team and User model updated.');
        }

        // Cleanup
        await User.deleteOne({ _id: leader._id });
        await User.deleteOne({ _id: member._id });
        await Team.deleteOne({ _id: team._id });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

testTeamRemoval();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User';
import TeamInvite from '../models/TeamInvite';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const debugSpocInvites = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('✅ Connected to MongoDB');

        // 1. Find a SPOC user
        const spoc = await User.findOne({ role: 'spoc' });
        if (!spoc) {
            console.log('❌ No SPOC found');
            process.exit(1);
        }

        console.log('Found SPOC:', {
            id: spoc._id,
            name: spoc.name,
            instituteId: spoc.instituteId
        });

        const spocInstituteId = spoc.instituteId;

        // 2. Count Pending Invites
        const pendingCount = await TeamInvite.countDocuments({
            instituteId: spocInstituteId,
            status: 'pending'
        });
        console.log('\n--- Pending Invites Count ---');
        console.log('Count:', pendingCount);

        // 3. List Pending Invites
        console.log('\n--- Pending Invites List ---');
        const invites = await TeamInvite.find({
            instituteId: spocInstituteId,
            status: 'pending'
        })
            .populate('fromUserId', 'name')
            .populate('toUserId', 'name')
            .populate('teamId', 'name');

        if (invites.length === 0) {
            console.log('No pending invites found.');
        } else {
            invites.forEach((invite: any, i) => {
                console.log(`${i + 1}. From: ${invite.fromUserId?.name} -> To: ${invite.toUserId?.name} (Team: ${invite.teamId?.name})`);
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

debugSpocInvites();

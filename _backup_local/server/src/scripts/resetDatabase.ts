import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User';
import Team from '../models/Team';
import TeamInvite from '../models/TeamInvite';
import TeamJoinRequest from '../models/TeamJoinRequest';
import Notification from '../models/Notification';
import Submission from '../models/Submission';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const resetDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('✅ Connected to MongoDB');

        console.log('⚠️  WARNING: This will delete all non-admin data! ⚠️');

        // 1. Delete Users (except admin)
        const userResult = await User.deleteMany({ role: { $ne: 'admin' } });
        console.log(`🗑️  Deleted ${userResult.deletedCount} users (kept admins)`);

        // 2. Delete Teams
        const teamResult = await Team.deleteMany({});
        console.log(`🗑️  Deleted ${teamResult.deletedCount} teams`);

        // 3. Delete Team Invites
        const inviteResult = await TeamInvite.deleteMany({});
        console.log(`🗑️  Deleted ${inviteResult.deletedCount} invites`);

        // 4. Delete Join Requests
        const joinResult = await TeamJoinRequest.deleteMany({});
        console.log(`🗑️  Deleted ${joinResult.deletedCount} join requests`);

        // 5. Delete Notifications
        const notifResult = await Notification.deleteMany({});
        console.log(`🗑️  Deleted ${notifResult.deletedCount} notifications`);

        // 6. Delete Submissions
        const subResult = await Submission.deleteMany({});
        console.log(`🗑️  Deleted ${subResult.deletedCount} submissions`);

        console.log('\n✅ Database reset complete. Admin accounts preserved.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

resetDatabase();

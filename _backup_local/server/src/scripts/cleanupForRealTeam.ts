import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User';
import Team from '../models/Team';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const cleanupForRealTeam = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('✅ Connected to MongoDB');

        // Delete all users except admin
        const userResult = await User.deleteMany({
            email: { $ne: 'admin@hacksphere.com' }
        });
        console.log('Deleted users:', userResult.deletedCount);

        // Delete all teams
        const teamResult = await Team.deleteMany({});
        console.log('Deleted teams:', teamResult.deletedCount);

        // Verify admin still exists
        const admin = await User.findOne({ email: 'admin@hacksphere.com' });
        if (admin) {
            console.log('✅ Admin user preserved:', admin.email);
        } else {
            console.log('⚠️ Warning: Admin user not found!');
        }

        console.log('✅ Database cleanup complete! Ready for real team registration.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

cleanupForRealTeam();

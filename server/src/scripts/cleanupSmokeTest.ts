import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User';
import Team from '../models/Team';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const cleanupSmokeTest = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('✅ Connected to MongoDB');

        // Find the smoke test team
        const team = await Team.findOne({ name: 'Smoke Test Team' });
        
        if (team) {
            console.log('Found team:', team.name, 'ID:', team._id);
            
            // Get all member IDs from the team
            const memberIds = team.members || [];
            console.log('Member IDs:', memberIds);
            
            // Delete all users associated with this team
            const userResult = await User.deleteMany({ 
                $or: [
                    { _id: { $in: memberIds } },
                    { email: 'testsmoke@test.com' },
                    { email: 'testmember1@test.com' },
                    { email: 'testmember2@test.com' }
                ]
            });
            console.log('Deleted users:', userResult.deletedCount);
            
            // Delete the team
            await Team.deleteOne({ _id: team._id });
            console.log('✅ Deleted team: Smoke Test Team');
        } else {
            console.log('No "Smoke Test Team" found in database');
            
            // Try to find users by email anyway
            const userResult = await User.deleteMany({
                email: { $in: ['testsmoke@test.com', 'testmember1@test.com', 'testmember2@test.com'] }
            });
            console.log('Deleted orphan users:', userResult.deletedCount);
        }

        console.log('✅ Cleanup complete!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

cleanupSmokeTest();

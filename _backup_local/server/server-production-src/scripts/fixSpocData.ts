import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User';
import Team from '../models/Team';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const fixData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('✅ Connected to MongoDB');

        const targetInstituteId = 'MIT';
        const spocEmail = 'manojmane@gmail.com';

        // 1. Update SPOC
        const spoc = await User.findOne({ email: spocEmail });
        if (spoc) {
            spoc.instituteId = targetInstituteId;
            await spoc.save();
            console.log(`✅ Updated SPOC ${spoc.name} to instituteId: ${targetInstituteId}`);
        } else {
            console.log('❌ SPOC Manoj Mane not found');
        }

        // 2. Update Teams
        const result = await Team.updateMany(
            { instituteId: 'default-institute' },
            { $set: { instituteId: targetInstituteId } }
        );
        console.log(`✅ Updated ${result.modifiedCount} teams to instituteId: ${targetInstituteId}`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixData();

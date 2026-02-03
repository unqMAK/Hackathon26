import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User';
import Team from '../models/Team';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const debugSpocStudents = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('✅ Connected to MongoDB');
        console.log('Registered Models:', mongoose.modelNames());

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

        // 2. Run Count Query (Dashboard Stats)
        const count = await User.countDocuments({
            instituteId: spocInstituteId,
            role: 'student'
        });
        console.log('\n--- Dashboard Stats Count ---');
        console.log('Total Students Count:', count);

        // 3. Run List Query (Students Page)
        console.log('\n--- Students List Query ---');
        const students = await User.find({
            instituteId: spocInstituteId,
            role: 'student'
        })
            .populate('teamId', 'name status')
            .select('name email instituteId teamId createdAt')
            .sort({ name: 1 });

        console.log('Students Found:', students.length);

        if (students.length > 0) {
            console.log('First Student:', JSON.stringify(students[0], null, 2));

            // Check for potential populate issues
            students.forEach((s, i) => {
                console.log(`Student ${i + 1}: ${s.name}, TeamId: ${s.teamId}`);
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

debugSpocStudents();

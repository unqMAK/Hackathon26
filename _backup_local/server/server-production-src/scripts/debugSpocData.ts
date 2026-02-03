import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User';
import Team from '../models/Team';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const debugData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('✅ Connected to MongoDB');

        console.log('\n=== SPOC USERS ===');
        const spocs = await User.find({ role: 'spoc' });
        spocs.forEach(spoc => {
            console.log(`Name: ${spoc.name}, Email: ${spoc.email}, InstituteId: '${spoc.instituteId}'`);
        });

        console.log('\n=== TEAMS ===');
        const teams = await Team.find({});
        teams.forEach(team => {
            console.log(`Name: ${team.name}, Status: ${team.status}, RequestSent: ${team.requestSent}, InstituteId: '${team.instituteId}'`);
        });

        console.log('\n=== STUDENTS ===');
        const students = await User.find({ role: 'student' }).limit(5);
        students.forEach(student => {
            console.log(`Name: ${student.name}, Email: ${student.email}, InstituteId: '${student.instituteId}'`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

debugData();

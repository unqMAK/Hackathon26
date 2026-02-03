import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Institute from '../models/Institute';
import User from '../models/User';

dotenv.config();

const seedInstitute = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('MongoDB Connected');

        // Clean up previous test
        await Institute.deleteMany({ code: 'TESTINST' });
        await User.deleteMany({ email: 'spoc@testinst.com' });

        const institute = await Institute.create({
            name: 'Test Institute of Technology',
            code: 'TESTINST'
        });

        console.log('Institute Created:', institute);

        // Create a SPOC for this institute (required for student registration)
        const spoc = await User.create({
            name: 'Test SPOC',
            email: 'spoc@testinst.com',
            password: 'password123',
            role: 'spoc',
            instituteId: institute.name,
            instituteCode: institute.code
        });

        console.log('SPOC Created:', spoc);

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

seedInstitute();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Institute from '../models/Institute';
import User from '../models/User';
import path from 'path';

// Load env vars from server root
dotenv.config({ path: path.join(__dirname, '../../.env') });

const verifyKPMIM = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in .env');
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        console.log('--- Checking Institute ---');
        const institute = await Institute.findOne({ code: 'KPMIM' });
        if (institute) {
            console.log('Institute found:', JSON.stringify(institute, null, 2));
        } else {
            console.log('Institute with code "KPMIM" NOT found.');
            // Search by name just in case
            const instituteByName = await Institute.findOne({ name: { $regex: /KPMIM/i } });
            if (instituteByName) {
                console.log('Found institute by name match:', JSON.stringify(instituteByName, null, 2));
            }
        }

        console.log('\n--- Checking SPOC ---');
        const spoc = await User.findOne({
            $or: [
                { instituteCode: 'KPMIM' },
                { instituteId: 'KPMIM' } // Some might have name as ID
            ],
            role: 'spoc'
        });

        if (spoc) {
            console.log('SPOC found:', JSON.stringify(spoc, null, 2));
        } else {
            console.log('SPOC for KPMIM not found.');
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

verifyKPMIM();

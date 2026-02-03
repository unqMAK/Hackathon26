import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Institute from '../models/Institute';
import User from '../models/User';
import path from 'path';

// Load env from server root
dotenv.config({ path: path.join(__dirname, '../../.env') });

const repairInstitutes = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in .env');
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // 1. Target specifically the issue with KPMIM
        console.log('--- Repairing KPMIM ---');

        let institute = await Institute.findOne({ code: 'KPMIM' });
        if (!institute) {
            console.log('Creating missing Institute for KPMIM...');
            institute = await Institute.create({
                name: 'KPMIM', // Using code as name since we don't have full name, or should be generic
                code: 'KPMIM',
                isActive: true
            });
            console.log('Institute KPMIM Created:', institute);
        } else {
            console.log('Institute KPMIM already exists.');
        }

        // 2. Fix SPOC data consistency
        const spoc = await User.findOne({
            $or: [
                { instituteCode: 'KPMIM' },
                { instituteId: 'KPMIM' }
            ],
            role: 'spoc'
        });

        if (spoc) {
            console.log('Found SPOC:', spoc.email);
            let updated = false;

            if (spoc.instituteCode !== 'KPMIM') {
                spoc.instituteCode = 'KPMIM';
                updated = true;
                console.log('- Updating SPOC instituteCode to KPMIM');
            }

            // instituteId should be the NAME of the institute according to authController logic (legacy support)
            // or we align it. Let's ensure it matches the Institute Name
            if (spoc.instituteId !== institute.name) {
                spoc.instituteId = institute.name;
                updated = true;
                console.log(`- Updating SPOC instituteId from "${spoc.instituteId}" to "${institute.name}"`);
            }

            if (updated) {
                await spoc.save();
                console.log('SPOC updated successfully.');
            } else {
                console.log('SPOC data is already consistent.');
            }
        } else {
            console.log('WARNING: No SPOC found for KPMIM to update.');
        }

        console.log('Repair completed.');
        process.exit();
    } catch (error) {
        console.error('Error repairing institutes:', error);
        process.exit(1);
    }
};

repairInstitutes();

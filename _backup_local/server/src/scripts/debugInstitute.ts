import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Institute from '../models/Institute';

// Load env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const debugInstitute = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is missing');
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const instituteCode = 'DEBUG_INST_' + Date.now();
        const instituteName = 'Debug Institute ' + Date.now();

        console.log(`Attempting to upsert Institute: Code=${instituteCode}, Name=${instituteName}`);

        const result = await Institute.findOneAndUpdate(
            { code: instituteCode },
            {
                name: instituteName,
                code: instituteCode,
                isActive: true
            },
            { upsert: true, new: true }
        );

        console.log('Operation Result:', result);

        if (result && result.name === instituteName) {
            console.log('SUCCESS: Institute created/updated correctly.');
        } else {
            console.log('FAILURE: Result mismatch.');
        }

    } catch (error) {
        console.error('ERROR:', error);
    } finally {
        await mongoose.disconnect();
    }
};

debugInstitute();

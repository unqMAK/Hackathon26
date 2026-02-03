import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User';
import bcrypt from 'bcryptjs';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const forceReset = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('✅ Connected to MongoDB');

        const email = 'suhaskulkarni@gmail.com';
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await User.updateOne(
            { email },
            { $set: { password: hashedPassword } }
        );

        console.log('Update result:', result);

        if (result.modifiedCount > 0) {
            console.log(`Password for ${email} forcefully reset to ${password}`);
        } else {
            console.log(`User ${email} not found or password already set`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

forceReset();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User';
import bcrypt from 'bcryptjs';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const resetPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('✅ Connected to MongoDB');

        const email = 'suhaskulkarni@gmail.com';
        const password = '12345678';
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.findOne({ email });
        if (user) {
            user.password = hashedPassword;
            await user.save();
            console.log(`Password for ${email} reset to ${password}`);
        } else {
            console.log(`User ${email} not found`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

resetPassword();

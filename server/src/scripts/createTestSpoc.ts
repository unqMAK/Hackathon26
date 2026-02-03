import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User';
import bcrypt from 'bcryptjs';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const createTestSpoc = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('✅ Connected to MongoDB');

        const email = 'testspoc@mit.edu';
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User already exists, updating password...');
            existingUser.password = hashedPassword;
            existingUser.role = 'spoc';
            existingUser.instituteId = 'MIT';
            await existingUser.save();
            console.log('User updated');
        } else {
            const user = await User.create({
                name: 'Test SPOC',
                email,
                password: hashedPassword,
                role: 'spoc',
                instituteId: 'MIT'
            });
            console.log('User created:', user);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createTestSpoc();

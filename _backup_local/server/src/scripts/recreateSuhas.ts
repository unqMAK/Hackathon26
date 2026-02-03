import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User';
import bcrypt from 'bcryptjs';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const recreateSuhas = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('✅ Connected to MongoDB');

        const email = 'suhaskulkarni@gmail.com';
        const password = '12345678';
        const hashedPassword = await bcrypt.hash(password, 10);

        // Delete existing user
        await User.deleteOne({ email });
        console.log(`Deleted existing user: ${email}`);

        // Create new user
        const newUser = await User.create({
            name: 'Suhas Kulkarni',
            email,
            password: hashedPassword,
            role: 'spoc',
            instituteId: 'KPMIM'
        });

        console.log('Created new user:', newUser);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

recreateSuhas();

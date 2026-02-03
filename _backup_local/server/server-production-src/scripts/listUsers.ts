import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const listUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('✅ Connected to MongoDB');

        console.error('\n=== USERS ===');
        const users = await User.find({});
        console.error(`Found ${users.length} users`);
        users.forEach(user => {
            console.error(`Role: ${user.role}, Name: ${user.name}, Email: ${user.email}, InstituteId: '${user.instituteId}'`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

listUsers();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const listUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || '');
        console.log('Connected to MongoDB...\n');

        const db = mongoose.connection.db;
        if (!db) {
            console.log('Database connection failed');
            process.exit(1);
        }

        const users = await db.collection('users').find({}).toArray();

        console.log('=== ALL USERS IN DATABASE ===\n');
        users.forEach((u, i) => {
            console.log(`${i + 1}. ${u.name}`);
            console.log(`   Email: ${u.email}`);
            console.log(`   Role: ${u.role}`);
            console.log(`   TeamId: ${u.teamId || 'N/A'}`);
            console.log('');
        });

        console.log(`Total: ${users.length} users`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

listUsers();

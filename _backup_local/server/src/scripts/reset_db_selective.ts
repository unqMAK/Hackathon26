import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const resetDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || '');
        console.log('Connected to MongoDB for selective reset...');

        const db = mongoose.connection.db;
        if (!db) {
            throw new Error('Database connection failed');
        }

        // 1. Clear users except admins
        const usersCol = db.collection('users');
        const userDeleteResult = await usersCol.deleteMany({ role: { $ne: 'admin' } });
        console.log(`Cleared ${userDeleteResult.deletedCount} non-admin users.`);

        // 2. Clear all other collections except 'problems' and 'users' (already handled)
        const collections = await db.listCollections().toArray();
        const skip = ['problems', 'users'];

        for (const col of collections) {
            if (!skip.includes(col.name)) {
                const result = await db.collection(col.name).deleteMany({});
                console.log(`Cleared ${result.deletedCount} items from collection: ${col.name}`);
            }
        }

        console.log('Selective database reset complete.');
        console.log('RETAINED: All Admins and all Problems.');

        process.exit(0);
    } catch (error) {
        console.error('Reset Error:', error);
        process.exit(1);
    }
};

resetDatabase();

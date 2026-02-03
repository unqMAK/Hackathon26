import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const resetPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || '');
        console.log('Connected to MongoDB...');

        const email = 'Amar@gmail.com';  // Case-sensitive match
        const newPassword = 'Test@123';

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const db = mongoose.connection.db;
        if (!db) {
            console.log('Database connection failed');
            process.exit(1);
        }

        // Update the user's password directly
        const result = await db.collection('users').updateOne(
            { email: email },
            { $set: { password: hashedPassword } }
        );

        if (result.matchedCount === 0) {
            console.log(`❌ User with email "${email}" not found.`);
        } else {
            console.log(`✅ Password reset for ${email}`);
            console.log(`   New Password: ${newPassword}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

resetPassword();

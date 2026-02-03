import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const testPasswordFlow = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || '');
        console.log('Connected to MongoDB...\n');

        const db = mongoose.connection.db;
        if (!db) {
            console.log('Database connection failed');
            process.exit(1);
        }

        // Test password
        const testPassword = 'Test@123';

        // Step 1: Hash it once (simulating PendingTeam)
        const salt1 = await bcrypt.genSalt(10);
        const hashedOnce = await bcrypt.hash(testPassword, salt1);
        console.log('Step 1: Password hashed once (PendingTeam simulation)');
        console.log(`   Original: ${testPassword}`);
        console.log(`   Hashed once: ${hashedOnce}`);

        // Step 2: Check if bcrypt can verify the original password against the single hash
        const canVerify = await bcrypt.compare(testPassword, hashedOnce);
        console.log(`\nStep 2: Can verify original against single hash?`);
        console.log(`   Result: ${canVerify ? '✅ YES' : '❌ NO'}`);

        // Step 3: Now fetch Amar's password from DB and test
        const amar = await db.collection('users').findOne({ email: 'Amar@gmail.com' });
        if (amar) {
            console.log(`\nStep 3: Testing Amar@gmail.com's password`);
            console.log(`   Stored hash: ${amar.password?.substring(0, 30)}...`);

            // Test with Test@123 (the password we just reset)
            const canLoginWithReset = await bcrypt.compare('Test@123', amar.password);
            console.log(`   Can login with "Test@123"? ${canLoginWithReset ? '✅ YES' : '❌ NO'}`);
        }

        // Step 4: Check a pending team to see what password is stored
        const pendingTeams = await db.collection('pendingteams').find({}).toArray();
        if (pendingTeams.length > 0) {
            console.log(`\nStep 4: Checking PendingTeam passwords`);
            pendingTeams.forEach((pt, i) => {
                console.log(`   ${i + 1}. ${pt.leaderEmail}`);
                console.log(`      Stored password hash: ${pt.leaderPassword?.substring(0, 30)}...`);
            });
        } else {
            console.log('\nStep 4: No pending teams found');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

testPasswordFlow();

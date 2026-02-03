import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const migrateUserTeamId = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        if (!db) {
            throw new Error('Database connection not established');
        }
        const usersCollection = db.collection('users');

        // Find users with teamId as string
        const users = await usersCollection.find({
            teamId: { $type: 'string' }
        }).toArray();

        console.log(`Found ${users.length} users with string teamId`);

        for (const user of users) {
            if (user.teamId && mongoose.Types.ObjectId.isValid(user.teamId)) {
                console.log(`Migrating user ${user.name} (${user._id}): teamId ${user.teamId} -> ObjectId`);

                await usersCollection.updateOne(
                    { _id: user._id },
                    { $set: { teamId: new mongoose.Types.ObjectId(user.teamId) } }
                );
            } else {
                console.log(`Skipping user ${user.name}: Invalid teamId format '${user.teamId}'`);
                // Optional: Unset invalid teamId
                // await usersCollection.updateOne({ _id: user._id }, { $unset: { teamId: "" } });
            }
        }

        console.log('Migration complete');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

migrateUserTeamId();

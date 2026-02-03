import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Problem from '../models/Problem';

dotenv.config();

/**
 * This script removes the HRMS problem statement from the database
 * Run with: npx ts-node src/scripts/removeHRMSProblem.ts
 */
const removeHRMSProblem = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || '');
        console.log('✅ Connected to MongoDB');

        // Find and delete the HRMS problem statement
        const result = await Problem.deleteOne({
            title: { $regex: /Human Resource Management System/i }
        });

        if (result.deletedCount > 0) {
            console.log('✅ HRMS Problem Statement removed successfully!');
        } else {
            console.log('ℹ️  HRMS Problem Statement not found in database');
        }

        // Disconnect
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error removing HRMS problem:', error);
        process.exit(1);
    }
};

removeHRMSProblem();

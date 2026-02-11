import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Video from '../models/Video';

dotenv.config();

/**
 * Seed the 4 existing SMC department briefing videos into the Video collection.
 * Maps each video to the correct production problem statement(s).
 */
const videoSeedData = [
    {
        youtubeLink: 'https://www.youtube.com/embed/D5KNbK0EBlM?si=LpH7ZdhYwc2xQI3D',
        title: 'Smart Road Damage Reporting & Rapid Response System',
        representativeName: 'Mr. Prakash Diwanji',
        representativeDesignation: 'Division Head, Road Construction Department, SMC, Solapur',
        problemStatements: [
            { problemId: '693589418e427b64eaaec308', problemTitle: 'Smart Road Damage Reporting & Rapid Response System for Solapur Municipal Corporation' }
        ],
        isActive: true,
        order: 1
    },
    {
        youtubeLink: 'https://www.youtube.com/embed/EaCVz3JBPXA?si=r3qkSM-FudL89flK',
        title: 'Smart Health Solutions for Solapur',
        representativeName: 'Dr. Arundhati Haralkar',
        representativeDesignation: 'Assistant Medical Officer of Health, SMC, Solapur',
        problemStatements: [
            { problemId: '693589418e427b64eaaec30d', problemTitle: 'Smart Health Solutions for Solapur Municipal Corporation' }
        ],
        isActive: true,
        order: 2
    },
    {
        youtubeLink: 'https://www.youtube.com/embed/N6-JU5WyHX8?si=UAi4npoATCfyVDd-',
        title: 'Smart Water Pressure Management',
        representativeName: 'Mr. Satish Ekbote',
        representativeDesignation: 'Assistant Manager, Water Supply Dept., SMC, Solapur',
        problemStatements: [
            { problemId: '693589418e427b64eaaec30a', problemTitle: 'Smart Water Pressure Management for Equitable Water Supply in Solapur Municipal Corporation' }
        ],
        isActive: true,
        order: 3
    },
    {
        youtubeLink: 'https://www.youtube.com/embed/eflkeMjeO20?si=EIOBLbRxkswNTPa6',
        title: 'Smart Traffic & Parking Management',
        representativeName: 'Mr. Tapan Danke',
        representativeDesignation: 'Dept. Engineer & Controlling Officer, Incharge Transport Manager, SMC, Solapur',
        problemStatements: [
            { problemId: '693589418e427b64eaaec30c', problemTitle: 'Smart Traffic and Parking Management System for Solapur Municipal Corporation' }
        ],
        isActive: true,
        order: 4
    }
];

const seedVideos = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hacksphere';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        // Clear existing videos
        await Video.deleteMany({});
        console.log('Cleared existing videos');

        // Insert all videos
        const result = await Video.insertMany(videoSeedData);
        console.log(`✅ Seeded ${result.length} videos`);

        result.forEach(v => {
            console.log(`  📹 "${v.title}" — ${v.representativeName} (${v.problemStatements.length} problem tag(s))`);
        });

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding videos:', error);
        process.exit(1);
    }
};

seedVideos();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Problem from '../models/Problem';

dotenv.config();

const videoData = [
    {
        _id: '693589418e427b64eaaec30a',
        youtubeLink: 'https://www.youtube.com/embed/N6-JU5WyHX8?si=UAi4npoATCfyVDd-',
        representativeName: 'Mr. Satish Ekbote',
        representativeDesignation: 'Assistant Manager, Water Supply Dept., SMC, Solapur'
    },
    {
        _id: '693589418e427b64eaaec30c',
        youtubeLink: 'https://www.youtube.com/embed/eflkeMjeO20?si=EIOBLbRxkswNTPa6',
        representativeName: 'Mr. Tapan Danke',
        representativeDesignation: 'Dept. Engineer & Controlling Officer, Incharge Transport Manager, SMC, Solapur'
    },
    {
        _id: '693589418e427b64eaaec308',
        youtubeLink: 'https://www.youtube.com/embed/D5KNbK0EBlM?si=LpH7ZdhYwc2xQI3D',
        representativeName: 'Mr. Prakash Diwanji',
        representativeDesignation: 'Division Head, Road Construction Department, SMC, Solapur'
    },
    {
        _id: '693589418e427b64eaaec30d',
        youtubeLink: 'https://www.youtube.com/embed/EaCVz3JBPXA?si=r3qkSM-FudL89flK',
        representativeName: 'Dr. Arundhati Haralkar',
        representativeDesignation: 'Assistant Medical Officer of Health, SMC, Solapur'
    }
];

const seedVideoLinks = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hacksphere';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        for (const data of videoData) {
            const result = await Problem.findByIdAndUpdate(
                data._id,
                {
                    youtubeLink: data.youtubeLink,
                    representativeName: data.representativeName,
                    representativeDesignation: data.representativeDesignation
                },
                { new: true }
            );
            if (result) {
                console.log(`✅ Updated "${result.title}" with video link`);
            } else {
                console.log(`⚠️ Problem with ID ${data._id} not found`);
            }
        }

        console.log('\n🎬 Video link seeding complete!');
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding video links:', error);
        process.exit(1);
    }
};

seedVideoLinks();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import FAQ from '../models/FAQ';

dotenv.config();

const seedFAQs = [
    // General Questions
    { question: 'Who can participate in the hackathon?', answer: 'The hackathon is open to students from all colleges and universities. Teams can have 4-6 members from the same institute.', section: 'General', order: 0 },
    { question: 'Is there a registration fee?', answer: 'No, participation in the MIT Vishwaprayag University Hackathon is completely free. There are no registration or participation fees.', section: 'General', order: 1 },
    { question: 'What is the hackathon duration?', answer: 'The hackathon is a 48-hour continuous event. Teams will have 2 full days to develop their solutions from scratch.', section: 'General', order: 2 },
    { question: 'Do I need to have a team before registering?', answer: 'Yes, you need to form a team of 4-5 members before registration. All team members must be from the same institute.', section: 'General', order: 3 },
    { question: 'Can I participate remotely?', answer: 'The hackathon will be conducted in-person at MIT-VPU campus. Remote participation may be considered on a case-by-case basis.', section: 'General', order: 4 },

    // Technical Questions
    { question: 'What should we bring to the hackathon?', answer: 'Bring your laptops, chargers, required software installations, and any hardware components if needed. Food and basic amenities will be provided.', section: 'Technical', order: 0 },
    { question: 'Are there any specific technologies we must use?', answer: 'No, you are free to use any technology stack, programming language, or framework that best suits your problem statement.', section: 'Technical', order: 1 },
    { question: 'How will projects be evaluated?', answer: 'Projects will be judged based on Innovation (25%), Technical Implementation (25%), Impact & Feasibility (20%), Presentation (15%), and Completion (15%).', section: 'Technical', order: 2 },
    { question: 'What are the prizes?', answer: 'The total prize pool is ₹5 Lakh+, with prizes for top 3 teams, best innovation, and various category awards.', section: 'Technical', order: 3 },
    { question: 'Can we use pre-written code?', answer: 'You can use open-source libraries and frameworks, but the core application logic must be developed during the hackathon period.', section: 'Technical', order: 4 },

    // Evaluation Questions
    { question: 'Will mentors be available during the hackathon?', answer: 'Yes, experienced mentors from industry and academia will be available throughout to guide teams.', section: 'Evaluation', order: 0 },
    { question: 'What is the role of a SPOC?', answer: 'SPOC (Single Point of Contact) is a faculty member from each institute who coordinates and manages all teams from their institution.', section: 'Evaluation', order: 1 },
    { question: 'How do we submit our project?', answer: 'Submissions include a working demo, documentation, GitHub repository, and a 5-minute video demonstration, all submitted through the portal.', section: 'Evaluation', order: 2 },
    { question: 'What happens after Round 1?', answer: 'Shortlisted teams from Round 1 advance to Round 2 for detailed evaluation, followed by a grand finale with presentations.', section: 'Evaluation', order: 3 },
    { question: 'Will accommodation be provided?', answer: 'Accommodation arrangements can be made for outstation teams. Please contact the organizing committee for details.', section: 'Evaluation', order: 4 },
];

const seed = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hacksphere';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        const existingCount = await FAQ.countDocuments();
        if (existingCount > 0) {
            console.log(`⚠️ ${existingCount} FAQs already exist. Skipping seed.`);
            console.log('   To re-seed, delete existing FAQs first.');
        } else {
            await FAQ.insertMany(seedFAQs);
            console.log(`✅ Seeded ${seedFAQs.length} FAQs across 3 sections`);
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding FAQs:', error);
        process.exit(1);
    }
};

seed();

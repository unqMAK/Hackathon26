import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db';
import seedAdmin from './seedAdmin';
import { seedProblemsOnStartup } from './config/seedProblems';

// Load env vars
dotenv.config();

// Connect to database and seed initial data
connectDB().then(async () => {
    await seedAdmin();
    await seedProblemsOnStartup();
});

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import teamRoutes from './routes/teamRoutes';
import notificationRoutes from './routes/notificationRoutes';
import problemRoutes from './routes/problemRoutes';
import submissionRoutes from './routes/submissionRoutes';
import adminRoutes from './routes/adminRoutes';
import settingsRoutes from './routes/settingsRoutes';
import spocRoutes from './routes/spocRoutes';
import countdownRoutes from './routes/countdownRoutes';
import rubricRoutes from './routes/rubricRoutes';
import evaluationRoutes from './routes/evaluationRoutes';
import resultsSettingsRoutes from './routes/resultsSettingsRoutes';
import announcementRoutes from './routes/announcementRoutes';
import mentorRoutes from './routes/mentorRoutes';
import feedbackRoutes from './routes/feedbackRoutes';
import timelineRoutes from './routes/timelineRoutes';

import publicRoutes from './routes/publicRoutes';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
// app.use('/api/team-invites', teamInviteRoutes); // Removed
// app.use('/api/team-join', teamJoinRequestRoutes); // Removed
app.use('/api/notifications', notificationRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/hackathon', settingsRoutes);
app.use('/api/spoc', spocRoutes);
// app.use('/api/invites', inviteRoutes); // Removed
app.use('/api/countdown', countdownRoutes);
app.use('/api/rubrics', rubricRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/settings', resultsSettingsRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/timeline', timelineRoutes);
import contactRoutes from './routes/contactRoutes';
app.use('/api/contact', contactRoutes);
import certificateRoutes from './routes/certificateRoutes';
app.use('/api/certificates', certificateRoutes);
import instituteRoutes from './routes/instituteRoutes';
app.use('/api/institutes', instituteRoutes);

// Serve static certificates
import path from 'path';
app.use('/certificates', express.static(path.join(__dirname, '../public/certificates')));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

app.use('/api/public', publicRoutes);

// Routes Placeholder
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error Handling Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('SERVER ERROR:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT} (accessible at http://10.1.30.216:${PORT})`);
});

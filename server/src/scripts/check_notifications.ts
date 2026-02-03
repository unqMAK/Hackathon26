
import mongoose from 'mongoose';
import Notification from '../models/Notification';
import Team from '../models/Team';
import dotenv from 'dotenv';
import path from 'path';

// Fix env path
dotenv.config({ path: path.join(__dirname, '../../.env') });

const checkNotifications = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('Connected to MongoDB');

        // Find recent notifications
        const notifications = await Notification.find().sort({ createdAt: -1 }).limit(5);
        console.log('Recent Notifications:', JSON.stringify(notifications, null, 2));

        // Find a recent team
        const team = await Team.findOne().sort({ updatedAt: -1 });
        if (team) {
            console.log('Most recent team:', team.name, team.status, team._id);
            // Find notifications for this team
            const teamNotifs = await Notification.find({ relatedTeamId: team._id });
            console.log('Notifications for this team:', JSON.stringify(teamNotifs, null, 2));
        } else {
            console.log('No teams found');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

checkNotifications();

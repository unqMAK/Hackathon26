import mongoose from 'mongoose';
import dotenv from 'dotenv';
import '../models/User'; // Import to register model

dotenv.config();

const checkDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hacksphere');
        console.log('✅ Connected to MongoDB');

        // Get User model
        const User = mongoose.model('User');

        // Count total users
        const totalUsers = await User.countDocuments();
        console.log(`\n📊 Total Users: ${totalUsers}`);

        // Count by role
        const students = await User.countDocuments({ role: 'student' });
        const admins = await User.countDocuments({ role: 'admin' });
        const judges = await User.countDocuments({ role: 'judge' });
        const mentors = await User.countDocuments({ role: 'mentor' });
        const spocs = await User.countDocuments({ role: 'spoc' });

        console.log('\n👥 Users by Role:');
        console.log(`   Students: ${students}`);
        console.log(`   Admins: ${admins}`);
        console.log(`   Judges: ${judges}`);
        console.log(`   Mentors: ${mentors}`);
        console.log(`   SPOCs: ${spocs}`);

        // Get all users
        const users = await User.find({}, 'name email role createdAt').sort({ createdAt: -1 });

        console.log('\n📋 All Users:');
        console.log('─'.repeat(80));
        users.forEach((user, index) => {
            const date = new Date(user.createdAt).toLocaleDateString();
            console.log(`${index + 1}. ${user.name} (${user.email})`);
            console.log(`   Role: ${user.role.toUpperCase()} | Created: ${date}`);
            console.log('─'.repeat(80));
        });

        await mongoose.connection.close();
        console.log('\n✅ Database check complete');
    } catch (error: any) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

checkDatabase();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const createAdminUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hacksphere');
        console.log('✅ Connected to MongoDB');

        // Define admin credentials
        const adminEmail = 'admin@hacksphere.com';
        const adminPassword = 'Admin@123';
        const adminName = 'HackSphere Admin';

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        // Check if admin already exists
        const existingAdmin = await mongoose.connection.db!.collection('users').findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('⚠️  Admin user already exists!');
            console.log('\n📧 Email:', adminEmail);
            console.log('🔑 Password:', adminPassword);
            console.log('👤 Role: admin\n');
        } else {
            // Create admin user
            await mongoose.connection.db!.collection('users').insertOne({
                name: adminName,
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                instituteId: 'ADMIN001',
                createdAt: new Date(),
                updatedAt: new Date()
            });

            console.log('✅ Admin user created successfully!\n');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📧 Email    :', adminEmail);
            console.log('🔑 Password :', adminPassword);
            console.log('👤 Role     : admin');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        }

        // Close connection
        await mongoose.connection.close();
        console.log('✅ Database connection closed');
        process.exit(0);

    } catch (error: any) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

createAdminUser();

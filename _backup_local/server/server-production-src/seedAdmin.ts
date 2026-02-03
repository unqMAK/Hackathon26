import User from './models/User';

const seedAdmin = async () => {
    try {
        const adminEmail = 'admin@smc.gov.in';
        const adminPassword = 'Admin@123';

        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            existingAdmin.password = adminPassword;
            await existingAdmin.save();
            console.log('Admin user exists. Password updated/verified.');
            return;
        }

        const newAdmin = new User({
            name: 'Admin',
            email: adminEmail,
            password: adminPassword,
            role: 'admin',
        });

        await newAdmin.save();
        console.log('Admin user seeded successfully');

    } catch (error) {
        console.error('Error seeding admin user:', error);
    }
};

export default seedAdmin;

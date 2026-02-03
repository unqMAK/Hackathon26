/**
 * Migration Script: Convert Existing Problem Selections to Applications
 * 
 * This script:
 * 1. Finds all teams with problemId set
 * 2. Creates ProblemApplication records for them with status 'pending'
 * 3. Clears the team's problemId (so they can apply to more problems)
 * 4. Sends email notifications to team leaders about this change
 * 
 * Usage: npx ts-node src/scripts/migrateExistingSelections.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Team from '../models/Team';
import ProblemApplication from '../models/ProblemApplication';
import User from '../models/User';
import Problem from '../models/Problem';
import nodemailer from 'nodemailer';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hacksphere';

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendNotificationEmail = async (email: string, name: string, teamName: string, problemTitle: string) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: '🔔 Important Update: Problem Statement Selection Changes - MIT-VPU Hackathon',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #8B2A3B 0%, #E25A2C 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">MIT-VPU Grand Hackathon</h1>
                </div>
                
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #8B2A3B;">Dear ${name},</h2>
                    
                    <p>We have an important update regarding the Problem Statement selection process for your team <strong>"${teamName}"</strong>.</p>
                    
                    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
                        <h3 style="color: #856404; margin-top: 0;">What's Changed?</h3>
                        <ul style="color: #856404;">
                            <li>The problem selection system has been upgraded to an <strong>application-based workflow</strong></li>
                            <li>Your previous selection of "<strong>${problemTitle}</strong>" has been converted to a <strong>pending application</strong></li>
                            <li>You can now <strong>apply to multiple problem statements</strong></li>
                        </ul>
                    </div>
                    
                    <div style="background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0;">
                        <h3 style="color: #155724; margin-top: 0;">New Features Available:</h3>
                        <ul style="color: #155724;">
                            <li><strong>Apply to Multiple Problems:</strong> You're no longer limited to one problem</li>
                            <li><strong>Add Supporting Materials:</strong> Include links, files, or comments to strengthen your application</li>
                            <li><strong>Admin Review:</strong> Applications will be reviewed and approved by the admin team</li>
                        </ul>
                    </div>
                    
                    <div style="background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 15px; margin: 20px 0;">
                        <h3 style="color: #0c5460; margin-top: 0;">What Should You Do?</h3>
                        <p style="color: #0c5460;">
                            1. Login to your dashboard<br>
                            2. Navigate to Problem Statements<br>
                            3. Browse and apply to additional problems if you wish<br>
                            4. Add supporting materials to strengthen your applications
                        </p>
                    </div>
                    
                    <p>Your existing application for "<strong>${problemTitle}</strong>" remains in pending status and will be reviewed by our team.</p>
                    
                    <p>If you have any questions, please don't hesitate to contact us.</p>
                    
                    <p style="margin-top: 30px;">Best regards,<br><strong>MIT-VPU Hackathon Team</strong></p>
                </div>
                
                <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
                    <p>This is an automated message. Please do not reply directly to this email.</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${email}`);
        return true;
    } catch (error) {
        console.error(`❌ Failed to send email to ${email}:`, error);
        return false;
    }
};

const migrate = async () => {
    console.log('🚀 Starting migration...');
    console.log(`📦 Connecting to MongoDB: ${MONGO_URI}`);

    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all teams with problemId set
    const teamsWithProblem = await Team.find({
        problemId: { $ne: null, $exists: true }
    }).populate('leaderId', 'name email');

    console.log(`\n📊 Found ${teamsWithProblem.length} teams with problem selections to migrate\n`);

    let migratedCount = 0;
    let emailsSent = 0;
    let errors: string[] = [];

    for (const team of teamsWithProblem) {
        try {
            console.log(`\n--- Processing Team: ${team.name} ---`);

            // Get problem details
            const problem = await Problem.findById(team.problemId);
            if (!problem) {
                console.log(`⚠️ Problem not found for team ${team.name}, skipping...`);
                continue;
            }

            // Check if application already exists
            const existingApp = await ProblemApplication.findOne({
                teamId: team._id,
                problemId: team.problemId
            });

            if (existingApp) {
                console.log(`⚠️ Application already exists for team ${team.name}, skipping...`);
                continue;
            }

            // Create ProblemApplication record
            await ProblemApplication.create({
                teamId: team._id,
                problemId: team.problemId,
                status: 'pending',
                supportingLinks: [],
                supportingFiles: [],
                comments: 'Migrated from legacy problem selection system',
                submittedBy: team.leaderId._id
            });
            console.log(`✅ Created application for team ${team.name}`);

            // Clear team's problemId
            team.problemId = undefined;
            await team.save();
            console.log(`✅ Cleared problemId for team ${team.name}`);

            migratedCount++;

            // Send email to team leader
            const leader = team.leaderId as any;
            if (leader && leader.email) {
                const emailSent = await sendNotificationEmail(
                    leader.email,
                    leader.name,
                    team.name,
                    problem.title
                );
                if (emailSent) emailsSent++;
            }

        } catch (error: any) {
            const errorMsg = `Error migrating team ${team.name}: ${error.message}`;
            console.error(`❌ ${errorMsg}`);
            errors.push(errorMsg);
        }
    }

    console.log('\n========================================');
    console.log('🎉 Migration Complete!');
    console.log('========================================');
    console.log(`✅ Teams migrated: ${migratedCount}`);
    console.log(`📧 Emails sent: ${emailsSent}`);
    console.log(`❌ Errors: ${errors.length}`);

    if (errors.length > 0) {
        console.log('\nErrors:');
        errors.forEach(e => console.log(`  - ${e}`));
    }

    await mongoose.connection.close();
    console.log('\n📦 Database connection closed');
    process.exit(0);
};

// Run migration
migrate().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});

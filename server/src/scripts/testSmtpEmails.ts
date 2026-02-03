/**
 * SMTP Test Script
 * Creates a test institute, user, and team, then tests various email functionalities
 * 
 * Usage: npx ts-node src/scripts/testSmtpEmails.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Institute from '../models/Institute';
import User from '../models/User';
import Team from '../models/Team';
import nodemailer from 'nodemailer';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hacksphere';
const TEST_EMAIL = 'arvindkulkarni1958@gmail.com';
const TEST_NAME = 'Arvind Kulkarni';

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

async function sendTestEmail(type: string, subject: string, html: string) {
    console.log(`\n📧 Sending ${type} email...`);
    try {
        const result = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: TEST_EMAIL,
            subject,
            html
        });
        console.log(`✅ ${type} email sent successfully!`);
        console.log(`   Message ID: ${result.messageId}`);
        return true;
    } catch (error: any) {
        console.error(`❌ Failed to send ${type} email:`, error.message);
        return false;
    }
}

async function testSmtpEmails() {
    console.log('🚀 SMTP Email Test Script');
    console.log('='.repeat(50));
    console.log(`📧 Email Configuration:`);
    console.log(`   User: ${process.env.SMTP_USER}`);
    console.log(`   Pass: ${process.env.SMTP_PASS ? '****' + process.env.SMTP_PASS.slice(-4) : 'NOT SET'}`);
    console.log(`   Recipient: ${TEST_EMAIL}`);
    console.log('='.repeat(50));

    // Connect to MongoDB
    console.log('\n📦 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    let testInstitute: any = null;
    let testUser: any = null;
    let testTeam: any = null;
    const results: { type: string; success: boolean }[] = [];

    try {
        // 1. Create Test Institute if not exists
        console.log('\n--- Step 1: Creating Test Institute ---');
        testInstitute = await Institute.findOne({ code: 'SMTP_TEST' });
        if (!testInstitute) {
            testInstitute = await Institute.create({
                name: 'SMTP Test Institute',
                code: 'SMTP_TEST',
                isActive: true,
                maxTeams: 10
            });
            console.log('✅ Created test institute: SMTP_TEST');
        } else {
            console.log('ℹ️ Test institute already exists');
        }

        // 2. Create Test User
        console.log('\n--- Step 2: Creating Test User ---');
        testUser = await User.findOne({ email: TEST_EMAIL });
        if (!testUser) {
            const hashedPassword = await bcrypt.hash('TestPass@123', 10);
            testUser = await User.create({
                name: TEST_NAME,
                email: TEST_EMAIL,
                password: hashedPassword,
                phone: '9876543210',
                instituteCode: 'SMTP_TEST',
                instituteName: 'SMTP Test Institute',
                role: 'student',
                isEmailVerified: false
            });
            console.log('✅ Created test user');
        } else {
            console.log('ℹ️ Test user already exists');
        }

        // 3. Test Registration/Welcome Email
        console.log('\n--- Test 1: Registration/Welcome Email ---');
        const registrationSuccess = await sendTestEmail(
            'Registration',
            '🎉 Welcome to MIT-VPU Grand Hackathon 2025-26!',
            `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #8B2A3B 0%, #E25A2C 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">Welcome to MIT-VPU Grand Hackathon!</h1>
                </div>
                
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #8B2A3B;">Hello ${TEST_NAME}! 👋</h2>
                    
                    <p>Congratulations! Your registration for the <strong>MIT-VPU Grand Hackathon 2025-26</strong> has been received.</p>
                    
                    <div style="background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0;">
                        <h3 style="color: #155724; margin-top: 0;">Account Details</h3>
                        <p style="color: #155724; margin: 0;">
                            <strong>Email:</strong> ${TEST_EMAIL}<br>
                            <strong>Institute:</strong> SMTP Test Institute
                        </p>
                    </div>
                    
                    <p>Next steps:</p>
                    <ol>
                        <li>Verify your email address</li>
                        <li>Create or join a team</li>
                        <li>Select a problem statement</li>
                    </ol>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="https://smc-mitvpuhackathon.in/login" style="background: linear-gradient(135deg, #8B2A3B 0%, #E25A2C 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">Login to Dashboard</a>
                    </div>
                    
                    <p style="margin-top: 30px;">Best regards,<br><strong>MIT-VPU Hackathon Team</strong></p>
                </div>
            </div>
            `
        );
        results.push({ type: 'Registration', success: registrationSuccess });

        // 4. Test Password Reset Email
        console.log('\n--- Test 2: Password Reset Email ---');
        const resetToken = 'TEST_RESET_TOKEN_' + Date.now();
        const passwordResetSuccess = await sendTestEmail(
            'Password Reset',
            '🔐 Password Reset Request - MIT-VPU Hackathon',
            `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #8B2A3B 0%, #E25A2C 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">Password Reset Request</h1>
                </div>
                
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #8B2A3B;">Hello ${TEST_NAME},</h2>
                    
                    <p>We received a request to reset your password for your MIT-VPU Hackathon account.</p>
                    
                    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
                        <p style="color: #856404; margin: 0;">
                            ⚠️ This link will expire in <strong>1 hour</strong>
                        </p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://smc-mitvpuhackathon.in/reset-password?token=${resetToken}" style="background: linear-gradient(135deg, #8B2A3B 0%, #E25A2C 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">Reset Password</a>
                    </div>
                    
                    <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
                    
                    <p style="margin-top: 30px;">Best regards,<br><strong>MIT-VPU Hackathon Team</strong></p>
                </div>
            </div>
            `
        );
        results.push({ type: 'Password Reset', success: passwordResetSuccess });

        // 5. Test Team Approval Email
        console.log('\n--- Test 3: Team Approval Email ---');
        const approvalSuccess = await sendTestEmail(
            'Team Approval',
            '✅ Your Team Has Been Approved! - MIT-VPU Hackathon',
            `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">🎉 Team Approved!</h1>
                </div>
                
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #28a745;">Congratulations ${TEST_NAME}!</h2>
                    
                    <p>Great news! Your team <strong>"Test Innovation Squad"</strong> has been <strong style="color: #28a745;">APPROVED</strong> by your SPOC.</p>
                    
                    <div style="background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0;">
                        <h3 style="color: #155724; margin-top: 0;">What's Next?</h3>
                        <ol style="color: #155724; margin: 0; padding-left: 20px;">
                            <li>Login to your dashboard</li>
                            <li>Browse Problem Statements</li>
                            <li>Apply for problems that interest you</li>
                            <li>Start working on your solution!</li>
                        </ol>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="https://smc-mitvpuhackathon.in/student/dashboard" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">Go to Dashboard</a>
                    </div>
                    
                    <p style="margin-top: 30px;">Best of luck!<br><strong>MIT-VPU Hackathon Team</strong></p>
                </div>
            </div>
            `
        );
        results.push({ type: 'Team Approval', success: approvalSuccess });

        // 6. Test Team Rejection Email
        console.log('\n--- Test 4: Team Rejection Email ---');
        const rejectionSuccess = await sendTestEmail(
            'Team Rejection',
            '❌ Team Registration Update - MIT-VPU Hackathon',
            `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">Team Registration Update</h1>
                </div>
                
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #dc3545;">Hello ${TEST_NAME},</h2>
                    
                    <p>We regret to inform you that your team registration has not been approved at this time.</p>
                    
                    <div style="background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0;">
                        <h3 style="color: #721c24; margin-top: 0;">Reason</h3>
                        <p style="color: #721c24; margin: 0;">
                            Team composition does not meet minimum requirements. Please ensure you have 3-4 members from the same institute.
                        </p>
                    </div>
                    
                    <div style="background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 15px; margin: 20px 0;">
                        <h3 style="color: #0c5460; margin-top: 0;">What Can You Do?</h3>
                        <ul style="color: #0c5460; margin: 0; padding-left: 20px;">
                            <li>Review the team requirements</li>
                            <li>Add more team members if needed</li>
                            <li>Contact your SPOC for clarification</li>
                            <li>Resubmit your team registration</li>
                        </ul>
                    </div>
                    
                    <p style="margin-top: 30px;">Don't give up! We hope to see you in the hackathon.<br><strong>MIT-VPU Hackathon Team</strong></p>
                </div>
            </div>
            `
        );
        results.push({ type: 'Team Rejection', success: rejectionSuccess });

        // 7. Test Application Approved Email
        console.log('\n--- Test 5: Application Approved Email ---');
        const appApprovedSuccess = await sendTestEmail(
            'Application Approved',
            '✅ Problem Statement Application Approved! - MIT-VPU Hackathon',
            `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">🎯 Application Shortlisted!</h1>
                </div>
                
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #28a745;">Congratulations ${TEST_NAME}!</h2>
                    
                    <p>Your application for the problem statement has been <strong style="color: #28a745;">APPROVED</strong>!</p>
                    
                    <div style="background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0;">
                        <h3 style="color: #155724; margin-top: 0;">Problem Statement</h3>
                        <p style="color: #155724; margin: 0;">
                            <strong>Title:</strong> AI-Powered Water Quality Monitoring System<br>
                            <strong>Category:</strong> Environmental Technology
                        </p>
                    </div>
                    
                    <p>Your team is now officially assigned to this problem. Start working on your innovative solution!</p>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="https://smc-mitvpuhackathon.in/student/problems" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">View Your Problem</a>
                    </div>
                    
                    <p style="margin-top: 30px;">Best of luck with your project!<br><strong>MIT-VPU Hackathon Team</strong></p>
                </div>
            </div>
            `
        );
        results.push({ type: 'Application Approved', success: appApprovedSuccess });

        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('📊 SMTP TEST RESULTS');
        console.log('='.repeat(50));

        let successCount = 0;
        let failCount = 0;

        results.forEach(r => {
            const icon = r.success ? '✅' : '❌';
            console.log(`${icon} ${r.type}: ${r.success ? 'SUCCESS' : 'FAILED'}`);
            if (r.success) successCount++;
            else failCount++;
        });

        console.log('='.repeat(50));
        console.log(`Total: ${successCount} passed, ${failCount} failed`);
        console.log('='.repeat(50));

        if (successCount === results.length) {
            console.log('\n🎉 ALL EMAILS SENT SUCCESSFULLY!');
            console.log(`📬 Please check the inbox of: ${TEST_EMAIL}`);
        } else {
            console.log('\n⚠️ Some emails failed. Check the EMAIL_USER and EMAIL_PASS in .env');
        }

    } catch (error: any) {
        console.error('\n❌ Error during testing:', error.message);
    } finally {
        // Cleanup - optional: remove test data
        // await User.deleteOne({ email: TEST_EMAIL });
        // await Institute.deleteOne({ code: 'SMTP_TEST' });

        await mongoose.connection.close();
        console.log('\n📦 Database connection closed');
        process.exit(0);
    }
}

// Run tests
testSmtpEmails().catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
});

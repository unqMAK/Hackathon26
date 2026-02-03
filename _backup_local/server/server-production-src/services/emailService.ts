import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

class EmailService {
    private transporter;

    constructor() {
        // Log environment variable status for debugging
        console.log('EmailService Config:', {
            host: process.env.SMTP_HOST || 'Not Set',
            port: process.env.SMTP_PORT || 'Not Set',
            user: process.env.SMTP_USER ? 'Set' : 'Not Set'
        });

        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    async verifyConnection() {
        try {
            await this.transporter.verify();
            console.log('✅ Email Server is ready to take our messages');
            return true;
        } catch (error) {
            console.error('❌ Email Server connection error:', error);
            return false;
        }
    }

    async sendCredentialEmail(to: string, name: string, role: string, password?: string, isExisting: boolean = false) {
        try {
            // Use project-relative path for logo
            const logoPath = path.join(__dirname, '../../public/uploads/mit-vpu-logo.png');

            let subject = 'Hacksphere Governance Portal - Account Update';
            let mainContent = '';
            let credentialSection = '';

            // Determine Password Text
            const passwordDisplay = password && password !== 'Use your chosen password'
                ? `<span style="font-family: monospace; background: #fff; padding: 4px 8px; border-radius: 4px; border: 1px solid #ddd; color: #d946ef; font-weight: bold; font-size: 1.1em;">${password}</span>`
                : `<span style="font-style: italic; color: #666;">(Use the password you set during registration)</span>`;

            if (isExisting) {
                subject = `Team Assigned - ${role} Role`;
                mainContent = `
                    <p>A new team has been registered under your institute, and you have been assigned as their <strong>${role}</strong>.</p>
                    <p>You can login to your existing dashboard to view the team details.</p>
                `;
                credentialSection = `
                    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6b7280;">
                        <p style="margin: 0; color: #374151;">Please use your existing credentials to login.</p>
                    </div>
                `;
            } else {
                subject = `Account Credentials - ${role} Role`;
                mainContent = `
                    <p>Welcome to <strong>MIT Vishwaprayag University Hacksphere</strong>.</p>
                    <p>Your account has been created successfully as a <strong>${role}</strong>.</p>
                `;
                credentialSection = `
                    <div style="background-color: #fff1f2; padding: 20px; border-radius: 8px; border: 1px solid #fda4af; margin: 25px 0;">
                        <h3 style="margin-top: 0; color: #be123c; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px;">Your Login Credentials</h3>
                        <div style="margin-top: 15px;">
                            <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${to}" style="color: #be123c; text-decoration: none;">${to}</a></p>
                            <p style="margin: 8px 0;"><strong>Password:</strong> ${passwordDisplay}</p>
                        </div>
                    </div>
                    <p style="color: #666; font-size: 0.9em; margin-top: 15px;">* For security reasons, please change your password after your first login.</p>
                `;
            }

            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; color: #1f2937;">
                    <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden;">
                        
                        <!-- Header with Logo -->
                        <div style="background-color: #580B18; padding: 30px 40px; text-align: center;">
                            <img src="cid:logo" alt="MIT Vishwaprayag University" style="max-width: 200px; height: auto;">
                        </div>

                        <!-- Body Content -->
                        <div style="padding: 40px;">
                            <h2 style="color: #111827; margin-top: 0; font-size: 24px; font-weight: 600;">Hello, ${name}</h2>
                            
                            <div style="font-size: 16px; line-height: 1.6; color: #4b5563;">
                                ${mainContent}
                                ${credentialSection}
                            </div>

                            <!-- CTA Button -->
                            <div style="text-align: center; margin-top: 35px;">
                                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" style="display: inline-block; background-color: #D97706; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; transition: background-color 0.2s;">Access Portal</a>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; font-size: 12px; color: #9ca3af;">&copy; ${new Date().getFullYear()} MIT Vishwaprayag University. All rights reserved.</p>
                            <p style="margin: 5px 0 0; font-size: 12px; color: #9ca3af;">This is an automated message, please do not reply.</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            const info = await this.transporter.sendMail({
                from: `"MIT-VPU Hacksphere" <${process.env.SMTP_USER}>`,
                to,
                subject,
                html: htmlContent,
                attachments: [{
                    filename: 'logo.png',
                    path: logoPath,
                    cid: 'logo' // same cid value as in the html img src
                }]
            });

            console.log(`📧 Email sent to ${to}: ${info.messageId}`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to send email to ${to}:`, error);
            return false;
        }
    }

    async sendWelcomeEmail(to: string, name: string, teamName: string) {
        try {
            const logoPath = path.join(__dirname, '../../public/uploads/mit-vpu-logo.png');
            const subject = `Welcome to Hacksphere - Team ${teamName} Approved!`;

            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; color: #1f2937;">
                    <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden;">
                        <div style="background-color: #580B18; padding: 30px 40px; text-align: center;">
                            <img src="cid:logo" alt="MIT Vishwaprayag University" style="max-width: 200px; height: auto;">
                        </div>
                        <div style="padding: 40px;">
                            <h2 style="color: #111827; margin-top: 0; font-size: 24px; font-weight: 600;">Congratulations, ${name}!</h2>
                            <div style="font-size: 16px; line-height: 1.6; color: #4b5563;">
                                <p>We are thrilled to inform you that your team <strong>"${teamName}"</strong> has been officially approved for <strong>MIT Vishwaprayag University Hacksphere</strong>!</p>
                                <p>As the Team Leader, you now have access to the student dashboard where you can manage your team's progress, select problem statements, and submit your project.</p>
                                <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; border: 1px solid #d1fae5; margin: 25px 0;">
                                    <p style="margin: 0; color: #065f46; font-weight: 600;">Next Steps:</p>
                                    <ul style="margin: 10px 0 0; padding-left: 20px; color: #065f46;">
                                        <li>Login to the portal using the credentials you set during registration.</li>
                                        <li>Brainstorm with your team on the available problem statements.</li>
                                        <li>Start building your innovative solution!</li>
                                    </ul>
                                </div>
                                <p>We wish you and your team the very best for the hackathon. Let's build something amazing!</p>
                            </div>
                            <div style="text-align: center; margin-top: 35px;">
                                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" style="display: inline-block; background-color: #D97706; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; transition: background-color 0.2s;">Login to Dashboard</a>
                            </div>
                        </div>
                        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; font-size: 12px; color: #9ca3af;">&copy; ${new Date().getFullYear()} MIT Vishwaprayag University. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            const info = await this.transporter.sendMail({
                from: `"MIT-VPU Hacksphere" <${process.env.SMTP_USER}>`,
                to,
                subject,
                html: htmlContent,
                attachments: [{
                    filename: 'logo.png',
                    path: logoPath,
                    cid: 'logo'
                }]
            });

            console.log(`📧 Welcome Email sent to ${to}: ${info.messageId}`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to send welcome email to ${to}:`, error);
            return false;
        }
    }
}

export default new EmailService();

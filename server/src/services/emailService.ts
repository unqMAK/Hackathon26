import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

class EmailService {
    private transporter;
    private logoPath: string;
    private smcLogoPath: string;

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
            // Add timeouts to prevent blocking the approval flow
            connectionTimeout: 5000, // 5 seconds to establish connection
            greetingTimeout: 5000,   // 5 seconds for SMTP greeting
            socketTimeout: 10000,    // 10 seconds for socket operations
        });

        // Use GIF logo for better visual appeal
        this.logoPath = path.join(__dirname, '../../public/uploads/mit-vpu-logo.gif');
        this.smcLogoPath = path.join(__dirname, '../../public/uploads/mit-vpu-logo.png'); // fallback
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

    // Professional email header with SAMVED branding
    private getEmailHeader(): string {
        return `
            <!-- Header with Logo and SAMVED Branding -->
            <div style="background: linear-gradient(135deg, #580B18 0%, #8B2A3B 50%, #E25A2C 100%); padding: 35px 40px; text-align: center;">
                <img src="cid:logo" alt="MIT Vishwaprayag University" style="max-width: 180px; height: auto; margin-bottom: 15px;">
                <h1 style="color: #ffffff; margin: 10px 0 5px; font-size: 28px; font-weight: 700; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">SAMVED</h1>
                <p style="color: #FFD93D; margin: 0; font-size: 14px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">A Smart Governance Hackathon</p>
            </div>
            <!-- Sub-header with organizers -->
            <div style="background-color: #f8f9fa; padding: 12px 20px; text-align: center; border-bottom: 3px solid #E25A2C;">
                <p style="margin: 0; font-size: 12px; color: #666; font-weight: 500;">
                    Organised by <strong style="color: #580B18;">MIT Vishwaprayag University, Solapur</strong> 
                    in coordination with <strong style="color: #8B2A3B;">Solapur Municipal Corporation</strong>
                </p>
            </div>
        `;
    }

    // Professional email footer
    private getEmailFooter(): string {
        return `
            <div style="background: linear-gradient(135deg, #1f2937 0%, #374151 100%); padding: 30px 40px; text-align: center;">
                <p style="margin: 0 0 10px; font-size: 14px; color: #d1d5db; font-weight: 500;">
                    SAMVED - A Smart Governance Hackathon 2025-26
                </p>
                <p style="margin: 0 0 15px; font-size: 12px; color: #9ca3af;">
                    MIT Vishwaprayag University, Solapur | Solapur Municipal Corporation
                </p>
                <div style="margin: 15px 0;">
                    <a href="https://smc-mitvpuhackathon.in" style="color: #FFD93D; text-decoration: none; font-size: 12px; font-weight: 600;">Visit Official Website</a>
                    <span style="color: #6b7280; margin: 0 10px;">|</span>
                    <a href="mailto:hackathon@mitvpu.edu.in" style="color: #FFD93D; text-decoration: none; font-size: 12px; font-weight: 600;">Contact Support</a>
                </div>
                <p style="margin: 15px 0 0; font-size: 11px; color: #6b7280;">
                    © ${new Date().getFullYear()} MIT Vishwaprayag University. All rights reserved.
                </p>
                <p style="margin: 5px 0 0; font-size: 10px; color: #6b7280;">
                    This is an automated message from the SAMVED Hackathon Portal. Please do not reply directly to this email.
                </p>
            </div>
        `;
    }

    // Base email template wrapper
    private wrapEmail(content: string): string {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>SAMVED Hackathon</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; color: #1f2937;">
                <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.2); overflow: hidden;">
                    ${this.getEmailHeader()}
                    <div style="padding: 40px;">
                        ${content}
                    </div>
                    ${this.getEmailFooter()}
                </div>
            </body>
            </html>
        `;
    }

    async sendCredentialEmail(to: string, name: string, role: string, password?: string, isExisting: boolean = false) {
        try {
            let subject = 'SAMVED Hackathon - Account Update';
            let mainContent = '';
            let credentialSection = '';

            // Determine Password Text
            const passwordDisplay = password && password !== 'Use your chosen password'
                ? `<span style="font-family: 'Courier New', monospace; background: linear-gradient(135deg, #fff 0%, #f0f9ff 100%); padding: 8px 16px; border-radius: 6px; border: 2px solid #0ea5e9; color: #0369a1; font-weight: bold; font-size: 1.15em; display: inline-block;">${password}</span>`
                : `<span style="font-style: italic; color: #64748b;">(Use the password you set during registration)</span>`;

            if (isExisting) {
                subject = `SAMVED Hackathon - Team Assigned (${role} Role)`;
                mainContent = `
                    <p style="font-size: 16px; line-height: 1.7; color: #374151;">
                        We are pleased to inform you that a new team has been registered under your institute for the 
                        <strong style="color: #580B18;">SAMVED - A Smart Governance Hackathon</strong>, and you have been assigned as their 
                        <strong style="color: #0ea5e9;">${role}</strong>.
                    </p>
                    <p style="font-size: 16px; line-height: 1.7; color: #374151;">
                        You can access your existing dashboard to view and manage the team details.
                    </p>
                `;
                credentialSection = `
                    <div style="background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 5px solid #64748b;">
                        <p style="margin: 0; color: #475569; font-weight: 600;">
                            ℹ️ Please use your existing credentials to login to the portal.
                        </p>
                    </div>
                `;
            } else {
                subject = `SAMVED Hackathon - Account Credentials (${role} Role)`;
                mainContent = `
                    <p style="font-size: 16px; line-height: 1.7; color: #374151;">
                        Welcome to <strong style="color: #580B18;">SAMVED - A Smart Governance Hackathon</strong>!
                    </p>
                    <p style="font-size: 16px; line-height: 1.7; color: #374151;">
                        Your account has been successfully created as a <strong style="color: #0ea5e9;">${role}</strong> 
                        for the hackathon organised by MIT Vishwaprayag University, Solapur in coordination with 
                        Solapur Municipal Corporation.
                    </p>
                `;
                credentialSection = `
                    <div style="background: linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%); padding: 25px; border-radius: 12px; border: 2px solid #fca5a5; margin: 25px 0;">
                        <h3 style="margin: 0 0 15px; color: #991b1b; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center;">
                            🔐 Your Login Credentials
                        </h3>
                        <div style="background: #ffffff; padding: 15px; border-radius: 8px;">
                            <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${to}" style="color: #dc2626; text-decoration: none; font-weight: 600;">${to}</a></p>
                            <p style="margin: 8px 0;"><strong>Password:</strong> ${passwordDisplay}</p>
                        </div>
                    </div>
                    <p style="color: #64748b; font-size: 13px; margin-top: 15px; padding: 10px; background: #fefce8; border-radius: 6px; border-left: 4px solid #eab308;">
                        ⚠️ For security, please change your password after your first login.
                    </p>
                `;
            }

            const content = `
                <h2 style="color: #111827; margin: 0 0 20px; font-size: 26px; font-weight: 700;">
                    Hello, ${name}! 👋
                </h2>
                <div style="font-size: 16px; line-height: 1.7; color: #4b5563;">
                    ${mainContent}
                    ${credentialSection}
                </div>
                <div style="text-align: center; margin-top: 35px;">
                    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" 
                       style="display: inline-block; background: linear-gradient(135deg, #D97706 0%, #ea580c 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 15px rgba(217, 119, 6, 0.4); transition: all 0.3s;">
                        🚀 Access Portal
                    </a>
                </div>
            `;

            const info = await this.transporter.sendMail({
                from: `"SAMVED Hackathon | MIT-VPU" <${process.env.SMTP_USER}>`,
                to,
                subject,
                html: this.wrapEmail(content),
                attachments: [{
                    filename: 'mit-vpu-logo.gif',
                    path: this.logoPath,
                    cid: 'logo'
                }]
            });

            console.log(`📧 Credential Email sent to ${to}: ${info.messageId}`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to send credential email to ${to}:`, error);
            return false;
        }
    }

    async sendWelcomeEmail(to: string, name: string, teamName: string) {
        try {
            const subject = `🎉 SAMVED Hackathon - Team "${teamName}" Approved!`;

            const content = `
                <h2 style="color: #111827; margin: 0 0 20px; font-size: 26px; font-weight: 700;">
                    Congratulations, ${name}! 🎊
                </h2>
                <div style="font-size: 16px; line-height: 1.7; color: #4b5563;">
                    <p>
                        We are thrilled to inform you that your team <strong style="color: #059669;">"${teamName}"</strong> 
                        has been officially approved for <strong style="color: #580B18;">SAMVED - A Smart Governance Hackathon</strong>!
                    </p>
                    <p>
                        This hackathon is organised by <strong>MIT Vishwaprayag University, Solapur</strong> in coordination with 
                        <strong>Solapur Municipal Corporation</strong> to foster innovation in smart governance solutions.
                    </p>
                    
                    <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); padding: 25px; border-radius: 12px; border: 2px solid #a7f3d0; margin: 25px 0;">
                        <h3 style="margin: 0 0 15px; color: #065f46; font-size: 16px; display: flex; align-items: center;">
                            📋 Next Steps
                        </h3>
                        <ul style="margin: 10px 0 0; padding-left: 20px; color: #047857;">
                            <li style="margin-bottom: 8px;">Login to the portal using your registration credentials</li>
                            <li style="margin-bottom: 8px;">Explore the available problem statements</li>
                            <li style="margin-bottom: 8px;">Brainstorm with your team and select a challenge</li>
                            <li style="margin-bottom: 0;">Start building your innovative solution!</li>
                        </ul>
                    </div>
                    
                    <p style="font-size: 18px; font-weight: 600; color: #374151; text-align: center; margin-top: 30px;">
                        🚀 We wish you and your team the very best. Let's build something amazing together!
                    </p>
                </div>
                
                <div style="text-align: center; margin-top: 35px;">
                    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" 
                       style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 15px rgba(5, 150, 105, 0.4);">
                        🎯 Access Your Dashboard
                    </a>
                </div>
            `;

            const info = await this.transporter.sendMail({
                from: `"SAMVED Hackathon | MIT-VPU" <${process.env.SMTP_USER}>`,
                to,
                subject,
                html: this.wrapEmail(content),
                attachments: [{
                    filename: 'mit-vpu-logo.gif',
                    path: this.logoPath,
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

    async sendRejectionEmail(to: string, name: string, teamName: string, reason: string) {
        try {
            const subject = `SAMVED Hackathon - Registration Update for "${teamName}"`;

            const content = `
                <h2 style="color: #111827; margin: 0 0 20px; font-size: 26px; font-weight: 700;">
                    Hello, ${name}
                </h2>
                <div style="font-size: 16px; line-height: 1.7; color: #4b5563;">
                    <p>
                        We regret to inform you that your team <strong style="color: #dc2626;">"${teamName}"</strong> 
                        registration for <strong style="color: #580B18;">SAMVED - A Smart Governance Hackathon</strong> 
                        could not be approved at this time.
                    </p>
                    
                    <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); padding: 25px; border-radius: 12px; border: 2px solid #fca5a5; margin: 25px 0;">
                        <h3 style="margin: 0 0 10px; color: #991b1b; font-size: 15px;">
                            📝 Reason for Rejection:
                        </h3>
                        <p style="margin: 0; color: #7f1d1d; background: #ffffff; padding: 15px; border-radius: 8px; font-weight: 500;">
                            ${reason || 'No specific reason provided. Please contact the administrator for more details.'}
                        </p>
                    </div>
                    
                    <p>
                        If you believe this was an error or have questions, please don't hesitate to reach out to our support team. 
                        We are here to help you through the process.
                    </p>
                    
                    <p style="color: #64748b; font-size: 14px; margin-top: 20px;">
                        This hackathon is organised by MIT Vishwaprayag University, Solapur in coordination with Solapur Municipal Corporation.
                    </p>
                </div>
                
                <div style="text-align: center; margin-top: 35px;">
                    <a href="mailto:hackathon@mitvpu.edu.in" 
                       style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);">
                        📧 Contact Support
                    </a>
                </div>
            `;

            const info = await this.transporter.sendMail({
                from: `"SAMVED Hackathon | MIT-VPU" <${process.env.SMTP_USER}>`,
                to,
                subject,
                html: this.wrapEmail(content),
                attachments: [{
                    filename: 'mit-vpu-logo.gif',
                    path: this.logoPath,
                    cid: 'logo'
                }]
            });

            console.log(`📧 Rejection Email sent to ${to}: ${info.messageId}`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to send rejection email to ${to}:`, error);
            return false;
        }
    }

    async sendRegistrationEmail(to: string, name: string, teamName: string) {
        try {
            const subject = `SAMVED Hackathon - Registration Received for "${teamName}"`;

            const content = `
                <h2 style="color: #111827; margin: 0 0 20px; font-size: 26px; font-weight: 700;">
                    Hello, ${name}! 👋
                </h2>
                <div style="font-size: 16px; line-height: 1.7; color: #4b5563;">
                    <p>
                        Thank you for registering your team <strong style="color: #0ea5e9;">"${teamName}"</strong> 
                        for <strong style="color: #580B18;">SAMVED - A Smart Governance Hackathon</strong>!
                    </p>
                    <p>
                        This hackathon is organised by <strong>MIT Vishwaprayag University, Solapur</strong> in coordination with 
                        <strong>Solapur Municipal Corporation</strong> to develop innovative solutions for smart governance challenges.
                    </p>
                    
                    <div style="background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); padding: 25px; border-radius: 12px; border: 2px solid #fcd34d; margin: 25px 0;">
                        <h3 style="margin: 0 0 10px; color: #92400e; font-size: 16px; display: flex; align-items: center;">
                            ⏳ Registration Status: <span style="color: #d97706; margin-left: 8px;">Pending Review</span>
                        </h3>
                        <p style="margin: 0; color: #78350f;">
                            Your registration is being reviewed by our team. You will receive an email notification once your team is approved.
                        </p>
                    </div>
                    
                    <p>
                        In the meantime, please ensure all your team details and uploaded documents are accurate. 
                        If you need to make any changes, please contact our support team.
                    </p>
                    
                    <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin-top: 25px;">
                        <h4 style="margin: 0 0 12px; color: #334155; font-size: 14px;">📌 Important Reminders:</h4>
                        <ul style="margin: 0; padding-left: 20px; color: #64748b; font-size: 14px;">
                            <li style="margin-bottom: 6px;">Keep your registered email accessible for updates</li>
                            <li style="margin-bottom: 6px;">Team size must be exactly 5 members (including Team Leader)</li>
                            <li style="margin-bottom: 0;">Ensure all team members have valid institutional email IDs</li>
                        </ul>
                    </div>
                </div>
            `;

            const info = await this.transporter.sendMail({
                from: `"SAMVED Hackathon | MIT-VPU" <${process.env.SMTP_USER}>`,
                to,
                subject,
                html: this.wrapEmail(content),
                attachments: [{
                    filename: 'mit-vpu-logo.gif',
                    path: this.logoPath,
                    cid: 'logo'
                }]
            });

            console.log(`📧 Registration Email sent to ${to}: ${info.messageId}`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to send registration email to ${to}:`, error);
            return false;
        }
    }

    async sendPasswordResetEmail(to: string, name: string, newPassword: string): Promise<boolean> {
        try {
            const subject = `🔐 SAMVED Hackathon - Password Reset Successful`;

            const content = `
                <h2 style="color: #111827; margin: 0 0 20px; font-size: 26px; font-weight: 700;">
                    Hello, ${name}!
                </h2>
                <div style="font-size: 16px; line-height: 1.7; color: #4b5563;">
                    <p>
                        Your password reset request for the <strong style="color: #580B18;">SAMVED - A Smart Governance Hackathon</strong> 
                        portal has been successfully processed.
                    </p>
                    
                    <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); padding: 25px; border-radius: 12px; border: 2px solid #a7f3d0; margin: 25px 0;">
                        <h3 style="margin: 0 0 15px; color: #065f46; font-size: 16px;">
                            🔑 Your New Password:
                        </h3>
                        <div style="background: #ffffff; padding: 15px 20px; border-radius: 8px; text-align: center;">
                            <span style="font-family: 'Courier New', monospace; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); padding: 12px 24px; border-radius: 8px; border: 2px solid #22c55e; color: #16a34a; font-size: 20px; font-weight: bold; letter-spacing: 2px; display: inline-block;">
                                ${newPassword}
                            </span>
                        </div>
                    </div>
                    
                    <p style="color: #dc2626; font-size: 14px; padding: 15px; background: #fef2f2; border-radius: 8px; border-left: 4px solid #dc2626;">
                        ⚠️ <strong>Security Notice:</strong> If you did not request this password reset, please contact our support team immediately at 
                        <a href="mailto:hackathon@mitvpu.edu.in" style="color: #dc2626;">hackathon@mitvpu.edu.in</a>
                    </p>
                    
                    <p style="color: #64748b; font-size: 14px; margin-top: 20px;">
                        This hackathon is organised by MIT Vishwaprayag University, Solapur in coordination with Solapur Municipal Corporation.
                    </p>
                </div>
                
                <div style="text-align: center; margin-top: 35px;">
                    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" 
                       style="display: inline-block; background: linear-gradient(135deg, #D97706 0%, #ea580c 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 15px rgba(217, 119, 6, 0.4);">
                        🚀 Login Now
                    </a>
                </div>
            `;

            const info = await this.transporter.sendMail({
                from: `"SAMVED Hackathon | MIT-VPU" <${process.env.SMTP_USER}>`,
                to,
                subject,
                html: this.wrapEmail(content),
                attachments: [{
                    filename: 'mit-vpu-logo.gif',
                    path: this.logoPath,
                    cid: 'logo'
                }]
            });

            console.log(`📧 Password Reset Email sent to ${to}: ${info.messageId}`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to send password reset email to ${to}:`, error);
            return false;
        }
    }
}

export default new EmailService();

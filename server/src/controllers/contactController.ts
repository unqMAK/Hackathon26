import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

interface ContactFormData {
    name: string;
    email: string;
    subject: string;
    message: string;
}

// Create transporter for contact form emails
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

// Submit contact form
export const submitContactForm = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, subject, message }: ContactFormData = req.body;

        // Validate required fields
        if (!name || !email || !subject || !message) {
            res.status(400).json({ message: 'All fields are required' });
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({ message: 'Invalid email format' });
            return;
        }

        const transporter = createTransporter();

        // Send email to admin/support
        const adminEmail = process.env.ADMIN_EMAIL || 'hackathon@mitvpu.edu.in';

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #0052CC 0%, #0066FF 100%); padding: 30px; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">New Contact Form Submission</h1>
                </div>
                <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #dee2e6;">
                                <strong style="color: #495057;">Name:</strong>
                            </td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #dee2e6; color: #212529;">
                                ${name}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #dee2e6;">
                                <strong style="color: #495057;">Email:</strong>
                            </td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #dee2e6;">
                                <a href="mailto:${email}" style="color: #0066FF;">${email}</a>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #dee2e6;">
                                <strong style="color: #495057;">Subject:</strong>
                            </td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #dee2e6; color: #212529;">
                                ${subject}
                            </td>
                        </tr>
                    </table>
                    <div style="margin-top: 20px;">
                        <strong style="color: #495057;">Message:</strong>
                        <div style="background: white; padding: 15px; border-radius: 8px; margin-top: 10px; border: 1px solid #dee2e6;">
                            ${message.replace(/\n/g, '<br>')}
                        </div>
                    </div>
                </div>
                <p style="text-align: center; color: #6c757d; font-size: 12px; margin-top: 20px;">
                    This message was sent from the SAMVED Hackathon Contact Form
                </p>
            </div>
        `;

        await transporter.sendMail({
            from: `"SAMVED Hackathon Contact" <${process.env.SMTP_USER}>`,
            to: adminEmail,
            subject: `[SAMVED Hackathon Contact] ${subject}`,
            html: emailHtml
        });

        // Send confirmation email to the user
        const confirmationHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #0052CC 0%, #0066FF 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">Thank You for Contacting Us!</h1>
                </div>
                <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
                    <p style="color: #212529; font-size: 16px;">Dear ${name},</p>
                    <p style="color: #495057; line-height: 1.6;">
                        Thank you for reaching out to us. We have received your message and our team will get back to you as soon as possible.
                    </p>
                    <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0066FF;">
                        <strong style="color: #495057;">Your message:</strong>
                        <p style="color: #212529; margin: 10px 0 0 0;">${subject}</p>
                    </div>
                    <p style="color: #495057; line-height: 1.6;">
                        If you have any urgent queries, please feel free to contact us at:
                    </p>
                    <ul style="color: #495057; list-style: none; padding: 0;">
                        <li style="padding: 5px 0;">📧 Email: hackathon@mitvpu.edu.in</li>
                        <li style="padding: 5px 0;">📞 Phone: +91 849 684 9849</li>
                    </ul>
                    <p style="color: #495057;">Best regards,<br><strong style="color: #0052CC;">SAMVED Hackathon Team</strong></p>
                </div>
            </div>
        `;

        await transporter.sendMail({
            from: `"SAMVED Hackathon Team" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Thank you for contacting SAMVED Hackathon!',
            html: confirmationHtml
        });

        res.status(200).json({
            success: true,
            message: 'Your message has been sent successfully. We will get back to you soon!'
        });
    } catch (error: any) {
        console.error('Contact form submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message. Please try again later.'
        });
    }
};

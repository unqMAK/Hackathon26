import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function testEmail() {
    console.log('Testing email with credentials:');
    console.log('Host:', process.env.SMTP_HOST);
    console.log('Port:', process.env.SMTP_PORT);
    console.log('User:', process.env.SMTP_USER);
    console.log('Pass:', process.env.SMTP_PASS ? '***SET***' : 'NOT SET');

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        // Verify connection
        await transporter.verify();
        console.log('✅ SMTP connection verified!');

        // Send test email
        const info = await transporter.sendMail({
            from: `"MIT-VPU Hacksphere" <${process.env.SMTP_USER}>`,
            to: 'mandarak123@gmail.com',
            subject: 'Test Email - Hacksphere Email System',
            html: `
                <h2>Email Test Successful!</h2>
                <p>This is a test email from the Hacksphere email system.</p>
                <p>If you receive this, the email configuration is working correctly.</p>
                <p>Time: ${new Date().toLocaleString()}</p>
            `
        });

        console.log('📧 Test email sent successfully!');
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('❌ Email test failed:', error);
    }

    process.exit(0);
}

testEmail();

import nodemailer from 'nodemailer';

/**
 * Mailer Utility
 * 
 * Configures a Nodemailer transport using SMTP credentials from environment variables.
 * Used for sending internal alerts for leads and sales.
 */

const SMTP_HOST = 'smtp.postmarkapp.com';
const SMTP_PORT = 587;
const SMTP_USER = '57242712-82f9-4c43-b918-25287f04f82b';
const SMTP_PASSWORD = '57242712-82f9-4c43-b918-25287f04f82b';
const SMTP_RECIPIENT = 'hello@childcarebusinessplan.com';

const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
    },
});

export const sendEmail = async ({ subject, text, html }: { subject: string, text: string, html?: string }) => {
    try {
        const info = await transporter.sendMail({
            from: `"CCBP Alerts" <hello@childcarebusinessplan.com>`,
            to: SMTP_RECIPIENT,
            subject,
            text,
            html: html || text.replace(/\n/g, '<br>'),
        });
        console.log('Email sent: %s', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error };
    }
};

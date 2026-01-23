import nodemailer from 'nodemailer';

/**
 * Mailer Utility
 * 
 * Configures a Nodemailer transport using SMTP credentials from environment variables.
 * Used for sending internal alerts for leads and sales.
 */

const SMTP_HOST = import.meta.env.SMTP_HOST;
const SMTP_PORT = parseInt(import.meta.env.SMTP_PORT || '587');
const SMTP_USER = import.meta.env.SMTP_USER;
const SMTP_PASSWORD = import.meta.env.SMTP_PASSWORD;
const SMTP_RECIPIENT = import.meta.env.SMTP_RECIPIENT || 'hello@childcarebusinessplan.com';

const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
    },
});

export const sendEmail = async ({ subject, text, html }: { subject: string, text: string, html?: string }) => {
    try {
        const info = await transporter.sendMail({
            from: `"CCBP Alerts" <${SMTP_USER}>`,
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

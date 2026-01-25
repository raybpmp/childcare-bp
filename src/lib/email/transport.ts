import nodemailer from 'nodemailer';
import type { SendEmailOptions } from './types';

const POSTMARK_TOKEN = '57242712-82f9-4c43-b918-25287f04f82b';
const FROM_ADDRESS = 'hello@childcarebusinessplan.com';

const transporter = nodemailer.createTransport({
    host: 'smtp.postmarkapp.com',
    port: 587,
    secure: false,
    auth: {
        user: POSTMARK_TOKEN,
        pass: POSTMARK_TOKEN,
    },
});

export const sendEmail = async ({ to, subject, text, html }: SendEmailOptions) => {
    try {
        const info = await transporter.sendMail({
            from: `"Childcare Business Plan" <${FROM_ADDRESS}>`,
            to,
            subject,
            text,
            html,
        });
        console.log('Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email transport error:', error);
        return { success: false, error };
    }
};

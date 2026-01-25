import nodemailer from 'nodemailer';
import { db } from '../firebase-admin';
import type { EmailTemplate, EmailLog } from './types';

/**
 * EmailService
 * 
 * Centralized service for sending emails via SMTP and logging attempts to Firestore.
 * Implemented as a Singleton for connection pooling in serverless environments.
 */
class EmailService {
    private static instance: EmailService;
    private transporter: nodemailer.Transporter;

    private constructor() {
        // These environment variables should be available in the Astro process
        const SMTP_HOST = process.env.SMTP_HOST || import.meta.env.SMTP_HOST;
        const SMTP_PORT = parseInt(process.env.SMTP_PORT || import.meta.env.SMTP_PORT || '587');
        const SMTP_USER = process.env.SMTP_USER || import.meta.env.SMTP_USER;
        const SMTP_PASSWORD = process.env.SMTP_PASSWORD || import.meta.env.SMTP_PASSWORD;

        this.transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: SMTP_PORT,
            secure: SMTP_PORT === 465,
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASSWORD,
            },
            // Pool connections to avoid TCP overhead in serverless
            pool: true,
            maxConnections: 5,
            maxMessages: 100,
        });
    }

    public static getInstance(): EmailService {
        if (!EmailService.instance) {
            EmailService.instance = new EmailService();
        }
        return EmailService.instance;
    }

    /**
     * Send an email and log the result to Firestore
     */
    public async send(
        to: string,
        templateId: string,
        template: EmailTemplate,
        metadata: any = {}
    ): Promise<{ success: boolean; messageId?: string; error?: any }> {
        const timestamp = new Date().toISOString();

        // 1. Initial log entry in Firestore
        let logId: string | undefined;
        try {
            const logRef = await db.collection('mail_logs').add({
                templateId,
                recipient: to,
                status: 'PENDING',
                timestamp,
                metadata
            });
            logId = logRef.id;
        } catch (dbError) {
            console.error('Failed to create mail log:', dbError);
            // We continue even if logging fails, though in production you might want to halt.
        }

        // 2. Dispatch Email
        try {
            const SMTP_USER = process.env.SMTP_USER || import.meta.env.SMTP_USER;
            const info = await this.transporter.sendMail({
                from: `"CCBP Portal" <${SMTP_USER}>`,
                to,
                subject: template.subject,
                text: template.text,
                html: template.html,
            });

            // 3. Update log to SENT
            if (logId) {
                await db.collection('mail_logs').doc(logId).update({
                    status: 'SENT',
                    messageId: info.messageId,
                    sentAt: new Date().toISOString()
                });
            }

            console.log(`Email [${templateId}] sent to ${to}: ${info.messageId}`);
            return { success: true, messageId: info.messageId };
        } catch (error: any) {
            console.error(`Email [${templateId}] failed to ${to}:`, error);

            // 4. Update log to FAILED
            if (logId) {
                await db.collection('mail_logs').doc(logId).update({
                    status: 'FAILED',
                    error: error.message || String(error),
                    failedAt: new Date().toISOString()
                });
            }

            return { success: false, error };
        }
    }
}

export const emailService = EmailService.getInstance();

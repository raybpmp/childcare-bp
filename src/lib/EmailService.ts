import nodemailer from 'nodemailer';
import { saleAlertTemplate, type SaleAlertData } from './email/templates/alerts/sale';
import { leadAlertTemplate } from './email/templates/alerts/lead';
import { userResultsTemplate } from './email/templates/user/results';
import { contactAlertTemplate } from './email/templates/alerts/contact';

// ... existing code ...

/**
 * ARCHITECTURAL RULE: This is the ONLY module allowed to send emails.
 * It encapsulates transport (Postmark) and provides premium rendering for all lead/contact data.
 */

// --- CONFIGURATION ---
const POSTMARK_TOKEN = '57242712-82f9-4c43-b918-25287f04f82b';
const FROM_ADDRESS = 'hello@childcarebusinessplan.com';
const INTERNAL_RECIPIENT = 'hello@childcarebusinessplan.com';

const transporter = nodemailer.createTransport({
    host: 'smtp.postmarkapp.com',
    port: 587,
    secure: false,
    auth: {
        user: POSTMARK_TOKEN,
        pass: POSTMARK_TOKEN,
    },
});

// --- TYPES ---
export interface WelcomeEmailPayload {
    email: string;
    funnelSegment: 'Startup' | 'Growth';
    revenuePotential?: number;
    state?: string;
    utmSource?: string;
    quizData?: Record<string, any>;
}

export interface ContactEmailPayload {
    name: string;
    email: string;
    subject: string;
    message: string;
}

// --- RENDERING HELPERS ---
// --- SERVICE ---

// --- SERVICE ---
export const EmailService = {
    /**
     * HIGH-LEVEL ADAPTER: Processes raw Lead capture data from API routes.
     * This handles mapping from the frontend's 'LeadData' structure to internal 'WelcomeEmailPayload'.
     * CENTRALIZES logic so API routes can remain 'dumb'.
     */
    async processLeadCapture(rawBody: any) {
        const payload: WelcomeEmailPayload = {
            email: rawBody.email,
            funnelSegment: rawBody.funnelSegment || 'Startup',
            revenuePotential: rawBody.quizData?.revenuePotential,
            state: rawBody.quizData?.state,
            utmSource: rawBody.utmSource,
            quizData: rawBody.quizData?.payload || {}
        };
        console.log('EmailService: Processing Lead Capture for %s', payload.email);

        // Send both emails in parallel
        const [alertResult, userResult] = await Promise.all([
            this.sendLeadAlert(payload),
            this.sendUserConfirmation(payload)
        ]);

        return {
            success: alertResult.success || userResult.success, // Success if at least one works
            details: { alert: alertResult, user: userResult }
        };
    },

    /**
     * HIGH-LEVEL ADAPTER: Processes raw Contact form data from API routes.
     * CENTRALIZES logic so API routes can remain 'dumb'.
     */
    async processContactSubmission(rawBody: any) {
        const payload: ContactEmailPayload = {
            name: rawBody.name,
            email: rawBody.email,
            subject: rawBody.subject,
            message: rawBody.message
        };
        console.log('EmailService: Processing Contact Submission from %s', payload.email);
        return this.sendContactForm(payload);
    },

    /**
     * Sends an internal alert when a new lead is captured.
     * ZERO FILTERING: Renders the entire quizData payload in a premium table.
     */
    async sendLeadAlert(data: WelcomeEmailPayload) {
        const template = leadAlertTemplate(data);
        return this._send({
            to: INTERNAL_RECIPIENT,
            subject: template.subject,
            text: template.text,
            html: template.html
        });
    },

    /**
     * Sends the confirmation email to the USER.
     */
    async sendUserConfirmation(data: WelcomeEmailPayload) {
        const template = userResultsTemplate(data);
        return this._send({
            to: data.email,
            subject: template.subject,
            text: template.text,
            html: template.html
        });
    },

    /**
     * Sends an internal alert for contact form submissions.
     */
    async sendContactForm(data: ContactEmailPayload) {
        const template = contactAlertTemplate(data);
        return this._send({
            to: INTERNAL_RECIPIENT,
            subject: template.subject,
            text: template.text,
            html: template.html
        });
    },

    /**
     * Sends a premium sale alert when a purchase is completed.
     * Renders ALL provided data without filtering.
     */
    async processSaleCapture(data: SaleAlertData) {
        const template = saleAlertTemplate(data);
        return this._send({
            to: INTERNAL_RECIPIENT,
            subject: template.subject,
            text: template.text,
            html: template.html
        });
    },

    /**
     * Sends a generic system alert (e.g. Stripe sales, errors).
     */
    async sendSystemAlert({ subject, text, html }: { subject: string, text: string, html?: string }) {
        return this._send({
            to: INTERNAL_RECIPIENT,
            subject,
            text,
            html: html || text.replace(/\n/g, '<br>')
        });
    },

    // Internal low-level transport method
    async _send({ to, subject, text, html }: { to: string, subject: string, text: string, html: string }) {
        try {
            const info = await transporter.sendMail({
                from: `"Childcare Businessplan" <${FROM_ADDRESS}>`,
                to,
                subject,
                text,
                html,
            });
            console.log('EmailService: Sent successfully - %s', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('EmailService: Failed to send:', error);
            return { success: false, error };
        }
    }
};

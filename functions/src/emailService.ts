import * as nodemailer from 'nodemailer';
import { CONFIG } from './config';
// Import templates - ensuring paths are correct relative to this file
import { leadAlertTemplate } from './templates/alerts/lead';
import { userResultsTemplate } from './templates/user/results';
import { contactAlertTemplate } from './templates/alerts/contact';
import { saleAlertTemplate } from './templates/alerts/sale';
import { launchpadTemplate } from './templates/welcome/launchpad';
import { directorTemplate } from './templates/welcome/director';
import { ceoTemplate } from './templates/welcome/ceo';
import { WelcomeEmailPayload, ContactEmailPayload, SaleAlertData } from './types';

const transporter = nodemailer.createTransport({
    host: 'smtp.postmarkapp.com',
    port: 587,
    secure: false,
    auth: {
        user: CONFIG.postmarkToken,
        pass: CONFIG.postmarkToken,
    },
});

export const EmailService = {
    async processLeadCapture(rawBody: any) {
        const payload: WelcomeEmailPayload = {
            ...rawBody, // <--- CRITICAL: Pass everything through
            email: rawBody.email,
            funnelSegment: rawBody.funnelSegment || 'Startup',
            revenuePotential: rawBody.quizData?.revenuePotential,
            state: rawBody.quizData?.state,
            utmSource: rawBody.utmSource,
            quizData: rawBody.quizData?.payload || rawBody.quizData || {}
        };
        console.log('Server EmailService: Processing Lead Capture for %s', payload.email);

        const [alertResult, userResult] = await Promise.all([
            this.sendLeadAlert(payload),
            this.sendUserConfirmation(payload)
        ]);

        return {
            success: alertResult.success || userResult.success,
            details: { alert: alertResult, user: userResult }
        };
    },

    async processContactSubmission(rawBody: any) {
        const payload: ContactEmailPayload = {
            name: rawBody.name,
            email: rawBody.email,
            subject: rawBody.subject,
            message: rawBody.message
        };
        console.log('Server EmailService: Processing Contact Submission from %s', payload.email);
        return this.sendContactForm(payload);
    },

    async processSaleCapture(data: SaleAlertData) {
        const template = saleAlertTemplate(data);
        return this._send({
            to: CONFIG.internalRecipient,
            subject: template.subject,
            text: template.text,
            html: template.html
        });
    },

    async sendMembershipWelcome(email: string, name: string, plan: 'Launchpad' | 'Director' | 'CEO') {
        let template;
        switch (plan) {
            case 'Launchpad': template = launchpadTemplate(name); break;
            case 'Director': template = directorTemplate(name); break;
            case 'CEO': template = ceoTemplate(name); break;
            default: throw new Error(`Invalid plan for welcome email: ${plan}`);
        }

        console.log('Server EmailService: Sending %s Welcome to %s', plan, email);
        return this._send({
            to: email,
            subject: template.subject,
            text: template.text,
            html: template.html
        });
    },

    async sendSystemAlert({ subject, text, html }: { subject: string, text: string, html?: string }) {
        return this._send({
            to: CONFIG.internalRecipient,
            subject,
            text,
            html: html || text.replace(/\n/g, '<br>')
        });
    },

    // --- Private Helpers ---

    async sendLeadAlert(data: WelcomeEmailPayload) {
        const template = leadAlertTemplate(data);
        return this._send({
            to: CONFIG.internalRecipient,
            subject: template.subject,
            text: template.text,
            html: template.html
        });
    },

    async sendUserConfirmation(data: WelcomeEmailPayload) {
        const template = userResultsTemplate(data);
        return this._send({
            to: data.email,
            subject: template.subject,
            text: template.text,
            html: template.html
        });
    },

    async sendContactForm(data: ContactEmailPayload) {
        const template = contactAlertTemplate(data);
        return this._send({
            to: CONFIG.internalRecipient,
            subject: template.subject,
            text: template.text,
            html: template.html
        });
    },

    async _send({ to, subject, text, html }: { to: string, subject: string, text: string, html: string }) {
        try {
            const info = await transporter.sendMail({
                from: `"Childcare Businessplan" <${CONFIG.fromAddress}>`,
                to,
                subject,
                text,
                html,
            });
            console.log('Server EmailService: Sent successfully - %s', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Server EmailService: Failed to send:', error);
            return { success: false, error: error instanceof Error ? error.message : String(error) };
        }
    }
};

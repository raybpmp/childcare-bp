import nodemailer from 'nodemailer';
import { renderBaseLayout, COLORS } from './templates/layout';
import { launchpadTemplate } from './templates/welcome/launchpad';
import { directorTemplate } from './templates/welcome/director';
import { ceoTemplate } from './templates/welcome/ceo';

// --- CONFIGURATION ---
const POSTMARK_TOKEN = import.meta.env.POSTMARK_TOKEN;
if (!POSTMARK_TOKEN) {
    throw new Error('Missing POSTMARK_TOKEN environment variable');
}
const FROM_ADDRESS = import.meta.env.EMAIL_FROM_ADDRESS || 'hello@childcarebusinessplan.com';
const INTERNAL_RECIPIENT = import.meta.env.EMAIL_INTERNAL_RECIPIENT || 'hello@childcarebusinessplan.com';

const transporter = nodemailer.createTransport({
    host: 'smtp.postmarkapp.com',
    port: 587,
    secure: false,
    auth: {
        user: POSTMARK_TOKEN,
        pass: POSTMARK_TOKEN,
    },
});

// --- HELPER RENDERING ---
const formatLabel = (key: string) =>
    key.replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();

const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '<span style="color: #ccc;">N/A</span>';
    if (typeof value === 'number') return value.toLocaleString();
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return `<pre style="margin:0; font-family: monospace; font-size: 12px; white-space: pre-wrap;">${JSON.stringify(value, null, 2)}</pre>`;
    return String(value);
};

const renderDataTable = (data: Record<string, any>) => {
    const rows = Object.entries(data)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value], index) => `
            <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f9fafb'};">
                <td style="padding: 12px 15px; border: 1px solid #edf2f7; font-weight: 600; color: #4a5568; width: 40%;">${formatLabel(key)}</td>
                <td style="padding: 12px 15px; border: 1px solid #edf2f7; color: #2d3748;">${formatValue(value)}</td>
            </tr>
        `).join('');

    return `
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; border-radius: 8px; overflow: hidden; border: 1px solid #edf2f7;">
            <thead>
                <tr style="background-color: #edf2f7;">
                    <th style="padding: 12px 15px; border: 1px solid #edf2f7; text-align: left; color: #2d3748;">Property</th>
                    <th style="padding: 12px 15px; border: 1px solid #edf2f7; text-align: left; color: #2d3748;">Value</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;
};

export const EmailService = {
    /**
     * Sends a welcome email based on the membership plan.
     */
    async sendMembershipWelcome(email: string, name: string, plan: 'Launchpad' | 'Director' | 'CEO') {
        let template;
        switch (plan) {
            case 'Launchpad': template = launchpadTemplate(name); break;
            case 'Director': template = directorTemplate(name); break;
            case 'CEO': template = ceoTemplate(name); break;
            default: throw new Error(`Invalid plan for welcome email: ${plan}`);
        }

        console.log('EmailService: Sending %s Welcome to %s', plan, email);
        return this._send({
            to: email,
            subject: template.subject,
            text: template.text,
            html: template.html
        });
    },

    /**
     * Processes raw Lead capture data from API routes.
     */
    async processLeadCapture(rawBody: any) {
        const data = {
            'Email Address': rawBody.email,
            'Active Segment': rawBody.funnelSegment || 'Startup',
            'State / Location': rawBody.quizData?.state,
            'Annual Revenue Potential': rawBody.quizData?.revenuePotential ? `$${rawBody.quizData.revenuePotential.toLocaleString()}` : undefined,
            'UTM Source': rawBody.utmSource,
            ...rawBody.quizData?.payload
        };

        const html = renderBaseLayout('New Lead Captured', `
            <p style="color: #4a5568; font-size: 16px; margin-bottom: 24px;">A new user has completed a lead capture event. Here are the <strong>unfiltered results</strong> from the submission:</p>
            ${renderDataTable(data)}
            <div style="margin-top: 30px; padding: 20px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px;">
                <h3 style="margin-top: 0; color: #166534; font-size: 16px;">Next Steps</h3>
                <p style="margin-bottom: 0; color: #15803d; font-size: 14px;">This lead represents verified intent. Follow up within 24 hours for maximum conversion.</p>
            </div>
        `);

        return this._send({
            to: INTERNAL_RECIPIENT,
            subject: `🚀 [NEW LEAD] ${rawBody.email}`,
            text: `New Lead: ${rawBody.email} | Segment: ${rawBody.funnelSegment}. Check HTML for full details.`,
            html
        });
    },

    /**
     * Sends a premium sale alert when a purchase is completed.
     */
    async sendSaleAlert(saleData: {
        email: string;
        name: string;
        program: string;
        amount: number;
        onboarding: Record<string, any>;
    }) {
        const data = {
            'Customer Name': saleData.name,
            'Customer Email': saleData.email,
            'Program Purchased': saleData.program,
            'Amount Paid': `$${(saleData.amount / 100).toFixed(2)}`,
            ...saleData.onboarding
        };

        const html = renderBaseLayout('New Sale Completed', `
            <p style="color: #4a5568; font-size: 16px; margin-bottom: 24px;">A new sale has been completed! All systems have been updated and the customer is onboarded.</p>
            ${renderDataTable(data)}
            <div style="margin-top: 30px; padding: 20px; background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px;">
                <h3 style="margin-top: 0; color: #1e40af; font-size: 16px;">Success Details</h3>
                <p style="margin-bottom: 0; color: #1e3a8a; font-size: 14px;">The customer has been added to ERPNext, enrolled in the LMS, and received their "Pending Review" welcome email.</p>
            </div>
        `);

        return this._send({
            to: INTERNAL_RECIPIENT,
            subject: `💰 [SALE] ${saleData.email} purchased ${saleData.program}`,
            text: `Sale Alert: ${saleData.email} purchased ${saleData.program} for $${(saleData.amount / 100).toFixed(2)}`,
            html
        });
    },

    /**
     * Sends a generic system alert (e.g. errors).
     */
    async sendSystemAlert({ subject, text, html }: { subject: string, text: string, html?: string }) {
        return this._send({
            to: INTERNAL_RECIPIENT,
            subject,
            text,
            html: html || renderBaseLayout(subject, `<p style="white-space: pre-wrap;">${text}</p>`)
        });
    },

    // Internal low-level transport method
    async _send({ to, subject, text, html }: { to: string, subject: string, text: string, html: string }) {
        try {
            const info = await transporter.sendMail({
                from: `"CCBP Team" <${FROM_ADDRESS}>`,
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

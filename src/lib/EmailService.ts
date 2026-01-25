import nodemailer from 'nodemailer';
import { saleAlertTemplate, type SaleAlertData } from './email/templates/alerts/sale';

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

// --- PREMUM HTML TEMPLATES ---

const renderLeadHtml = (data: WelcomeEmailPayload) => {
    // Collect ALL data into a single flat list for the table
    const allData: Record<string, any> = {
        'Email Address': data.email,
        'Active Segment': data.funnelSegment,
        'State / Location': data.state,
        'Annual Revenue Potential': data.revenuePotential ? `$${data.revenuePotential.toLocaleString()}` : undefined,
        'UTM Source': data.utmSource,
        ...data.quizData
    };

    const tableRows = Object.entries(allData)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value], index) => `
            <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f9fafb'};">
                <td style="padding: 12px 15px; border: 1px solid #edf2f7; font-weight: 600; color: #4a5568; width: 40%;">${formatLabel(key)}</td>
                <td style="padding: 12px 15px; border: 1px solid #edf2f7; color: #2d3748;">${formatValue(value)}</td>
            </tr>
        `).join('');

    return `
    <div style="background-color: #f7fafc; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #0d9488 0%, #065f46 100%); padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: -0.025em; font-weight: 800;">NEW LEAD CAPTURED</h1>
                <p style="color: #ccfbf1; margin: 8px 0 0 0; font-size: 14px; font-weight: 500;">${new Date().toLocaleString()}</p>
            </div>

            <!-- Content Area -->
            <div style="padding: 30px;">
                <p style="color: #4a5568; font-size: 16px; margin-bottom: 24px;">A new user has completed a lead capture event. Here are the <strong>unfiltered results</strong> from the submission:</p>
                
                <table style="width: 100%; border-collapse: collapse; font-size: 14px; border-radius: 8px; overflow: hidden;">
                    <thead>
                        <tr style="background-color: #edf2f7;">
                            <th style="padding: 12px 15px; border: 1px solid #edf2f7; text-align: left; color: #2d3748;">Property</th>
                            <th style="padding: 12px 15px; border: 1px solid #edf2f7; text-align: left; color: #2d3748;">Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>

                <div style="margin-top: 30px; padding: 20px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px;">
                    <h3 style="margin-top: 0; color: #166534; font-size: 16px;">Next Steps</h3>
                    <p style="margin-bottom: 0; color: #15803d; font-size: 14px;">This lead represents verified intent. Use the contact information above to follow up within 24 hours for maximum conversion.</p>
                </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; font-size: 12px; color: #94a3b8;">&copy; ${new Date().getFullYear()} Childcare Business Plan Engine. All rights reserved.</p>
            </div>
        </div>
    </div>
    `;
};

const renderContactHtml = (data: ContactEmailPayload) => `
    <div style="background-color: #f7fafc; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;">
            <div style="background: linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%); padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;">CONTACT SUBMISSION</h1>
            </div>
            <div style="padding: 30px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr>
                        <td style="padding: 12px 15px; border-bottom: 1px solid #edf2f7; font-weight: 600; color: #4a5568;">Name</td>
                        <td style="padding: 12px 15px; border-bottom: 1px solid #edf2f7; color: #2d3748;">${data.name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 15px; border-bottom: 1px solid #edf2f7; font-weight: 600; color: #4a5568;">Email</td>
                        <td style="padding: 12px 15px; border-bottom: 1px solid #edf2f7; color: #2d3748;">${data.email}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 15px; border-bottom: 1px solid #edf2f7; font-weight: 600; color: #4a5568;">Subject</td>
                        <td style="padding: 12px 15px; border-bottom: 1px solid #edf2f7; color: #2d3748;">${data.subject}</td>
                    </tr>
                </table>
                <div style="margin-top: 24px; padding: 20px; background-color: #f5f3ff; border-radius: 12px; border: 1px solid #ddd6fe;">
                    <p style="margin-top: 0; font-weight: 600; color: #5b21b6;">Message:</p>
                    <p style="margin-bottom: 0; white-space: pre-wrap; color: #4c1d95; line-height: 1.6;">${data.message}</p>
                </div>
            </div>
        </div>
    </div>
`;

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
        return this.sendLeadAlert(payload);
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
        const html = renderLeadHtml(data);
        const revenueText = data.revenuePotential ? ` - $${data.revenuePotential.toLocaleString()}` : '';

        return this._send({
            to: INTERNAL_RECIPIENT,
            subject: `🚀 [NEW LEAD] ${data.email}${revenueText}`,
            text: `New Lead: ${data.email} | Segment: ${data.funnelSegment} | Full data included in HTML view.`,
            html: html
        });
    },

    /**
     * Sends an internal alert for contact form submissions.
     */
    async sendContactForm(data: ContactEmailPayload) {
        const html = renderContactHtml(data);
        return this._send({
            to: INTERNAL_RECIPIENT,
            subject: `📧 [CONTACT] ${data.subject} from ${data.name}`,
            text: `Contact from ${data.name} (${data.email}): ${data.message}`,
            html: html
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
                from: `"CCBP Engine" <${FROM_ADDRESS}>`,
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

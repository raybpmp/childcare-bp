// EmailService.ts
// ARCHITECTURAL CHANGE: Refactored to use Firebase Cloud Function 'sendEmail'
// This removes direct nodemailer dependencies from the Next.js app.

// Configuration
const FUNCTIONS_URL_DEV = 'http://127.0.0.1:5001/childcare-bp/us-central1/sendEmail';
const FUNCTIONS_URL_PROD = 'https://us-central1-childcare-bp.cloudfunctions.net/sendEmail';
const DEFAULT_URL = import.meta.env.DEV ? FUNCTIONS_URL_DEV : FUNCTIONS_URL_PROD;
const API_URL = import.meta.env.PUBLIC_FUNCTIONS_URL || DEFAULT_URL;

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

export interface SaleAlertData {
    email: string;
    name: string;
    program: string;
    amount: number; // in cents
    onboarding: Record<string, any>;
}

export const EmailService = {
    /**
     * Helper to call the Cloud Function
     */
    async _callFunction(action: string, payload: any) {
        try {
            console.log(`EmailService: Calling Cloud Function [${action}] at ${API_URL}`);
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action, payload }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Cloud Function failed: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('EmailService: Failed to call Cloud Function:', error);
            // Fallback object to match previous return signature
            return { success: false, error };
        }
    },

    /**
     * HIGH-LEVEL ADAPTER: Processes raw Lead capture data from API routes.
     */
    async processLeadCapture(rawBody: any) {
        // Prepare payload exactly as the server expects it
        const payload: WelcomeEmailPayload = {
            email: rawBody.email,
            funnelSegment: rawBody.funnelSegment || 'Startup',
            revenuePotential: rawBody.quizData?.revenuePotential,
            state: rawBody.quizData?.state,
            utmSource: rawBody.utmSource,
            quizData: rawBody.quizData?.payload || {}
        };

        return this._callFunction('leadCapture', payload);
    },

    /**
     * HIGH-LEVEL ADAPTER: Processes raw Contact form data from API routes.
     */
    async processContactSubmission(rawBody: any) {
        const payload: ContactEmailPayload = {
            name: rawBody.name,
            email: rawBody.email,
            subject: rawBody.subject,
            message: rawBody.message
        };
        return this._callFunction('contactSubmission', payload);
    },

    /**
     * Sends a premium sale alert when a purchase is completed.
     */
    async processSaleCapture(data: SaleAlertData) {
        return this._callFunction('saleCapture', data);
    },

    /**
     * Sends a generic system alert.
     */
    async sendSystemAlert({ subject, text, html }: { subject: string, text: string, html?: string }) {
        return this._callFunction('systemAlert', { subject, text, html });
    },

    // Kept for backward compatibility if called directly, but prefer process* methods
    async sendMembershipWelcome(email: string, name: string, plan: 'Launchpad' | 'Director' | 'CEO') {
        return this._callFunction('membershipWelcome', { email, name, plan });
    }
};

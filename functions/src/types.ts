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

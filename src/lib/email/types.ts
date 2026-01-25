export interface WelcomeEmailProps {
    email: string;
    funnelSegment: 'Startup' | 'Growth';
    revenuePotential?: number;
    state?: string;
}

export interface ContactEmailProps {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export interface SendEmailOptions {
    to: string;
    subject: string;
    text: string;
    html: string;
}

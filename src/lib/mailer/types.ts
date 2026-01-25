export interface EmailTemplate {
    subject: string;
    html: string;
    text: string;
}

export interface EmailLog {
    id?: string;
    templateId: string;
    recipient: string;
    status: 'PENDING' | 'SENT' | 'FAILED';
    error?: string;
    timestamp: string;
    messageId?: string;
    metadata?: any;
}

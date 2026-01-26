import type { APIRoute } from 'astro';
import { EmailService } from '@/lib/EmailService';

export const prerender = false;

interface LeadData {
    email: string;
    funnelSegment: 'Startup' | 'Growth';
    quizData?: {
        state?: string;
        payload?: any;
        revenuePotential?: number;
    };
    utmSource?: string;
}

export const POST: APIRoute = async ({ request }) => {
    try {
        const body: LeadData = await request.json();

        // DELEGATE TO EMAIL SERVICE (User + Admin Notifications)
        const result = await EmailService.processLeadCapture(body);

        if (result.success) {
            return new Response(JSON.stringify({
                success: true,
                message: 'Lead capture processed',
                details: result.details
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        } else {
            console.error('Email service failed significantly:', result.details);
            // Still return 200 to client if possible, or 500? 
            // KAICZEN: Fail gracefully. If emails fail, we might want to log it but maybe tell user it worked or "Check your email".
            // If completely failed, 500.
            return new Response(JSON.stringify({
                success: false,
                error: 'Failed to send confirmation emails'
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

    } catch (error) {
        console.error('Lead capture critical error:', error);
        return new Response(JSON.stringify({
            error: 'Internal Server Error during lead capture'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

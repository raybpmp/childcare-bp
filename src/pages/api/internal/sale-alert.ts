import type { APIRoute } from 'astro';
import { EmailService } from '@/lib/EmailService';

export const prerender = false;

// Secure this endpoint!
const INTERNAL_API_KEY = import.meta.env.FRAPPE_API_SECRET; // reusing the rigorous secret we already have

export const POST: APIRoute = async ({ request }) => {
    // 1. Security Check
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${INTERNAL_API_KEY}`) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const body = await request.json();

        // 2. Validate Payload
        if (!body.email || !body.program || !body.amount) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // 3. Trigger Email Service (The Logic)
        const result = await EmailService.processSaleCapture(body);

        if (result.success) {
            return new Response(JSON.stringify({ success: true, messageId: result.messageId }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        } else {
            console.error('Email Bridge Failed:', result.error);
            return new Response(JSON.stringify({ error: 'Failed to send email' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

    } catch (error: any) {
        console.error('API Bridge Error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

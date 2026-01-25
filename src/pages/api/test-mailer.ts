import type { APIRoute } from 'astro';
import { emailService } from '../../lib/mailer';

export const prerender = false;

export const GET: APIRoute = async () => {
    try {
        const result = await emailService.send(
            'raybpmp@gmail.com',
            'test-connection',
            {
                subject: '🚀 SMTP Connection Test',
                text: 'This is a test email from the new centralized Email Service.',
                html: '<h1>Centralized Email Service</h1><p>This is a test email showing the service <b>actually works</b>.</p>'
            },
            { test: true, source: 'manual-test-route' }
        );

        return new Response(JSON.stringify(result), {
            status: result.success ? 200 : 500,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

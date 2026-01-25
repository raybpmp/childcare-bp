import type { APIRoute } from 'astro';
import { db } from '@/lib/firebase-admin';
import { EmailService } from '@/lib/EmailService';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { name, email, subject, message } = body;
        const timestamp = new Date().toISOString();

        // 1. Save to Firestore
        try {
            await db.collection('contact_submissions').add({
                name,
                email,
                subject,
                message,
                createdAt: timestamp
            });
        } catch (dbError) {
            console.error('Firestore contact save error:', dbError);
        }

        // 2. Send Email
        const mailResult = await EmailService.processContactSubmission(body);

        if (!mailResult.success) {
            throw new Error('Email sending failed');
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Message sent successfully'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Contact submission error:', error);
        return new Response(JSON.stringify({
            error: 'Internal Server Error'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

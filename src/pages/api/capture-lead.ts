import type { APIRoute } from 'astro';
import { db } from '@/lib/firebase-admin';
import { sendEmail } from '@/lib/mailer';

export const prerender = false;

const FRAPPE_URL = import.meta.env.FRAPPE_URL || 'https://portal.childcarebusinessplan.com';
const FRAPPE_API_KEY = import.meta.env.FRAPPE_API_KEY;
const FRAPPE_API_SECRET = import.meta.env.FRAPPE_API_SECRET;

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
        const timestamp = new Date().toISOString();

        // PART 1: Save to Firestore (Real Database Ownership)
        try {
            await db.collection('leads').add({
                email: body.email,
                funnelSegment: body.funnelSegment,
                quizState: body.quizData?.state,
                revenuePotential: body.quizData?.revenuePotential,
                payload: body.quizData?.payload || {},
                utmSource: body.utmSource,
                createdAt: timestamp,
                source: 'Website Calculator'
            });
            console.log('Lead saved to Firestore');
        } catch (dbError) {
            console.error('Firestore save error:', dbError);
            // Non-blocking for the user
        }

        // PART 2: Send SMTP Email Alert (Team Visibility)
        try {
            await sendEmail({
                subject: `🚀 [NEW LEAD] ${body.email} - $${body.quizData?.revenuePotential?.toLocaleString()}/yr`,
                text: `
                    A new lead has been captured via the Website Calculator.
                    
                    Details:
                    - Email: ${body.email}
                    - State: ${body.quizData?.state || 'Unknown'}
                    - Revenue Potential: $${body.quizData?.revenuePotential?.toLocaleString()}/yr
                    - Funnel Segment: ${body.funnelSegment}
                    - UTM Source: ${body.utmSource || 'direct'}
                    - Date: ${timestamp}
                    
                    Full Quiz Data:
                    ${JSON.stringify(body.quizData?.payload || {}, null, 2)}
                `
            });
        } catch (mailError) {
            console.error('SMTP notification error:', mailError);
            // Non-blocking for the user
        }

        // PART 3: Create lead in Frappe (Legacy CRM Sync)
        let frappeResult = { leadId: null, existing: false };
        try {
            const frappeResponse = await fetch(`${FRAPPE_URL}/api/resource/Lead`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `token ${FRAPPE_API_KEY}:${FRAPPE_API_SECRET}`,
                },
                body: JSON.stringify({
                    data: {
                        email_id: body.email,
                        lead_name: body.email.split('@')[0],
                        source: 'Website Calculator',
                        status: 'Lead',
                        funnel_segment: body.funnelSegment,
                        quiz_state_local: body.quizData?.state,
                        revenue_potential: body.quizData?.revenuePotential,
                        quiz_payload_raw: JSON.stringify(body.quizData?.payload || {}),
                        utm_source: body.utmSource,
                    }
                }),
            });

            if (frappeResponse.ok) {
                const result = await frappeResponse.json();
                frappeResult.leadId = result.data.name;
            } else {
                const errorData = await frappeResponse.json();
                if (errorData.exc_type === 'DuplicateEntryError') {
                    frappeResult.existing = true;
                }
            }
        } catch (frappeError) {
            console.error('Frappe sync error:', frappeError);
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Lead captured successfully across all platforms',
            existing: frappeResult.existing,
            leadId: frappeResult.leadId
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Lead capture error:', error);
        return new Response(JSON.stringify({
            error: 'Internal Server Error during lead capture'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

import type { APIRoute } from 'astro';

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

        // Create lead in Frappe
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

        if (!frappeResponse.ok) {
            const errorData = await frappeResponse.json();
            console.error('Frappe API error:', errorData);

            // Handle duplicate lead (already exists)
            if (errorData.exc_type === 'DuplicateEntryError') {
                return new Response(JSON.stringify({
                    success: true,
                    message: 'Lead already exists',
                    existing: true
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            throw new Error('Failed to create lead');
        }

        const result = await frappeResponse.json();

        return new Response(JSON.stringify({
            success: true,
            leadId: result.data.name
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Lead capture error:', error);
        return new Response(JSON.stringify({
            error: 'Failed to capture lead'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

import type { APIRoute } from 'astro';
import { db } from '@/lib/firebase-admin';
import { EmailService } from '@/lib/EmailService';

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

// ... existing code ...
export const POST: APIRoute = async ({ request }) => {
    try {
        const body: LeadData = await request.json();
        const timestamp = new Date().toISOString();

        // PART 1: Define Tasks for Parallel Execution

        // Task A: Firestore (Real Database)
        const firestoreTask = db.collection('leads').add({
            email: body.email,
            funnelSegment: body.funnelSegment,
            quizState: body.quizData?.state,
            revenuePotential: body.quizData?.revenuePotential,
            payload: body.quizData?.payload || {},
            utmSource: body.utmSource,
            createdAt: timestamp,
            source: 'Website Calculator'
        }).then(() => ({ status: 'success', service: 'firestore' }))
            .catch(err => ({ status: 'error', service: 'firestore', error: err }));

        // Task B: Email Alert (Team Visibility)
        const emailTask = EmailService.processLeadCapture(body)
            .then(() => ({ status: 'success', service: 'email' }))
            .catch(err => ({ status: 'error', service: 'email', error: err }));

        // Task C: Frappe/ERPNext (CRM Sync)
        const frappeTask = (async () => {
            try {
                const response = await fetch(`${FRAPPE_URL}/api/resource/Lead`, {
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

                if (response.ok) {
                    const result = await response.json();
                    return { status: 'success', service: 'frappe', leadId: result.data.name };
                } else {
                    const errorData = await response.json();
                    const existing = errorData.exc_type === 'DuplicateEntryError';
                    return { status: existing ? 'success' : 'error', service: 'frappe', existing, error: errorData };
                }
            } catch (err) {
                return { status: 'error', service: 'frappe', error: err };
            }
        })();

        // Execute all in parallel - no blocking!
        const results = await Promise.allSettled([firestoreTask, emailTask, frappeTask]);

        // Log results for debugging
        results.forEach(result => {
            if (result.status === 'fulfilled') {
                // Check using discriminators or 'in' operator to be safe, 
                // or just rely on the shape we know we returned.
                const val = result.value as { status: string, service: string, error?: any };
                if (val.status === 'error') {
                    console.error(`${val.service} failed:`, val.error);
                }
            } else {
                console.error('Task crashed with unhandled rejection:', result.reason);
            }
        });

        // Extract Frappe result specifically for response (legacy compat)
        // We know results[2] corresponds to frappeTask
        const frappeOutcome = results[2];
        let frappeResult = { leadId: null, existing: false };

        if (frappeOutcome.status === 'fulfilled') {
            const val = frappeOutcome.value as any;
            if (val.service === 'frappe' && val.status === 'success') {
                frappeResult = { leadId: val.leadId, existing: val.existing };
            }
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Lead capture processed',
            results: results.map(r => r.status === 'fulfilled' ? r.value.status : 'failed'),
            leadId: frappeResult.leadId,
            existing: frappeResult.existing
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

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

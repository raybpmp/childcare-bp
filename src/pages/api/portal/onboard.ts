import type { APIRoute } from 'astro';
import { EmailService } from '@/lib/email';

/**
 * Single, simple endpoint for portal onboarding alerts.
 * This bridges the Frontend (React) to the Backend (EmailService).
 */
export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { email, name } = body;

        if (!email) {
            return new Response(JSON.stringify({ error: 'Missing email' }), { status: 400 });
        }

        console.log('Onboarding Portal Member: %s', email);

        // 1. Send Welcome Email to User
        await EmailService.sendMembershipWelcome(email, name || 'Member', 'Launchpad');

        // 2. Send Alert to Admin
        await EmailService.sendSystemAlert({
            subject: `🚀 [NEW MEMBER] ${email}`,
            text: `New member joined the portal: ${name} (${email})`
        });

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error('Onboarding Error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};

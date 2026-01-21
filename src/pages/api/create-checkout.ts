import type { APIRoute } from 'astro';
import Stripe from 'stripe';

// This endpoint must be server-rendered (not prerendered)
export const prerender = false;

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-12-15.clover',
});

// Price IDs mapped to tiers and billing periods
const PRICE_MAP: Record<string, Record<string, string>> = {
    launchpad: {
        monthly: 'price_1Ss4VfJD1n5R7a8mlgezlXoS',
        yearly: 'price_1Ss4VgJD1n5R7a8m6qHrn435',
    },
    director: {
        monthly: 'price_1Ss4VgJD1n5R7a8mSPQ9nAyu',
        yearly: 'price_1Ss4VhJD1n5R7a8ms1mezfi0',
    },
    ceo: {
        monthly: 'price_1Ss4VhJD1n5R7a8mpsxEyHFj',
        yearly: 'price_1Ss4ViJD1n5R7a8mfeZsiSIP',
    },
};

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { tier, billing } = body;

        // Validate inputs
        if (!tier || !billing) {
            return new Response(JSON.stringify({ error: 'Missing tier or billing period' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const priceId = PRICE_MAP[tier]?.[billing];
        if (!priceId) {
            return new Response(JSON.stringify({ error: 'Invalid tier or billing period' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Create embedded checkout session
        const session = await stripe.checkout.sessions.create({
            ui_mode: 'embedded',
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'payment',
            metadata: {
                tier: tier,
                billing: billing
            },
            return_url: `${new URL(request.url).origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        });

        return new Response(JSON.stringify({ clientSecret: session.client_secret }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Stripe checkout error:', error);
        return new Response(JSON.stringify({ error: 'Failed to create checkout session' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

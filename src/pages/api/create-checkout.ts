import type { APIRoute } from 'astro';
import Stripe from 'stripe';

export const prerender = false;

// Initialize Stripe with a valid API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || import.meta.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16' as any,
});

const PRICE_MAP: Record<string, Record<string, string>> = {
    launchpad: {
        monthly: 'price_1StatJQqnU6tynvLg7TvVVjd',
        yearly: 'price_1StatJQqnU6tynvLzQatSRG8',
    },
    director: {
        monthly: 'price_1StateQqnU6tynvLV3YdxtSI',
        yearly: 'price_1StateQqnU6tynvL2tXX2TTq',
    },
    ceo: {
        monthly: 'price_1StatyQqnU6tynvLl8SAv7SV',
        yearly: 'price_1StatxQqnU6tynvL96B88cPq',
    },
};

export const POST: APIRoute = async ({ request }) => {
    try {
        const { tier, billing } = await request.json();

        if (!tier || !billing) {
            return new Response(JSON.stringify({ error: 'Missing tier or billing' }), { status: 400 });
        }

        const priceId = PRICE_MAP[tier]?.[billing];
        if (!priceId) {
            return new Response(JSON.stringify({ error: 'Invalid plan selected' }), { status: 400 });
        }

        const session = await stripe.checkout.sessions.create({
            ui_mode: 'embedded',
            line_items: [{ price: priceId, quantity: 1 }],
            mode: 'subscription',
            return_url: `${new URL(request.url).origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        });

        return new Response(JSON.stringify({ clientSecret: session.client_secret }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err: any) {
        console.error('Checkout Error:', err.message);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

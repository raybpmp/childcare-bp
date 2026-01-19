/**
 * Stripe Configuration
 * 
 * This module initializes the Stripe SDK for client-side usage.
 * The publishable key is safe to expose in client code.
 */
import { loadStripe } from '@stripe/stripe-js';

// TODO: Replace with your actual Stripe publishable key from Dashboard > Developers > API keys
// Use VITE_STRIPE_PUBLISHABLE_KEY or PUBLIC_STRIPE_PUBLISHABLE_KEY in production
const STRIPE_PUBLISHABLE_KEY = import.meta.env.PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_YOUR_KEY_HERE';

// Singleton pattern - only load Stripe once
let stripePromise: ReturnType<typeof loadStripe> | null = null;

export const getStripe = () => {
    if (!stripePromise) {
        stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
    }
    return stripePromise;
};

// Export the key for use in Stripe pricing table embed
export const stripePublishableKey = STRIPE_PUBLISHABLE_KEY;

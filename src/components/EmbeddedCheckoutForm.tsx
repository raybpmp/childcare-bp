import React, { useState, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
    EmbeddedCheckoutProvider,
    EmbeddedCheckout,
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(
    import.meta.env.PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RwF9UJD1n5R7a8mMF3ASRY3VDnXrH679Rshiw9AsnhFqABOsTppv80EKaC9cXnit6pTlgB8xu55sQxYft1dmmsR00bXcZsYHb'
);

interface CheckoutFormProps {
    tier: 'launchpad' | 'director' | 'ceo';
    billing: 'monthly' | 'yearly';
    onClose?: () => void;
}

export default function EmbeddedCheckoutForm({ tier, billing, onClose }: CheckoutFormProps) {
    const [error, setError] = useState<string | null>(null);

    const fetchClientSecret = useCallback(async () => {
        try {
            const response = await fetch('https://portal.childcarebusinessplan.com/stripe/v1/create-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tier, billing }),
            });

            const text = await response.text();
            let data;

            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error("Invalid JSON response from server:", text);
                throw new Error("The payment server is momentarily unavailable. Please try again or contact support.");
            }

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create checkout session');
            }

            return data.clientSecret;
        } catch (err) {
            console.error("Checkout creation error:", err);
            setError(err instanceof Error ? err.message : 'An error occurred initializing checkout');
            throw err;
        }
    }, [tier, billing]);

    if (error) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                    onClick={() => setError(null)}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto">
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                    aria-label="Close"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
            <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={{ fetchClientSecret }}
            >
                <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
        </div>
    );
}

import { persistentAtom } from '@nanostores/persistent';
import { onAuthStateChanged, auth } from '../lib/firebase-client';

/**
 * Shared Auth Store using NanoStores Persistence
 * Fixed the "dumbass" re-check architecture by caching the Firebase session hint.
 * No more hard-coded "mini-database" Schema — we store the full serializable user state.
 */
export const $authStore = persistentAtom<any | null>(
    'ccbp_user_state',
    null,
    {
        encode: JSON.stringify,
        decode: (val) => {
            try {
                return JSON.parse(val);
            } catch (e) {
                return null;
            }
        },
    }
);

if (typeof window !== 'undefined') {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // Force-refresh token to always get latest Custom Claims
            // Claims are set by the claims-api service (port 4100)
            const tokenResult = await user.getIdTokenResult(true);
            $authStore.set({
                ...user.toJSON(),
                role: (tokenResult.claims.role as string) || 'Member',
                tierId: (tokenResult.claims.tierId as number) || 3
            });
        } else {
            $authStore.set(null);
        }
    });
}


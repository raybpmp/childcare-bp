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
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Store the full serializable JSON version without hard-coding fields.
            $authStore.set(user.toJSON());
        } else {
            $authStore.set(null);
        }
    });
}

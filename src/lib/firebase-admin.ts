import admin from 'firebase-admin';

/**
 * Firebase Admin Initialization
 * 
 * This module initializes the Firebase Admin SDK for server-side usage.
 * It uses service account credentials in development and default credentials in production.
 */

if (!admin.apps.length) {
    try {
        // Use service account if path is provided in .env, otherwise fall back to applicationDefault()
        const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

        admin.initializeApp({
            credential: serviceAccountPath
                ? admin.credential.cert(serviceAccountPath)
                : admin.credential.applicationDefault(),
            projectId: 'childcare-bp'
        });
        console.log('Firebase Admin initialized successfully');
    } catch (error) {
        console.error('Firebase Admin initialization error:', error);
    }
}


import { getFirestore } from 'firebase-admin/firestore';

// ... existing code ...

if (!admin.apps.length) {
    try {
        // In production (Firebase/Google Cloud), applicationDefault() handles everything
        // In development, you should have GOOGLE_APPLICATION_CREDENTIALS set
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            projectId: 'childcare-bp'
        });
        console.log('Firebase Admin initialized successfully');
    } catch (error) {
        console.error('Firebase Admin initialization error:', error);
    }
}

// Explicitly target the 'default' database (distinct from '(default)')
export const db = getFirestore(admin.app(), 'default');
export const auth = admin.auth();
export default admin;

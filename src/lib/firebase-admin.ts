import admin from 'firebase-admin';

/**
 * Firebase Admin Initialization
 * 
 * This module initializes the Firebase Admin SDK for server-side usage.
 * It uses service account credentials in development and default credentials in production.
 */

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

export const db = admin.firestore();
export const auth = admin.auth();
export default admin;

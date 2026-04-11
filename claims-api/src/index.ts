import express from 'express';
import cors from 'cors';
import * as admin from 'firebase-admin';
import path from 'path';

/**
 * Claims API — Firebase Custom Claims Management Service
 *
 * One job: Stamp user roles into Firebase Auth tokens.
 *
 * Architecture:
 *   MariaDB (SOT for business data) ←→ portal-api (mirror)
 *   Firebase Auth (SOT for access level) ←→ claims-api (THIS SERVICE)
 *   Stripe (payment processing) ←→ stripe service
 *
 * When a user's role changes in MariaDB, this service is called to
 * sync that role into the Firebase token via Custom Claims.
 * The frontend then reads the claims from the token — zero DB round-trips.
 */

// --- Firebase Admin (Custom Claims management) ---
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT || path.join(__dirname, '../service-account.json');
admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath))
});

const app = express();
app.use(cors({
    origin: [
        'https://www.childcarebusinessplan.com',
        'https://childcarebusinessplan.com',
        'http://localhost:4321'
    ],
    methods: ['POST', 'GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

/**
 * POST /api/v1/set-claims
 * 
 * Stamps a user's role and tier into their Firebase Auth token.
 * After this call, the user's next token refresh will contain these claims.
 *
 * Body: { uid: string, role: string, tierId: number }
 *
 * Called by:
 *   - Frontend after user registration (default claims)
 *   - Admin dashboard after manual role change
 *   - One-time seed scripts for existing users
 */
app.post('/api/v1/set-claims', async (req: any, res: any) => {
    const { uid, role, tierId } = req.body;

    if (!uid) {
        return res.status(400).json({ error: 'Missing uid' });
    }

    try {
        await admin.auth().setCustomUserClaims(uid, {
            role: role || 'Member',
            tierId: tierId || 3
        });

        console.log(`Claims set for ${uid}: role=${role}, tierId=${tierId}`);
        res.json({ success: true, uid, role, tierId });
    } catch (error: any) {
        console.error('Set claims error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/v1/get-claims/:uid
 * 
 * Reads the current Custom Claims for a user.
 * Useful for debugging and admin verification.
 */
app.get('/api/v1/get-claims/:uid', async (req: any, res: any) => {
    const { uid } = req.params;

    try {
        const userRecord = await admin.auth().getUser(uid);
        res.json({
            uid: userRecord.uid,
            email: userRecord.email,
            claims: userRecord.customClaims || {}
        });
    } catch (error: any) {
        console.error('Get claims error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/v1/sync-claims
 * 
 * Bulk sync: reads role/tier from the request body for multiple users
 * and stamps all their claims at once. Useful for initial migration.
 * 
 * Body: { users: [{ uid, role, tierId }, ...] }
 */
app.post('/api/v1/sync-claims', async (req: any, res: any) => {
    const { users } = req.body;

    if (!users || !Array.isArray(users)) {
        return res.status(400).json({ error: 'Missing users array' });
    }

    const results: any[] = [];
    for (const user of users) {
        try {
            await admin.auth().setCustomUserClaims(user.uid, {
                role: user.role || 'Member',
                tierId: user.tierId || 3
            });
            results.push({ uid: user.uid, success: true });
        } catch (error: any) {
            results.push({ uid: user.uid, success: false, error: error.message });
        }
    }

    res.json({ results });
});

// --- Health Check ---
app.get('/api/health', (_req: any, res: any) => {
    res.json({ service: 'claims-api', status: 'healthy', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 4100;
app.listen(PORT, () => {
    console.log(`Claims API running on port ${PORT}`);
});

import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import axios from 'axios';
import cors from 'cors';
import * as admin from 'firebase-admin';
import mariadb from 'mariadb';

// Initialize Firebase (Expects Request Default Credentials or GOOGLE_APPLICATION_CREDENTIALS)
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp();
} else {
    console.warn("⚠️ No Google Credentials found. functionality may be limited.");
}

dotenv.config();

const app = express();
app.use(cors({
    origin: [
        'https://www.childcarebusinessplan.com',
        'https://childcarebusinessplan.com',
        'http://localhost:4321'
    ],
    methods: ['POST', 'GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));
const port = process.env.PORT || 3000;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20' as any,
});

// Database Pool
const pool = mariadb.createPool({
    host: process.env.DB_HOST || 'frappe_docker-db-1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '@sodium1223',
    database: process.env.DB_NAME || 'ccbp_portal',
    connectionLimit: 5
});

// Mapping Price ID -> Program Name
const PRODUCT_TO_PROGRAM: Record<string, string> = {
    'price_1StatJQqnU6tynvLg7TvVVjd': 'Launchpad Program',
    'price_1StatJQqnU6tynvLzQatSRG8': 'Launchpad Program',
    'price_1StateQqnU6tynvLV3YdxtSI': 'Director Program',
    'price_1StateQqnU6tynvL2tXX2TTq': 'Director Program',
    'price_1StatyQqnU6tynvLl8SAv7SV': 'CEO Program',
    'price_1StatxQqnU6tynvL96B88cPq': 'CEO Program',
};

// Mapping Price ID -> MariaDB Tier ID (Ref: 01_create_manifest.sql)
const PRODUCT_TO_TIER_ID: Record<string, number> = {
    'price_1StatJQqnU6tynvLg7TvVVjd': 4, // Launchpad
    'price_1StatJQqnU6tynvLzQatSRG8': 4,
    'price_1StateQqnU6tynvLV3YdxtSI': 5, // Director
    'price_1StateQqnU6tynvL2tXX2TTq': 5,
    'price_1StatyQqnU6tynvLl8SAv7SV': 6, // Ceo Circle
    'price_1StatxQqnU6tynvL96B88cPq': 6,
};

const PRODUCT_TO_PROJECT_TEMPLATE: Record<string, string | undefined> = {
    'price_1StateQqnU6tynvLV3YdxtSI': 'Director Onboarding',
    'price_1StateQqnU6tynvL2tXX2TTq': 'Director Onboarding',
    'price_1StatyQqnU6tynvLl8SAv7SV': 'CEO Onboarding',
    'price_1StatxQqnU6tynvL96B88cPq': 'CEO Onboarding',
};

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

// Create Stripe Checkout Session
app.post('/v1/create-session', express.json(), async (req: express.Request, res: express.Response) => {
    try {
        const { tier, billing } = req.body;
        if (!tier || !billing) return res.status(400).json({ error: 'Missing tier or billing' });

        const priceId = PRICE_MAP[tier]?.[billing];
        if (!priceId) return res.status(400).json({ error: 'Invalid plan selected' });

        const session = await stripe.checkout.sessions.create({
            ui_mode: 'embedded',
            line_items: [{ price: priceId, quantity: 1 }],
            mode: 'subscription',
            return_url: `https://www.childcarebusinessplan.com/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        });

        res.json({ clientSecret: session.client_secret });
    } catch (err: any) {
        console.error('Session Creation Error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Webhook handler
app.post('/v1/stripe', express.raw({ type: 'application/json' }), async (req: express.Request, res: express.Response) => {
    const sig = req.headers['stripe-signature'];
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`Processing Order for ${session.customer_email}`);

        try {
            await onboardCustomer(session);
            res.json({ received: true, status: 'onboarded' });
        } catch (error: any) {
            console.error(`Onboarding Failed: ${error.message}`);
            res.status(500).json({ error: 'Onboarding Failed', details: error.message });
        }
    } else {
        res.json({ received: true });
    }
});

async function onboardCustomer(session: Stripe.Checkout.Session) {
    const email = session.customer_email || session.customer_details?.email;
    if (!email) throw new Error('No customer email found');

    const name = session.customer_details?.name || email.split('@')[0];
    
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    const priceId = lineItems.data[0]?.price?.id;
    if (!priceId || !PRODUCT_TO_PROGRAM[priceId]) {
        throw new Error(`Price ID ${priceId} not mapped to any program`);
    }

    const program = PRODUCT_TO_PROGRAM[priceId];
    const tierId = PRODUCT_TO_TIER_ID[priceId];
    const projectTemplate = PRODUCT_TO_PROJECT_TEMPLATE[priceId];

    // --- REPLACING FRAPPE WITH NATIVE MARIADB (SOT) ---
    let conn;
    try {
        conn = await pool.getConnection();
        console.log(`- Connection to SOT Established for ${email}`);

        // 1. Ensure User exists and upgrade Tier (Manifest Binding)
        // Note: If uid is missing (paid before signup), we assign a placeholder to be linked later.
        const [existingUser]: any = await conn.query('SELECT uid FROM users WHERE email = ?', [email]);
        let userUid = '';

        if (existingUser) {
            userUid = existingUser.uid;
            await conn.query('UPDATE users SET tier_id = ?, role = ? WHERE uid = ?', [tierId, program.split(' ')[0], userUid]);
            console.log(`- Step 1 & 2: User ${email} tier upgraded to ${tierId}`);
        } else {
            userUid = `stripe_${Date.now()}`;
            await conn.query(
                'INSERT INTO users (uid, email, name, tier_id, role) VALUES (?, ?, ?, ?, ?)',
                [userUid, email, name, tierId, program.split(' ')[0]]
            );
            console.log(`- Step 1 & 2: Temporary User created for ${email}`);
        }

        // 2. Record Sales Ledger (Replaces Frappe Invoice)
        await conn.query(
            'INSERT INTO sales_ledger (user_uid, stripe_session_id, payment_intent_id, amount_cents, purchased_tier_id) VALUES (?, ?, ?, ?, ?)',
            [userUid, session.id, session.payment_intent || '', session.amount_total || 0, tierId]
        );
        console.log(`- Step 3: Sales record created in MariaDB`);

        // 3. Record Enrollment (Replaces Frappe LMS Enrollment)
        await conn.query(
            'INSERT INTO enrollments (user_uid, tier_id, enrollment_date) VALUES (?, ?, ?)',
            [userUid, tierId, new Date().toISOString().split('T')[0]]
        );
        console.log(`- Step 4: Enrollment created in MariaDB`);

        // 4. Record Project if applicable (Replaces Frappe Project)
        if (projectTemplate) {
            await conn.query(
                'INSERT INTO projects (user_uid, project_name, project_template) VALUES (?, ?, ?)',
                [userUid, `${name} - Onboarding`, projectTemplate]
            );
            console.log(`- Step 5: Onboarding project logged in MariaDB`);
        }

    } catch (err) {
        console.error('! MariaDB SOT Update Failed:', err);
        throw err;
    } finally {
        if (conn) conn.release();
    }

    // --- PILLAR 1: FIREBASE DATABASE (BACKUP) ---
    try {
        const db = admin.firestore();
        await db.collection('sales').add({
            email,
            name,
            program,
            amount: session.amount_total || 0,
            stripeSessionId: session.id,
            stripePaymentIntentId: session.payment_intent,
            createdAt: new Date().toISOString(),
        });
        console.log(`- Saved to Firestore Backup`);
    } catch (e: any) {
        console.error(`! Firestore Backup Failed: ${e.message}`);
    }

    // --- PILLAR 3: EMAIL ALERT (VIA WEBSITE BRIDGE) ---
    try {
        const websiteUrl = process.env.WEBSITE_URL || 'https://www.childcarebusinessplan.com';
        await axios.post(`${websiteUrl}/api/internal/sale-alert`, {
            email,
            program,
            amount: session.amount_total || 0,
            'Customer Name': name,
            'Stripe Session': session.id,
            'Target Tier': tierId
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.FRAPPE_API_SECRET}` 
            }
        });
        console.log(`- Triggered Website Email Alert`);
    } catch (e: any) {
        console.error(`! Email Bridge Failed: ${e.message}`);
    }
}

app.listen(port, () => {
    console.log(`Stripe Webhook Gateway (MariaDB SOT) running on port ${port}`);
});

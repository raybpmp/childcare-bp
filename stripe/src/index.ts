import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-12-15.clover' as any,
});

const FRAPPE_URL = process.env.FRAPPE_URL || 'http://frappe_docker-frontend-1:8080';
const FRAPPE_API_KEY = process.env.FRAPPE_API_KEY;
const FRAPPE_API_SECRET = process.env.FRAPPE_API_SECRET;

// Mapping
const PRODUCT_TO_PROGRAM: Record<string, string> = {
    'price_1Ss4VfJD1n5R7a8mlgezlXoS': 'Launchpad Program',
    'price_1Ss4VgJD1n5R7a8m6qHrn435': 'Launchpad Program',
    'price_1Ss4VgJD1n5R7a8mSPQ9nAyu': 'Director Program',
    'price_1Ss4VhJD1n5R7a8ms1mezfi0': 'Director Program',
    'price_1Ss4VhJD1n5R7a8mpsxEyHFj': 'CEO Program',
    'price_1Ss4ViJD1n5R7a8mfeZsiSIP': 'CEO Program',
};

const PRODUCT_TO_PROJECT_TEMPLATE: Record<string, string | undefined> = {
    'price_1Ss4VgJD1n5R7a8mSPQ9nAyu': 'Director Onboarding',
    'price_1Ss4VhJD1n5R7a8ms1mezfi0': 'Director Onboarding',
    'price_1Ss4VhJD1n5R7a8mpsxEyHFj': 'CEO Onboarding',
    'price_1Ss4ViJD1n5R7a8mfeZsiSIP': 'CEO Onboarding',
};

const PRODUCT_TO_EMAIL_TEMPLATE: Record<string, string> = {
    'price_1Ss4VfJD1n5R7a8mlgezlXoS': 'Welcome - Launchpad',
    'price_1Ss4VgJD1n5R7a8m6qHrn435': 'Welcome - Launchpad',
    'price_1Ss4VgJD1n5R7a8mSPQ9nAyu': 'Welcome - Director',
    'price_1Ss4VhJD1n5R7a8ms1mezfi0': 'Welcome - Director',
    'price_1Ss4VhJD1n5R7a8mpsxEyHFj': 'Welcome - CEO',
    'price_1Ss4ViJD1n5R7a8mfeZsiSIP': 'Welcome - CEO',
};

const frappe = axios.create({
    baseURL: FRAPPE_URL,
    headers: {
        'Authorization': `token ${FRAPPE_API_KEY}:${FRAPPE_API_SECRET}`,
        'Content-Type': 'application/json',
    },
});

// Use raw body for Stripe signature verification
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
    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ') || '';

    // 1. Get Price ID (Product)
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    const priceId = lineItems.data[0]?.price?.id;
    if (!priceId || !PRODUCT_TO_PROGRAM[priceId]) {
        throw new Error(`Price ID ${priceId} not mapped to any program`);
    }

    const program = PRODUCT_TO_PROGRAM[priceId];

    // 1. Find or Create User
    let userId: string;
    try {
        const userRes = await frappe.get(`/api/resource/User/${email}`);
        userId = userRes.data.data.name;
        console.log(`- Existing User Found: ${userId}`);
    } catch (e) {
        const userRes = await frappe.post('/api/resource/User', {
            email,
            first_name: firstName,
            last_name: lastName,
            enabled: 1,
            send_welcome_email: 0,
            user_type: 'Website User', // Access to portal only
            role_profile_name: 'Customer',
            module_profile: 'Customer Modules',
        });
        userId = userRes.data.data.name;
        console.log(`- New User Created: ${userId}`);
    }

    // 2. Find or Create Customer
    let customerId: string;
    const custSearch = await frappe.get(`/api/resource/Customer`, {
        params: { filters: JSON.stringify([['email_id', '=', email]]) }
    });

    if (custSearch.data.data.length > 0) {
        customerId = custSearch.data.data[0].name;
        console.log(`- Existing Customer Found: ${customerId}`);
    } else {
        const custRes = await frappe.post('/api/resource/Customer', {
            customer_name: name,
            customer_type: 'Individual',
            email_id: email,
            territory: 'United States',
            customer_group: 'Individual',
        });
        customerId = custRes.data.data.name;
        console.log(`- New Customer Created: ${customerId}`);
    }

    // 3. Create Paid Sales Invoice
    const invoiceRes = await frappe.post('/api/resource/Sales Invoice', {
        customer: customerId,
        posting_date: new Date().toISOString().split('T')[0],
        items: [{
            item_code: program.replace(/ /g, '_').toLowerCase(),
            qty: 1,
            rate: (session.amount_total || 0) / 100,
        }],
        is_paid: 1,
        remarks: `Stripe Ref: ${session.payment_intent}`,
    });
    console.log(`- Sales Invoice Created: ${invoiceRes.data.data.name}`);

    // 4. LMS Enrollment
    const enrollRes = await frappe.post('/api/resource/LMS Enrollment', {
        member: userId,
        program: program,
        enrollment_date: new Date().toISOString().split('T')[0],
    });
    console.log(`- LMS Enrollment Created: ${enrollRes.data.data.name}`);

    // 5. Create Project (If applicable)
    const template = PRODUCT_TO_PROJECT_TEMPLATE[priceId];
    if (template) {
        const projRes = await frappe.post('/api/resource/Project', {
            project_name: `${name} - Onboarding`,
            project_template: template,
            status: 'Open',
        });
        console.log(`- Onboarding Project Created: ${projRes.data.data.name}`);
    }

    // 6. Send Welcome Email
    const templateName = PRODUCT_TO_EMAIL_TEMPLATE[priceId];
    await frappe.post('/api/method/frappe.core.doctype.communication.email.make', {
        recipients: email,
        template: templateName,
        doctype: 'User',
        name: userId,
    });
    console.log(`- Welcome Email Sent via Template: ${templateName}`);
}

app.listen(port, () => {
    console.log(`Stripe Webhook Gateway running on port ${port}`);
});

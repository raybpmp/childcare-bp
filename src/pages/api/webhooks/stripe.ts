import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { sendEmail } from '@/lib/mailer';

export const prerender = false;

// Environment variables
const STRIPE_SECRET_KEY = import.meta.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = import.meta.env.STRIPE_WEBHOOK_SECRET;
const FRAPPE_URL = import.meta.env.FRAPPE_URL || 'https://portal.childcarebusinessplan.com';
const FRAPPE_API_KEY = import.meta.env.FRAPPE_API_KEY;
const FRAPPE_API_SECRET = import.meta.env.FRAPPE_API_SECRET;

// Initialize Stripe
const stripe = new Stripe(STRIPE_SECRET_KEY!, {
    apiVersion: '2025-12-15.clover',
});

// Product ID to Program mapping
// IMPORTANT: These are actual Stripe Price IDs. If you recreate prices in Stripe, update these!
// See /stripe/PRICE_ID_MANAGEMENT.md for details
const PRODUCT_TO_PROGRAM: Record<string, string> = {
    // Launchpad - $99/mo, $499/yr
    'price_1StatJQqnU6tynvLg7TvVVjd': 'Launchpad Program',  // Monthly
    'price_1StatJQqnU6tynvLzQatSRG8': 'Launchpad Program',  // Yearly

    // Director - $349/mo, $2,499/yr
    'price_1StateQqnU6tynvLV3YdxtSI': 'Director Program',   // Monthly
    'price_1StateQqnU6tynvL2tXX2TTq': 'Director Program',   // Yearly

    // CEO Circle - $749/mo, $5,500/yr
    'price_1StatyQqnU6tynvLl8SAv7SV': 'CEO Program',        // Monthly
    'price_1StatxQqnU6tynvL96B88cPq': 'CEO Program',        // Yearly
};

// Product ID to Project Template mapping (only for high-touch tiers)
const PRODUCT_TO_PROJECT_TEMPLATE: Record<string, string | undefined> = {
    // Director - Gets onboarding project
    'price_1StateQqnU6tynvLV3YdxtSI': 'Director Onboarding',  // Monthly
    'price_1StateQqnU6tynvL2tXX2TTq': 'Director Onboarding',  // Yearly

    // CEO Circle - Gets onboarding project
    'price_1StatyQqnU6tynvLl8SAv7SV': 'CEO Onboarding',       // Monthly
    'price_1StatxQqnU6tynvL96B88cPq': 'CEO Onboarding',       // Yearly

    // Launchpad: No project (self-serve tier)
};

// Product ID to Welcome Email Template mapping
const PRODUCT_TO_EMAIL_TEMPLATE: Record<string, string> = {
    // Launchpad
    'price_1StatJQqnU6tynvLg7TvVVjd': 'Welcome - Launchpad',
    'price_1StatJQqnU6tynvLzQatSRG8': 'Welcome - Launchpad',

    // Director
    'price_1StateQqnU6tynvLV3YdxtSI': 'Welcome - Director',
    'price_1StateQqnU6tynvL2tXX2TTq': 'Welcome - Director',

    // CEO Circle
    'price_1StatyQqnU6tynvLl8SAv7SV': 'Welcome - CEO',
    'price_1StatxQqnU6tynvL96B88cPq': 'Welcome - CEO',
};

interface OnboardingResult {
    success: boolean;
    step: string;
    userId?: string;
    customerId?: string;
    invoiceId?: string;
    enrollmentId?: string;
    projectId?: string;
    emailSent?: boolean;
    error?: string;
}

/**
 * Helper function to call Frappe API
 */
async function callFrappeAPI(endpoint: string, method: 'GET' | 'POST' | 'PUT' = 'GET', data?: any) {
    const url = `${FRAPPE_URL}${endpoint}`;
    const options: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `token ${FRAPPE_API_KEY}:${FRAPPE_API_SECRET}`,
        },
    };

    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Frappe API error (${response.status}): ${errorText}`);
    }

    return response.json();
}

/**
 * Step 1: Find or Create User
 */
async function findOrCreateUser(email: string, firstName: string, lastName: string): Promise<string> {
    try {
        // Try to find existing user
        const existingUser = await callFrappeAPI(`/api/resource/User/${email}`);
        console.log(`User ${email} already exists`);
        return email;
    } catch (error) {
        // User doesn't exist, create new one
        console.log(`Creating new user: ${email}`);

        const result = await callFrappeAPI('/api/resource/User', 'POST', {
            doctype: 'User',
            email: email,
            first_name: firstName,
            last_name: lastName,
            enabled: 1,
            send_welcome_email: 0,
            user_type: 'Website User',
            role_profile_name: 'Customer',
            module_profile: 'Customer Modules',
        });

        return result.data.name;
    }
}

/**
 * Step 2: Find or Create Customer
 */
async function findOrCreateCustomer(email: string, customerName: string): Promise<string> {
    try {
        // Search for existing customer by email
        const existingCustomers = await callFrappeAPI(
            `/api/resource/Customer?filters=[["email_id","=","${email}"]]&fields=["name"]`
        );

        if (existingCustomers.data && existingCustomers.data.length > 0) {
            console.log(`Customer for ${email} already exists: ${existingCustomers.data[0].name}`);
            return existingCustomers.data[0].name;
        }
    } catch (error) {
        console.log('No existing customer found, creating new one');
    }

    // Create new customer
    const result = await callFrappeAPI('/api/resource/Customer', 'POST', {
        doctype: 'Customer',
        customer_name: customerName,
        customer_type: 'Individual',
        customer_group: 'Individual',
        territory: 'United States',
        email_id: email,
    });

    return result.data.name;
}

/**
 * Step 3: Create Sales Invoice
 */
async function createSalesInvoice(
    customerId: string,
    productId: string,
    amount: number,
    stripePaymentIntentId: string
): Promise<string> {
    const programName = PRODUCT_TO_PROGRAM[productId];

    const result = await callFrappeAPI('/api/resource/Sales Invoice', 'POST', {
        doctype: 'Sales Invoice',
        customer: customerId,
        posting_date: new Date().toISOString().split('T')[0],
        due_date: new Date().toISOString().split('T')[0],
        items: [{
            item_code: programName.replace(' ', '_').toLowerCase(),
            item_name: programName,
            description: `Subscription to ${programName}`,
            qty: 1,
            rate: amount / 100, // Convert cents to dollars
        }],
        payment_schedule: [],
        is_paid: 1,
        remarks: `Stripe Payment Intent: ${stripePaymentIntentId}`,
    });

    return result.data.name;
}

/**
 * Step 4: Create LMS Enrollment
 */
async function createLMSEnrollment(userId: string, productId: string): Promise<string> {
    const programName = PRODUCT_TO_PROGRAM[productId];

    const result = await callFrappeAPI('/api/resource/LMS Enrollment', 'POST', {
        doctype: 'LMS Enrollment',
        member: userId,
        program: programName,
        enrollment_date: new Date().toISOString().split('T')[0],
        progress: 0,
    });

    return result.data.name;
}

/**
 * Step 5: Create Onboarding Project (Optional - only for Director & CEO tiers)
 */
async function createOnboardingProject(userId: string, customerId: string, productId: string): Promise<string | undefined> {
    const projectTemplate = PRODUCT_TO_PROJECT_TEMPLATE[productId];

    if (!projectTemplate) {
        console.log('No project template for this tier (Launchpad is self-serve)');
        return undefined;
    }

    const result = await callFrappeAPI('/api/resource/Project', 'POST', {
        doctype: 'Project',
        project_name: `${customerId} - ${projectTemplate}`,
        project_template: projectTemplate,
        status: 'Open',
        priority: 'High',
        users: [{
            user: userId,
        }],
    });

    return result.data.name;
}

/**
 * Step 6: Send Welcome Email
 */
async function sendWelcomeEmail(userId: string, productId: string): Promise<boolean> {
    const emailTemplate = PRODUCT_TO_EMAIL_TEMPLATE[productId];

    try {
        await callFrappeAPI('/api/method/frappe.core.doctype.communication.email.make', 'POST', {
            recipients: userId,
            template: emailTemplate,
            doctype: 'User',
            name: userId,
        });

        return true;
    } catch (error) {
        console.error('Failed to send welcome email:', error);
        return false;
    }
}

/**
 * Main webhook handler
 */
export const POST: APIRoute = async ({ request }) => {
    const sig = request.headers.get('stripe-signature');

    if (!sig) {
        return new Response(JSON.stringify({ error: 'No signature' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    let event: Stripe.Event;

    try {
        const rawBody = await request.text();
        event = stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        // Extract customer information
        const customerEmail = session.customer_email || session.customer_details?.email;
        const customerName = session.customer_details?.name || customerEmail?.split('@')[0] || 'Customer';
        const [firstName, ...lastNameParts] = customerName.split(' ');
        const lastName = lastNameParts.join(' ') || firstName;

        // Extract product information
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        const priceId = lineItems.data[0]?.price?.id;
        const amount = session.amount_total || 0;
        const paymentIntentId = session.payment_intent as string;

        if (!customerEmail || !priceId) {
            console.error('Missing required data from session');
            return new Response(JSON.stringify({ error: 'Missing required data' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Execute 6-step onboarding flow
        const result: OnboardingResult = {
            success: false,
            step: 'initialization',
        };

        try {
            // Step 1: Find/Create User
            result.step = 'user';
            result.userId = await findOrCreateUser(customerEmail, firstName, lastName);
            console.log(`✓ Step 1 complete: User ${result.userId}`);

            // Step 2: Find/Create Customer
            result.step = 'customer';
            result.customerId = await findOrCreateCustomer(customerEmail, customerName);
            console.log(`✓ Step 2 complete: Customer ${result.customerId}`);

            // Step 3: Create Sales Invoice
            result.step = 'invoice';
            result.invoiceId = await createSalesInvoice(result.customerId, priceId, amount, paymentIntentId);
            console.log(`✓ Step 3 complete: Invoice ${result.invoiceId}`);

            // Step 4: Create LMS Enrollment
            result.step = 'enrollment';
            result.enrollmentId = await createLMSEnrollment(result.userId, priceId);
            console.log(`✓ Step 4 complete: Enrollment ${result.enrollmentId}`);

            // Step 5: Create Onboarding Project (if applicable)
            result.step = 'project';
            result.projectId = await createOnboardingProject(result.userId, result.customerId, priceId);
            if (result.projectId) {
                console.log(`✓ Step 5 complete: Project ${result.projectId}`);
            } else {
                console.log(`○ Step 5 skipped: No project for this tier`);
            }

            // Step 6: Send Welcome Email
            result.step = 'email';
            result.emailSent = await sendWelcomeEmail(result.userId, priceId);
            console.log(`✓ Step 6 complete: Email sent = ${result.emailSent}`);

            // PART 7: Team Sale Alert (SMTP)
            try {
                const programName = PRODUCT_TO_PROGRAM[priceId] || 'Unknown Program';
                await sendEmail({
                    subject: `💰 [SALE] ${customerEmail} purchased ${programName}`,
                    text: `
                        A new sale has been completed on the website!
                        
                        Customer Details:
                        - Name: ${customerName}
                        - Email: ${customerEmail}
                        
                        Purchase Details:
                        - Program: ${programName}
                        - Amount: $${(amount / 100).toFixed(2)}
                        - Stripe Session: ${session.id}
                        
                        Onboarding Status:
                        - Frappe User: ${result.userId}
                        - Frappe Customer: ${result.customerId}
                        - Enrollment: ${result.enrollmentId}
                        - Project: ${result.projectId || 'N/A'}
                        
                        The customer has been added to ERPNext and enrolled in the LMS.
                    `
                });
            } catch (mailError) {
                console.error('Sale SMTP alert failed:', mailError);
            }

            result.success = true;
            result.step = 'completed';

            console.log('=== ONBOARDING COMPLETE ===');
            console.log(JSON.stringify(result, null, 2));

        } catch (error: any) {
            console.error(`Error at step ${result.step}:`, error);
            result.error = error.message;

            return new Response(JSON.stringify({
                error: 'Onboarding failed',
                step: result.step,
                details: error.message,
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Customer onboarded successfully',
            result,
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // Return success for other event types (we're only handling checkout.session.completed)
    return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
};

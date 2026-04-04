import type { APIRoute } from 'astro';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

export const prerender = false;

/**
 * POST /api/generate-business-plan
 *
 * 1. Validates required fields (name + email)
 * 2. Reads the SOT product.html template
 * 3. Injects the user's data into sync-class inputs
 * 4. Puppeteer renders → PDF buffer
 * 5. Sends lead data to existing Cloud Function via `leadCapture` action  
 *    (zero modifications to emailService.ts or index.ts)
 * 6. Returns PDF base64 to frontend for download
 */

/** Cloud Function URL — same as src/lib/EmailService.ts */
const FUNCTIONS_URL_DEV = 'http://127.0.0.1:5001/childcare-bp/us-central1/sendEmail';
const FUNCTIONS_URL_PROD = 'https://us-central1-childcare-bp.cloudfunctions.net/sendEmail';
const IS_DEV = process.env.NODE_ENV === 'development';
const FUNCTIONS_URL = IS_DEV ? FUNCTIONS_URL_DEV : FUNCTIONS_URL_PROD;

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();

        // ── Validate the only required fields ──
        const { name, email } = body;
        if (!name || !email) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields: name, email' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // ── Step 1: Read SOT HTML template ──
        const templatePath = path.join(process.cwd(), 'src', 'components', 'tools', 'product.html');
        let htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

        // ── Step 2: Inject user values into sync-class inputs ──
        const injectMap: { syncClass: string; value: string }[] = [
            { syncClass: 'sync-co-name', value: body.companyName || '' },
            { syncClass: 'sync-addr', value: body.address || '' },
            { syncClass: 'sync-location', value: body.cityStateZip || '' },
            { syncClass: 'sync-url', value: body.website || '' },
            { syncClass: 'sync-owner', value: body.name || '' },
            { syncClass: 'sync-title', value: body.title || '' },
            { syncClass: 'sync-phone', value: body.phone || '' },
            { syncClass: 'sync-email', value: body.email || '' },
        ];

        for (const { syncClass, value } of injectMap) {
            const regex = new RegExp(
                `(class="[^"]*${syncClass}[^"]*"[^>]*value=")[^"]*"`,
                'g'
            );
            htmlTemplate = htmlTemplate.replace(regex, `$1${escapeHtml(value)}"`);
        }

        // Also update display-class spans
        const displayMap: { displayClass: string; value: string }[] = [
            { displayClass: 'display-co-name', value: body.companyName || '[Company Name]' },
            { displayClass: 'display-owner', value: body.name || '[Owner]' },
            { displayClass: 'display-location', value: body.cityStateZip || '[Location]' },
            { displayClass: 'display-addr', value: body.address || '[Address]' },
            { displayClass: 'display-url', value: body.website || '[Website]' },
            { displayClass: 'display-city', value: body.cityStateZip?.split(',')[0]?.trim() || '[City]' },
        ];

        for (const { displayClass, value } of displayMap) {
            const regex = new RegExp(
                `(<span class="${displayClass}">)[^<]*(<\\/span>)`,
                'g'
            );
            htmlTemplate = htmlTemplate.replace(regex, `$1${escapeHtml(value)}$2`);
        }

        // ── Step 3: Generate PDF with Puppeteer ──
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();
        await page.setContent(htmlTemplate, { waitUntil: 'load' });
        await new Promise(r => setTimeout(r, 800));

        const pdfBuffer = await page.pdf({
            format: 'Letter',
            printBackground: true,
            margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
        });

        await browser.close();

        // ── Step 4: Send lead to Cloud Function using existing `leadCapture` action ──
        // Uses the EXACT same action the QuizFunnel uses. Zero Cloud Function changes.
        const leadPayload = {
            action: 'leadCapture',
            payload: {
                email: body.email,
                funnelSegment: 'Startup',
                utmSource: 'business-plan-tool',
                quizData: {
                    source: 'business-plan-generator',
                    name: body.name,
                    companyName: body.companyName || null,
                    title: body.title || null,
                    phone: body.phone || null,
                    address: body.address || null,
                    cityStateZip: body.cityStateZip || null,
                    website: body.website || null,
                },
            },
        };

        // Fire-and-await — we want to confirm lead capture before responding
        try {
            await fetch(FUNCTIONS_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(leadPayload),
            });
        } catch (emailErr) {
            console.error('Lead capture dispatch failed (non-fatal):', emailErr);
        }

        // ── Step 5: Return PDF to frontend ──
        return new Response(
            JSON.stringify({
                success: true,
                pdf: Buffer.from(pdfBuffer).toString('base64'),
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error: any) {
        console.error('Business Plan Generation Error:', error);
        return new Response(
            JSON.stringify({ error: error.message || 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

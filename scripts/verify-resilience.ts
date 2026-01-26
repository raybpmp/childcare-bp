
import { POST } from '../src/pages/api/capture-lead';
import { EmailService } from '../src/lib/EmailService';

// Mock the Request object standard in Astro
function createMockRequest(body: any): Request {
    return {
        json: async () => body,
        headers: new Map(),
    } as unknown as Request;
}

// Mock EmailService to simulate failures without spamming real SMTP
// We want to test the API Handler's logic, not Postmark's uptime.
const originalProcessLeadCapture = EmailService.processLeadCapture;

async function verifyResilience() {
    console.log('🛡️ Starting Code Resilience & Failure Mode Verification');
    let passed = 0;
    let failed = 0;

    const runTest = async (name: string, fn: () => Promise<boolean>) => {
        process.stdout.write(`   Testing ${name.padEnd(40)} `);
        try {
            const success = await fn();
            if (success) {
                console.log('✅ PASS');
                passed++;
            } else {
                console.log('❌ FAIL');
                failed++;
            }
        } catch (e) {
            console.log('❌ CRASH', e);
            failed++;
        }
    };

    // TEST 1: Transformation Safety (EmailService)
    // Does it crash if optional data is totally missing?
    await runTest('Service: Handles Missing Optional Data', async () => {
        try {
            // Restore original to test the transformation logic, but mock the internal _send to avoid external call
            EmailService._send = async () => ({ success: true, messageId: 'mock-id' });

            const minimalPayload = { email: 'minimal@test.com', funnelSegment: 'Growth' }; // No quizData, no utm
            const result = await EmailService.processLeadCapture(minimalPayload);
            return result.success === true;
        } catch (e) {
            console.error(e);
            return false;
        }
    });

    // TEST 2: API Handler - Success Path
    await runTest('API: Returns 200 on Valid Input', async () => {
        EmailService.processLeadCapture = async () => ({
            success: true,
            details: { alert: { success: true }, user: { success: true } }
        });

        const req = createMockRequest({ email: 'valid@test.com' });
        const res = await POST({ request: req } as any);
        return res.status === 200;
    });

    // TEST 3: API Handler - Service Failure (Graceful degradation)
    await runTest('API: Returns 500 on Service Failure', async () => {
        // Simulate Service reporting failure (e.g. SMTP down)
        EmailService.processLeadCapture = async () => ({
            success: false,
            details: { alert: { success: false, error: 'SMTP Timeout' }, user: { success: false } }
        });

        const req = createMockRequest({ email: 'fail@test.com' });
        const res = await POST({ request: req } as any);

        // Should catch the failure and return 500, NOT crash
        const json = await res.json();
        return res.status === 500 && json.success === false && json.error.includes('Failed');
    });

    // TEST 4: API Handler - Malformed Input (Safety)
    await runTest('API: Handles Malformed JSON Gracefully', async () => {
        // Mock request that throws on json() parsing (simulating bad body)
        const crashReq = {
            json: async () => { throw new Error('Invalid JSON'); }
        } as unknown as Request;

        const res = await POST({ request: crashReq } as any);
        const json = await res.json();
        return res.status === 500 && json.error.includes('Internal Server Error');
    });

    console.log(`\n----------------------------------------`);
    console.log(`Summary: ${passed} Passed, ${failed} Failed`);

    // Cleanup mocks
    EmailService.processLeadCapture = originalProcessLeadCapture;
}

verifyResilience();

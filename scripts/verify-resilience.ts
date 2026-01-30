
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
            EmailService._callFunction = async () => ({ success: true, messageId: 'mock-id' });

            const minimalPayload = { email: 'minimal@test.com', funnelSegment: 'Growth' }; // No quizData, no utm
            const result = await EmailService.processLeadCapture(minimalPayload);
            return result.success === true; // The service returns { success: true, ... } on success
        } catch (e) {
            console.error(e);
            return false;
        }
    });

    console.log(`\n----------------------------------------`);
    console.log(`Summary: ${passed} Passed, ${failed} Failed`);

    // Cleanup mocks
    EmailService.processLeadCapture = originalProcessLeadCapture;
}

verifyResilience();

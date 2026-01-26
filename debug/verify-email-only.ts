
import { EmailService } from '../src/lib/EmailService';

async function testEmail() {
    console.log('--- STARTING ISOLATED EMAIL TEST ---');
    console.log('Target: EmailService.sendLeadAlert');

    const payload = {
        email: 'visual.testing@example.com', // Distinct email to track in logs
        funnelSegment: 'Startup' as const,
        revenuePotential: 123456,
        state: 'TestState',
        utmSource: 'debug_script',
        quizData: { test: true }
    };

    try {
        console.log('Attempting to send email...');
        const result = await EmailService.sendLeadAlert(payload);
        console.log('Result:', result);

        if (result.success) {
            console.log('✅ SUCCESS: Email sent.');
        } else {
            console.log('❌ FAILURE: Service returned success=false');
            console.error('Error details:', result.error);
        }
    } catch (error) {
        console.log('❌ CRITICAL FAILURE: Exception thrown');
        console.error(error);
    }
    console.log('--- TEST COMPLETE ---');
}

testEmail();

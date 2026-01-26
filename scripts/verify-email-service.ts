
import { EmailService } from '../src/lib/EmailService';

// REPLICATING EXACT PRODUCTION DATA SHAPE FROM QuizFunnel.tsx
// This matches the data shown in the user's "Real Email" screenshot
const realWorldLeadData = {
    email: 'production-integration-test@test.com',
    funnelSegment: 'Startup' as const, // Explicit literal type
    quizData: {
        state: 'Florida', // Matches screenshot
        revenuePotential: 625000, // Matches screenshot
        payload: {
            // These map to the "Property / Value" table in the screenshot
            vision: 'Open a local center',          // Matches "Vision"
            situation: 'planning',                  // Internal key, rendered as "Planning to launch soon" usually, but raw key sent
            challenge: 'Zoning and permits',        // Matches "Challenge"
            timeline: 'Next 12 months',             // Matches "Timeline"
            businessType: 'center',                 // Matches "Business Type"
            centerCapacity: 50,                     // Matches "Center Capacity"

            // Additional fields likely present in a real submission
            successVision: 'financial',
            learningStyle: 'done-for-you',
            licenseType: 'N/A (Center)',
        }
    },
    utmSource: 'final-integration-check' // Matches screenshot
};

async function verify() {
    console.log('🚀 Starting HIGH-FIDELITY Verification: EmailService.processLeadCapture');
    console.log('📋 Payload:', JSON.stringify(realWorldLeadData, null, 2));

    try {
        const result = await EmailService.processLeadCapture(realWorldLeadData);

        if (result.success) {
            console.log('\n✅ SUCCESS: Emails Dispatched.');
            console.log('   - Admin Alert ID:', result.details.alert.messageId);
            console.log('   - User Confirm ID:', result.details.user.messageId);
            console.log('\n🔍 VALIDATION CHECKLIST:');
            console.log('   [ ] Check Admin Inbox: Does table contain "Zoning and permits"?');
            console.log('   [ ] Check Admin Inbox: Is Revenue $625,000?');
            console.log('   [ ] Check User Inbox: Is the template the "Results" version?');
        } else {
            console.error('❌ Verification FAILED: Service returned failure.');
            console.error(result);
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Verification CRASHED:', error);
        process.exit(1);
    }
}

verify();

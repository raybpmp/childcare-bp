
import { db } from '../src/lib/firebase-admin';

async function testFirestore() {
    console.log('--- STARTING ISOLATED FIRESTORE TEST ---');

    try {
        console.log('Attempting to write to leads collection...');
        const docRef = await db.collection('leads').add({
            source: 'debug_script',
            timestamp: new Date().toISOString(),
            test: true
        });
        console.log('✅ SUCCESS: Document written with ID:', docRef.id);
    } catch (error) {
        console.log('❌ CRITICAL FAILURE: Firestore Write Failed');
        console.error(error);
    }
    console.log('--- TEST COMPLETE ---');
}

testFirestore();

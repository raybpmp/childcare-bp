import nodemailer from 'nodemailer';

const POSTMARK_TOKEN = '57242712-82f9-4c43-b918-25287f04f82b';
const FROM_ADDRESS = 'hello@childcarebusinessplan.com';

const transporter = nodemailer.createTransport({
    host: 'smtp.postmarkapp.com',
    port: 587,
    secure: false,
    auth: {
        user: POSTMARK_TOKEN,
        pass: POSTMARK_TOKEN,
    },
});

async function test() {
    console.log('--- GATE 1: TRANSPORT VERIFICATION (ESM) ---');
    try {
        const info = await transporter.sendMail({
            from: '"Childcare Business Plan" <${FROM_ADDRESS}>',
            to: 'hello@childcarebusinessplan.com',
            subject: 'GATE 1: Transport Verification',
            text: 'Transport logic is functioning correctly.',
            html: '<b>Transport logic is functioning correctly.</b>'
        });
        
        console.log('✅ GATE 1 PASSED: MessageId:', info.messageId);
        process.exit(0);
    } catch (e) {
        console.error('❌ GATE 1 FAILED:', e.message);
        process.exit(1);
    }
}

test();

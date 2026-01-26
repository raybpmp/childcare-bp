import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import cors from "cors";
import { EmailService } from "./emailService";

admin.initializeApp();
const corsHandler = cors({ origin: true });

export const sendEmail = functions.https.onRequest(async (req: functions.https.Request, res: functions.Response) => {
    return corsHandler(req, res, async () => {
        try {
            if (req.method !== 'POST') {
                res.status(405).send('Method Not Allowed');
                return;
            }

            const { action, payload } = req.body;

            if (!action || !payload) {
                res.status(400).send('Missing action or payload');
                return;
            }

            console.log(`Received email request: ${action}`);

            let result;

            switch (action) {
                case 'leadCapture':
                    result = await EmailService.processLeadCapture(payload);
                    break;
                case 'contactSubmission':
                    result = await EmailService.processContactSubmission(payload);
                    break;
                case 'saleCapture':
                    result = await EmailService.processSaleCapture(payload);
                    break;
                case 'membershipWelcome':
                    if (!payload.email || !payload.name || !payload.plan) {
                        throw new Error('Missing required fields for membershipWelcome');
                    }
                    result = await EmailService.sendMembershipWelcome(
                        payload.email,
                        payload.name,
                        payload.plan
                    );
                    break;
                case 'systemAlert':
                    result = await EmailService.sendSystemAlert(payload);
                    break;
                default:
                    res.status(400).send(`Unknown action: ${action}`);
                    return;
            }

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(500).json(result);
            }
        } catch (error) {
            console.error('Error in sendEmail function:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Internal Server Error'
            });
        }
    });
});

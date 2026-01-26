"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const cors_1 = __importDefault(require("cors"));
const emailService_1 = require("./emailService");
admin.initializeApp();
const corsHandler = (0, cors_1.default)({ origin: true });
exports.sendEmail = functions.https.onRequest(async (req, res) => {
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
                    result = await emailService_1.EmailService.processLeadCapture(payload);
                    break;
                case 'contactSubmission':
                    result = await emailService_1.EmailService.processContactSubmission(payload);
                    break;
                case 'saleCapture':
                    result = await emailService_1.EmailService.processSaleCapture(payload);
                    break;
                case 'membershipWelcome':
                    if (!payload.email || !payload.name || !payload.plan) {
                        throw new Error('Missing required fields for membershipWelcome');
                    }
                    result = await emailService_1.EmailService.sendMembershipWelcome(payload.email, payload.name, payload.plan);
                    break;
                case 'systemAlert':
                    result = await emailService_1.EmailService.sendSystemAlert(payload);
                    break;
                default:
                    res.status(400).send(`Unknown action: ${action}`);
                    return;
            }
            if (result.success) {
                res.status(200).json(result);
            }
            else {
                res.status(500).json(result);
            }
        }
        catch (error) {
            console.error('Error in sendEmail function:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Internal Server Error'
            });
        }
    });
});
//# sourceMappingURL=index.js.map
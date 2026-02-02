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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer = __importStar(require("nodemailer"));
const firestore_1 = require("firebase-admin/firestore");
const config_1 = require("./config");
// Import templates - ensuring paths are correct relative to this file
const lead_1 = require("./templates/alerts/lead");
const results_1 = require("./templates/user/results");
const contact_1 = require("./templates/alerts/contact");
const sale_1 = require("./templates/alerts/sale");
const launchpad_1 = require("./templates/welcome/launchpad");
const director_1 = require("./templates/welcome/director");
const ceo_1 = require("./templates/welcome/ceo");
const transporter = nodemailer.createTransport({
    host: 'smtp.postmarkapp.com',
    port: 587,
    secure: false,
    auth: {
        user: config_1.CONFIG.postmarkToken,
        pass: config_1.CONFIG.postmarkToken,
    },
});
exports.EmailService = {
    async processLeadCapture(rawBody) {
        var _a, _b, _c;
        const payload = Object.assign(Object.assign({}, rawBody), { email: rawBody.email, funnelSegment: rawBody.funnelSegment || 'Startup', revenuePotential: rawBody.revenuePotential || ((_a = rawBody.quizData) === null || _a === void 0 ? void 0 : _a.revenuePotential), state: rawBody.state || ((_b = rawBody.quizData) === null || _b === void 0 ? void 0 : _b.state), utmSource: rawBody.utmSource, quizData: ((_c = rawBody.quizData) === null || _c === void 0 ? void 0 : _c.payload) || rawBody.quizData || {} });
        console.log('╔══ Lead Capture Started ══╗');
        console.log('║ Email:', payload.email);
        console.log('║ Funnel:', payload.funnelSegment);
        // STEP 1: Database First (The Database Pillar)
        let leadId;
        try {
            const leadDoc = await (0, firestore_1.getFirestore)().collection('leads').add({
                email: payload.email,
                funnelSegment: payload.funnelSegment,
                utmSource: payload.utmSource || 'direct',
                state: payload.state || null,
                revenuePotential: payload.revenuePotential || null,
                quizData: payload.quizData || {},
                createdAt: firestore_1.FieldValue.serverTimestamp(),
                emailStatus: 'pending'
            });
            leadId = leadDoc.id;
            console.log('✓ Step 1: Lead saved to Firestore -', leadId);
        }
        catch (dbError) {
            console.error('! CRITICAL: Firestore write failed:', dbError);
            return {
                success: false,
                error: 'Database write failed',
                step: 'database'
            };
        }
        // STEP 2: Send Emails (The Email Pillar - non-blocking for DB success)
        const [alertResult, userResult] = await Promise.all([
            this.sendLeadAlert(payload),
            this.sendUserConfirmation(payload)
        ]);
        // STEP 3: Update lead with email status
        try {
            await (0, firestore_1.getFirestore)().collection('leads').doc(leadId).update({
                emailStatus: alertResult.success && userResult.success ? 'sent' : 'partial',
                alertEmailId: alertResult.messageId || null,
                userEmailId: userResult.messageId || null,
                emailSentAt: firestore_1.FieldValue.serverTimestamp()
            });
            console.log('✓ Step 3: Email status updated');
        }
        catch (updateError) {
            console.error('! Email status update failed:', updateError);
            // We don't return failure here because the lead IS in the database
        }
        console.log('╚══ Lead Capture Complete ══╝');
        return {
            success: true,
            leadId,
            details: { alert: alertResult, user: userResult }
        };
    },
    async processContactSubmission(rawBody) {
        const payload = {
            name: rawBody.name,
            email: rawBody.email,
            subject: rawBody.subject,
            message: rawBody.message
        };
        console.log('Server EmailService: Processing Contact Submission from %s', payload.email);
        return this.sendContactForm(payload);
    },
    async processSaleCapture(data) {
        const template = (0, sale_1.saleAlertTemplate)(data);
        return this._send({
            to: config_1.CONFIG.internalRecipient,
            subject: template.subject,
            text: template.text,
            html: template.html
        });
    },
    async sendMembershipWelcome(email, name, plan) {
        let template;
        switch (plan) {
            case 'Launchpad':
                template = (0, launchpad_1.launchpadTemplate)(name);
                break;
            case 'Director':
                template = (0, director_1.directorTemplate)(name);
                break;
            case 'CEO':
                template = (0, ceo_1.ceoTemplate)(name);
                break;
            default: throw new Error(`Invalid plan for welcome email: ${plan}`);
        }
        console.log('Server EmailService: Sending %s Welcome to %s', plan, email);
        return this._send({
            to: email,
            subject: template.subject,
            text: template.text,
            html: template.html
        });
    },
    async sendSystemAlert({ subject, text, html }) {
        return this._send({
            to: config_1.CONFIG.internalRecipient,
            subject,
            text,
            html: html || text.replace(/\n/g, '<br>')
        });
    },
    // --- Private Helpers ---
    async sendLeadAlert(data) {
        const template = (0, lead_1.leadAlertTemplate)(data);
        return this._send({
            to: config_1.CONFIG.internalRecipient,
            subject: template.subject,
            text: template.text,
            html: template.html
        });
    },
    async sendUserConfirmation(data) {
        const template = (0, results_1.userResultsTemplate)(data);
        return this._send({
            to: data.email,
            subject: template.subject,
            text: template.text,
            html: template.html
        });
    },
    async sendContactForm(data) {
        const template = (0, contact_1.contactAlertTemplate)(data);
        return this._send({
            to: config_1.CONFIG.internalRecipient,
            subject: template.subject,
            text: template.text,
            html: template.html
        });
    },
    async _send({ to, subject, text, html }) {
        try {
            const info = await transporter.sendMail({
                from: `"Childcare Businessplan" <${config_1.CONFIG.fromAddress}>`,
                to,
                subject,
                text,
                html,
            });
            console.log('Server EmailService: Sent successfully - %s', info.messageId);
            return { success: true, messageId: info.messageId };
        }
        catch (error) {
            console.error('Server EmailService: Failed to send:', error);
            return { success: false, error: error instanceof Error ? error.message : String(error) };
        }
    }
};
//# sourceMappingURL=emailService.js.map
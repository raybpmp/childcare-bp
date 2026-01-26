"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.directorTemplate = void 0;
const layout_1 = require("../layout");
const directorTemplate = (name) => {
    const title = 'Director Status Pending';
    const content = `
        <h2 style="color: ${layout_1.COLORS.text}; font-size: 20px; margin-top: 0; margin-bottom: 20px; font-weight: 700;">Initiating Director Access</h2>
        
        <p style="color: ${layout_1.COLORS.textLight}; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            Dear ${name},
        </p>

        <p style="color: ${layout_1.COLORS.textLight}; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            We have received your enrollment for the <strong>Director Program</strong>. Thank you for choosing to elevate your business with us.
        </p>

        <p style="color: ${layout_1.COLORS.textLight}; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            Because the Director tier includes access to advanced resources and proprietary tools, <strong>we conduct a strict vetting process for all new members</strong> to maintain the quality and exclusivity of our cohort.
        </p>

        <div style="margin: 30px 0; padding: 25px; background-color: #fefce8; border: 1px solid #fef08a; border-radius: 12px;">
            <h3 style="margin-top: 0; color: #854d0e; font-size: 17px; font-weight: 700;">Your Status: <span style="text-transform: uppercase;">Pending Review</span></h3>
            <p style="margin-bottom: 0; color: #713f12; font-size: 15px; line-height: 1.6;">
                Our team will finalize your account setup and assign your onboarding manager. You will receive your official welcome packet and access credentials <strong>within the next 24 hours</strong>.
            </p>
        </div>

        <p style="color: ${layout_1.COLORS.textLight}; font-size: 16px; line-height: 1.6; margin-bottom: 0;">
            We look forward to confirming your placement.
        </p>
        
        <p style="color: ${layout_1.COLORS.textLight}; font-size: 16px; line-height: 1.6; margin-top: 30px;">
            Respectfully,<br>
            <strong>The Child Care Business Plan Team</strong>
        </p>
    `;
    return {
        subject: 'Director Status Pending: Your Application is Under Review',
        html: (0, layout_1.renderBaseLayout)(title, content),
        text: `Director Status Pending: Your Application is Under Review, ${name}. We conduct a strict vetting process. You will receive access credentials within the next 24 hours.`
    };
};
exports.directorTemplate = directorTemplate;
//# sourceMappingURL=director.js.map
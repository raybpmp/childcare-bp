"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactAlertTemplate = void 0;
const layout_1 = require("../layout");
const contactAlertTemplate = (data) => {
    const html = (0, layout_1.renderBaseLayout)('CONTACT SUBMISSION', `
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
                <td style="padding: 12px 15px; border-bottom: 1px solid #edf2f7; font-weight: 600; color: #4a5568;">Name</td>
                <td style="padding: 12px 15px; border-bottom: 1px solid #edf2f7; color: #2d3748;">${data.name}</td>
            </tr>
            <tr>
                <td style="padding: 12px 15px; border-bottom: 1px solid #edf2f7; font-weight: 600; color: #4a5568;">Email</td>
                <td style="padding: 12px 15px; border-bottom: 1px solid #edf2f7; color: #2d3748;">${data.email}</td>
            </tr>
            <tr>
                <td style="padding: 12px 15px; border-bottom: 1px solid #edf2f7; font-weight: 600; color: #4a5568;">Subject</td>
                <td style="padding: 12px 15px; border-bottom: 1px solid #edf2f7; color: #2d3748;">${data.subject}</td>
            </tr>
        </table>
        <div style="margin-top: 24px; padding: 20px; background-color: #f5f3ff; border-radius: 12px; border: 1px solid #ddd6fe;">
            <p style="margin-top: 0; font-weight: 600; color: #5b21b6;">Message:</p>
            <p style="margin-bottom: 0; white-space: pre-wrap; color: #4c1d95; line-height: 1.6;">${data.message}</p>
        </div>
    `);
    return {
        subject: `📧 [CONTACT] ${data.subject} from ${data.name}`,
        text: `Contact from ${data.name} (${data.email}): ${data.message}`,
        html
    };
};
exports.contactAlertTemplate = contactAlertTemplate;
//# sourceMappingURL=contact.js.map
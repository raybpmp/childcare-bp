"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leadAlertTemplate = void 0;
const layout_1 = require("../layout");
// Re-export type if needed or import directly. 
// Ideally types should be in src/lib/email/types.ts content but relying on EmailService one for now to avoid circular deps if types move?
// Actually, let's duplicate the local helper needs or import types.
const formatLabel = (key) => key.replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
const formatValue = (value) => {
    if (value === null || value === undefined)
        return '<span style="color: #ccc;">N/A</span>';
    if (typeof value === 'number')
        return value.toLocaleString();
    if (Array.isArray(value))
        return value.join(', ');
    if (typeof value === 'object')
        return `<pre style="margin:0; font-family: monospace; font-size: 12px; white-space: pre-wrap;">${JSON.stringify(value, null, 2)}</pre>`;
    return String(value);
};
const leadAlertTemplate = (data) => {
    // Collect ALL data into a single flat list for the table
    const allData = Object.assign(Object.assign({}, data.quizData), data // <--- Catch-all
    );
    // Remove keys that are too large or redundant to show in a simple table
    delete allData['quizData'];
    delete allData['onboarding']; // If present
    delete allData['email']; // Already shown
    delete allData['funnelSegment']; // Already shown
    delete allData['action']; // Internal
    // Explicitly add back the ones we want at the top
    const orderedData = Object.assign({ 'Email Address': data.email, 'Active Segment': data.funnelSegment, 'State / Location': data.state, 'Annual Revenue Potential': data.revenuePotential ? `$${data.revenuePotential.toLocaleString()}` : undefined, 'UTM Source': data.utmSource }, allData // Everything else
    );
    const tableRows = Object.entries(orderedData)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value], index) => `
            <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f9fafb'};">
                <td style="padding: 12px 15px; border: 1px solid #edf2f7; font-weight: 600; color: #4a5568; width: 40%;">${formatLabel(key)}</td>
                <td style="padding: 12px 15px; border: 1px solid #edf2f7; color: #2d3748;">${formatValue(value)}</td>
            </tr>
        `).join('');
    const html = (0, layout_1.renderBaseLayout)('NEW LEAD CAPTURED', `
        <p style="color: #4a5568; font-size: 16px; margin-bottom: 24px;">A new user has completed a lead capture event. Here are the <strong>unfiltered results</strong> from the submission:</p>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; border-radius: 8px; overflow: hidden; border: 1px solid #edf2f7;">
            <thead>
                <tr style="background-color: #edf2f7;">
                    <th style="padding: 12px 15px; border: 1px solid #edf2f7; text-align: left; color: #2d3748;">Property</th>
                    <th style="padding: 12px 15px; border: 1px solid #edf2f7; text-align: left; color: #2d3748;">Value</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>

        <div style="margin-top: 30px; padding: 20px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px;">
            <h3 style="margin-top: 0; color: #166534; font-size: 16px;">Next Steps</h3>
            <p style="margin-bottom: 0; color: #15803d; font-size: 14px;">This lead represents verified intent. Use the contact information above to follow up within 24 hours for maximum conversion.</p>
        </div>
    `);
    const revenueText = data.revenuePotential ? ` - $${data.revenuePotential.toLocaleString()}` : '';
    return {
        subject: `🚀 [NEW LEAD] ${data.email}${revenueText}`,
        text: `New Lead: ${data.email} | Segment: ${data.funnelSegment} | Full data included in HTML view.`,
        html
    };
};
exports.leadAlertTemplate = leadAlertTemplate;
//# sourceMappingURL=lead.js.map
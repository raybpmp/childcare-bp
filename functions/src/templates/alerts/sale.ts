import { renderBaseLayout } from '../layout';

import type { SaleAlertData } from '../../types';

const formatLabel = (key: string) =>
    key.replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();

const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '<span style="color: #ccc;">N/A</span>';
    if (typeof value === 'number') return value.toLocaleString();
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return `<pre style="margin:0; font-family: monospace; font-size: 12px; white-space: pre-wrap;">${JSON.stringify(value, null, 2)}</pre>`;
    return String(value);
};

export const saleAlertTemplate = (data: SaleAlertData) => {
    // 1. Extract known High-Level fields for the subject/header
    const { email, program, amount, ...rest } = data;

    const formattedAmount = `$${(amount / 100).toFixed(2)}`;

    // 2. Combine EVERYTHING into one flatten list for the table
    // We explicitly put the most critical info at the top, but include EVERYTHING else below
    const allRowsMap: Record<string, any> = {
        'Customer Email': email,
        'Program Purchased': program,
        'Amount Paid': formattedAmount,
        ...rest
    };

    const tableRows = Object.entries(allRowsMap)
        .map(([key, value], index) => `
            <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f9fafb'};">
                <td style="padding: 12px 15px; border: 1px solid #edf2f7; font-weight: 600; color: #4a5568; width: 40%;">${formatLabel(key)}</td>
                <td style="padding: 12px 15px; border: 1px solid #edf2f7; color: #2d3748;">${formatValue(value)}</td>
            </tr>
        `).join('');

    const html = renderBaseLayout('New Sale Completed', `
        <p style="color: #4a5568; font-size: 16px; margin-bottom: 24px;">A new sale has been completed! Here is the complete data payload from the event:</p>
        
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

        <div style="margin-top: 30px; padding: 20px; background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px;">
            <h3 style="margin-top: 0; color: #1e40af; font-size: 16px;">Success Details</h3>
            <p style="margin-bottom: 0; color: #1e3a8a; font-size: 14px;">The customer has been processed into Frappe ERPNext, LMS, and Project Management.</p>
        </div>
    `);

    return {
        subject: `💰 [SALE] ${email} purchased ${program}`,
        text: `Sale Alert: ${email} purchased ${program} for ${formattedAmount}\n\n${JSON.stringify(allRowsMap, null, 2)}`,
        html
    };
};

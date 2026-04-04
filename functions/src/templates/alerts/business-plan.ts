import { renderBaseLayout } from '../layout';

interface BusinessPlanAlertData {
    email: string;
    companyName: string;
    ownerName: string;
    address?: string;
    cityStateZip?: string;
    website?: string;
    title?: string;
    phone?: string;
}

export const businessPlanAlertTemplate = (data: BusinessPlanAlertData) => {
    const fields = [
        { label: 'Email', value: data.email },
        { label: 'Company Name', value: data.companyName },
        { label: 'Owner Name', value: data.ownerName },
        { label: 'Phone', value: data.phone },
        { label: 'Address', value: data.address },
        { label: 'City, State, Zip', value: data.cityStateZip },
        { label: 'Title', value: data.title },
        { label: 'Website', value: data.website },
    ].filter(f => f.value);

    const tableRows = fields
        .map((f, i) => `
            <tr style="background-color: ${i % 2 === 0 ? '#ffffff' : '#f9fafb'};">
                <td style="padding: 12px 15px; border: 1px solid #edf2f7; font-weight: 600; color: #4a5568; width: 40%;">${f.label}</td>
                <td style="padding: 12px 15px; border: 1px solid #edf2f7; color: #2d3748;">${f.value}</td>
            </tr>
        `).join('');

    const html = renderBaseLayout('📋 NEW BUSINESS PLAN LEAD', `
        <p style="color: #4a5568; font-size: 16px; margin-bottom: 24px;">A new user has generated a custom Business Plan PDF. Their details and the PDF are attached below.</p>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; border-radius: 8px; overflow: hidden; border: 1px solid #edf2f7;">
            <thead>
                <tr style="background-color: #edf2f7;">
                    <th style="padding: 12px 15px; border: 1px solid #edf2f7; text-align: left; color: #2d3748;">Field</th>
                    <th style="padding: 12px 15px; border: 1px solid #edf2f7; text-align: left; color: #2d3748;">Value</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>

        <div style="margin-top: 30px; padding: 20px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px;">
            <h3 style="margin-top: 0; color: #166534; font-size: 16px;">📎 PDF Attached</h3>
            <p style="margin-bottom: 0; color: #15803d; font-size: 14px;">The customized 23-page business plan PDF is attached to this email. Follow up within 24 hours for maximum conversion.</p>
        </div>
    `);

    return {
        subject: `📋 [BUSINESS PLAN LEAD] ${data.companyName} — ${data.email}`,
        text: `New Business Plan Lead: ${data.companyName} by ${data.ownerName} (${data.email}). PDF attached.`,
        html,
    };
};

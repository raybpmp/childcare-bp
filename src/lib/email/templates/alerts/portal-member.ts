import { renderBaseLayout, COLORS } from '../layout';

export const portalMemberAlertTemplate = (email: string, name: string) => {
    const title = 'New Portal Member Alert';
    const content = `
        <h2 style="color: ${COLORS.text}; font-size: 20px; margin-top: 0; margin-bottom: 20px; font-weight: 700;">A New Member joined the Portal</h2>
        
        <p style="color: ${COLORS.textLight}; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            A new user has successfully synchronized their profile with the MariaDB database.
        </p>

        <div style="margin: 30px 0; padding: 25px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; border: 0;">
                <tr>
                    <td style="padding: 10px 0; font-weight: 600; color: #475569; width: 100px;">Name:</td>
                    <td style="padding: 10px 0; color: #1e293b;">${name}</td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; font-weight: 600; color: #475569;">Email:</td>
                    <td style="padding: 10px 0; color: #1e293b;">${email}</td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; font-weight: 600; color: #475569;">Timestamp:</td>
                    <td style="padding: 10px 0; color: #1e293b;">${new Date().toLocaleString()}</td>
                </tr>
            </table>
        </div>

        <div style="margin-top: 30px; padding: 20px; background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px;">
            <h3 style="margin-top: 0; color: #0369a1; font-size: 16px;">System Event</h3>
            <p style="margin-bottom: 0; color: #075985; font-size: 14px;">The user's record was successfully "upserted" via the interpretation layer. Their dashboard and CRM profile are now live.</p>
        </div>
    `;

    return {
        subject: `🚀 [NEW MEMBER] ${email}`,
        html: renderBaseLayout(title, content),
        text: `New Portal Member Alert: ${name} (${email}) has joined the portal.`
    };
};

import { renderBaseLayout, COLORS } from '../layout';

export const portalWelcomeTemplate = (name: string) => {
    const title = 'Welcome to the CCBP Portal';
    const content = `
        <h2 style="color: ${COLORS.text}; font-size: 20px; margin-top: 0; margin-bottom: 20px; font-weight: 700;">Welcome to your Portal Dashboard</h2>
        
        <p style="color: ${COLORS.textLight}; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            Dear ${name},
        </p>

        <p style="color: ${COLORS.textLight}; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            Congratulations on successfully logging in! The Child Care Business Plan Portal is now your private, centralized workspace for managing everything related to your childcare business.
        </p>

        <div style="margin: 30px 0; padding: 25px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px;">
            <h3 style="margin-top: 0; color: #166534; font-size: 17px; font-weight: 700;">What's Inside Your Portal:</h3>
            <ul style="margin-bottom: 0; color: #14532d; font-size: 15px; line-height: 1.8; padding-left: 20px;">
                <li><strong>Private Strategy Room</strong>: Access your core business data.</li>
                <li><strong>Live Market Analysis</strong>: Real-time insights for your area.</li>
                <li><strong>Business Plan Generator</strong>: Complete your 23-page plan in minutes.</li>
            </ul>
        </div>

        <p style="color: ${COLORS.textLight}; font-size: 16px; line-height: 1.6; margin-bottom: 0;">
            Next, visit the <strong>Settings</strong> page to complete your business profile. If you have any questions, just reply to this email.
        </p>
        
        <p style="color: ${COLORS.textLight}; font-size: 16px; line-height: 1.6; margin-top: 30px;">
            To your success,<br>
            <strong>The Child Care Business Plan Team</strong>
        </p>
    `;

    return {
        subject: 'Welcome to the Child Care Business Plan Portal!',
        html: renderBaseLayout(title, content),
        text: `Welcome to the CCBP Portal, ${name}. Your private strategy room is now ready.`
    };
};

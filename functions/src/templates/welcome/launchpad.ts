import { renderBaseLayout, COLORS } from '../layout';

export const launchpadTemplate = (name: string) => {
    const title = 'Application Received';
    const content = `
        <h2 style="color: ${COLORS.text}; font-size: 20px; margin-top: 0; margin-bottom: 20px; font-weight: 700;">Welcome to the Application Process</h2>
        
        <p style="color: ${COLORS.textLight}; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            Dear ${name},
        </p>

        <p style="color: ${COLORS.textLight}; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            Thank you for securing your spot in the <strong>Launchpad Program</strong>.
        </p>

        <p style="color: ${COLORS.textLight}; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            At Child Care Business Plan, we maintain an exclusive community of dedicated owners and directors. To ensure the integrity of our network, <strong>we manually vet every entrance into our membership tiers.</strong>
        </p>

        <div style="margin: 30px 0; padding: 25px; background-color: ${COLORS.successBg}; border: 1px solid #bbf7d0; border-radius: 12px;">
            <h3 style="margin-top: 0; color: ${COLORS.success}; font-size: 17px; font-weight: 700;">What happens next?</h3>
            <p style="margin-bottom: 0; color: #15803d; font-size: 15px; line-height: 1.6;">
                Our admissions team is currently reviewing your account. You can expect to receive your full access credentials and portal login instructions <strong>within the next 24 hours</strong>.
            </p>
        </div>

        <p style="color: ${COLORS.textLight}; font-size: 16px; line-height: 1.6; margin-bottom: 0;">
            We appreciate your patience as we prepare your personalized workspace.
        </p>
        
        <p style="color: ${COLORS.textLight}; font-size: 16px; line-height: 1.6; margin-top: 30px;">
            Sincerely,<br>
            <strong>The Child Care Business Plan Team</strong>
        </p>
    `;

    return {
        subject: 'Application Received: Child Care Business Plan - Launchpad Access',
        html: renderBaseLayout(title, content),
        text: `Welcome to the Application Process, ${name}. Thank you for securing your spot in the Launchpad Program. We manually vet every entrance. You can expect full access within 24 hours.`
    };
};

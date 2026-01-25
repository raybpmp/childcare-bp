import { renderBaseLayout, COLORS } from '../layout';

export const ceoTemplate = (name: string) => {
    const title = 'CEO Circle Entrance';
    const content = `
        <h2 style="color: ${COLORS.text}; font-size: 20px; margin-top: 0; margin-bottom: 20px; font-weight: 700;">Welcome to the CEO Circle</h2>
        
        <p style="color: ${COLORS.textLight}; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            Dear ${name},
        </p>

        <p style="color: ${COLORS.textLight}; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            Acknowledgement of your entrance into the <strong>CEO Program</strong>. This is our highest tier of service, reserved for visionary leaders committed to scaling their operations.
        </p>

        <p style="color: ${COLORS.textLight}; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            To ensure every member of the CEO Circle meets our community standards, <strong>we vet every entrance personally.</strong> Your application has been flagged for priority review by our senior admissions staff.
        </p>

        <div style="margin: 30px 0; padding: 25px; background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px;">
            <h3 style="margin-top: 0; color: #1e40af; font-size: 17px; font-weight: 700;">Your Next 24 Hours:</h3>
            <ol style="margin-bottom: 0; color: #1e3a8a; font-size: 15px; line-height: 1.8; padding-left: 20px;">
                <li>Our team will verify your business details.</li>
                <li>Your private strategic workspace will be provisioned.</li>
                <li>You will receive a personal introduction and full access credentials via email.</li>
            </ol>
        </div>

        <p style="color: ${COLORS.textLight}; font-size: 16px; line-height: 1.6; margin-bottom: 0;">
            No further action is required at this moment. Expect to hear from us shortly.
        </p>
        
        <p style="color: ${COLORS.textLight}; font-size: 16px; line-height: 1.6; margin-top: 30px;">
            Sincerely,<br>
            <strong>The Child Care Business Plan Team</strong>
        </p>
    `;

    return {
        subject: 'CEO Circle: Application Received & Vetting in Progress',
        html: renderBaseLayout(title, content),
        text: `Welcome to the CEO Circle, ${name}. Your priority review is in progress. Expect full access credentials within 24 hours.`
    };
};

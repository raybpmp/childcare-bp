import { renderBaseLayout, COLORS } from '../layout';

interface BusinessPlanUserData {
    email: string;
    companyName: string;
    ownerName: string;
}

export const businessPlanUserTemplate = (data: BusinessPlanUserData) => {
    const html = renderBaseLayout('Your Business Plan is Ready! 📋', `
        <div style="text-align: center; margin-bottom: 30px;">
            <p style="color: #4a5568; font-size: 16px;">Your custom 23-page daycare business plan has been generated.</p>
        </div>

        <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            Hi ${data.ownerName},
        </p>
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            Thank you for using the Business Plan Generator at <strong>ChildcareBusinessPlan.com</strong>. Your customized business plan for <strong>${data.companyName}</strong> is attached to this email as a PDF.
        </p>

        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px;">
            <p style="color: #166534; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 10px 0;">YOUR PLAN</p>
            <div style="font-size: 24px; font-weight: 800; color: #15803d; letter-spacing: -0.025em;">
                ${data.companyName}
            </div>
            <p style="color: #166534; font-size: 13px; margin: 10px 0 0 0;">23-Page Strategic Business Plan • PDF Attached</p>
        </div>

        <div style="border-top: 1px solid #e2e8f0; margin: 30px 0;"></div>

        <h3 style="color: #2d3748; font-size: 18px; font-weight: 700; margin-bottom: 15px;">What's Next?</h3>
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 12px;">
            Your plan includes fill-in-the-blank sections covering:
        </p>
        <ul style="color: #4a5568; font-size: 15px; line-height: 1.8; padding-left: 20px; margin-bottom: 24px;">
            <li>Executive Summary & Company Structure</li>
            <li>Products, Services & Educational Programs</li>
            <li>Financial Rates & Revenue Projections</li>
            <li>Marketing Strategy & SWOT Analysis</li>
            <li>Funding, Budget & Exit Strategy</li>
        </ul>
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            Print it out and complete each section at your own pace. Need help? We have resources and expert guidance ready for you.
        </p>
        
        <div style="text-align: center; margin-top: 35px;">
            <a href="https://childcarebusinessplan.com/tools" style="background-color: ${COLORS.primary}; color: ${COLORS.white}; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">Explore More Tools &rarr;</a>
        </div>
    `);

    return {
        subject: `📋 Your Business Plan for ${data.companyName} is Ready!`,
        text: `Hi ${data.ownerName}, your customized business plan for ${data.companyName} is attached to this email as a PDF. Print it out and complete each section at your own pace. Visit childcarebusinessplan.com/tools for more resources.`,
        html,
    };
};

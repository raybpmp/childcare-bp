import { renderBaseLayout } from '../layout';
import type { WelcomeEmailPayload } from '../../../EmailService';

export const userResultsTemplate = (data: WelcomeEmailPayload) => {
    const html = renderBaseLayout('Your Results Are In! 🎉', `
        <div style="text-align: center; margin-bottom: 30px;">
             <p style="color: #4a5568; font-size: 16px;">Here is the potential for your childcare business.</p>
        </div>

        <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            Hi there,
        </p>
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            Thank you for using our Business Plan Calculator. Based on your inputs for <strong>${data.state || 'your location'}</strong>, here is your estimated annual revenue potential:
        </p>

        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px;">
            <p style="color: #166534; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 10px 0;">Estimated Annual Revenue</p>
            <div style="font-size: 36px; font-weight: 800; color: #15803d; letter-spacing: -0.025em;">
                $${data.revenuePotential ? data.revenuePotential.toLocaleString() : '0'}
            </div>
            <p style="color: #166534; font-size: 12px; margin: 10px 0 0 0;">(Based on full capacity & current market rates)</p>
        </div>

        <div style="border-top: 1px solid #e2e8f0; margin: 30px 0;"></div>

        <h3 style="color: #2d3748; font-size: 18px; font-weight: 700; margin-bottom: 15px;">What's Next?</h3>
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            Building a profitable childcare business is a journey, but you don't have to do it alone. We have a community and a library of resources ready to help you take the next step today.
        </p>
        
        <div style="text-align: center; margin-top: 35px;">
            <a href="https://childcarebusinessplan.com/childcarebusinessplans" style="background-color: #0d9488; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">Get Resources & Plans &rarr;</a>
        </div>
    `);

    return {
        subject: `Your Childcare Business Results 🚀`,
        text: `Hi! Your estimated revenue potential is $${data.revenuePotential?.toLocaleString()}. View the full email for details.`,
        html
    };
};

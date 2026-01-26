/**
 * Shared styles and layout for premium emails.
 * Follows the "Google Antigravity Premium" style: Glassmorphism, clean typography, and professional branding.
 */

export const COLORS = {
    primary: '#0d9488', // Teal 600
    primaryDark: '#064e3b', // Teal 900
    secondary: '#7c3aed', // Violet 600
    text: '#2d3748', // Gray 800
    textLight: '#4a5568', // Gray 600
    background: '#f7fafc', // Gray 50
    white: '#ffffff',
    border: '#e2e8f0', // Gray 200
    success: '#166534', // Green 800
    successBg: '#f0fdf4'
};

export const renderBaseLayout = (title: string, content: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.background}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <div style="background-color: ${COLORS.background}; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: ${COLORS.white}; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid ${COLORS.border};">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%); padding: 30px; text-align: center;">
                <h1 style="color: ${COLORS.white}; margin: 0; font-size: 24px; letter-spacing: -0.025em; font-weight: 800; text-transform: uppercase;">${title}</h1>
            </div>

            <!-- Content Area -->
            <div style="padding: 40px 30px;">
                ${content}
            </div>

            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid ${COLORS.border};">
                <p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
                    &copy; ${new Date().getFullYear()} Childcare Businessplan. All rights reserved.<br>
                    Excellence in Childcare Management & Strategy.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
`;

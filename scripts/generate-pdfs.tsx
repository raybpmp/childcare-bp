import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { guides } from '../src/data/pdf-content';

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'resources');

const getHtmlTemplate = (guide: any) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #111827;
            --secondary: #4B5563;
            --accent: #2563EB;
            --border: #E5E7EB;
        }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: var(--primary);
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: white;
        }
        .page {
            padding: 2cm;
            position: relative;
            min-height: 25.7cm; /* A4 height approx minus padding */
        }
        .header {
            border-bottom: 2px solid var(--border);
            padding-bottom: 0.5rem;
            margin-bottom: 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .brand {
            font-size: 0.75rem;
            font-weight: 700;
            color: var(--secondary);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .title-section {
            margin-bottom: 3rem;
        }
        h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            color: var(--primary);
        }
        .subtitle {
            font-size: 1.25rem;
            color: var(--secondary);
            font-weight: 400;
        }
        .section {
            margin-bottom: 2.5rem;
            page-break-inside: avoid;
        }
        h2 {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--accent);
            border-left: 4px solid var(--accent);
            padding-left: 1rem;
        }
        p {
            margin-bottom: 1rem;
            font-size: 1rem;
        }
        .footer {
            position: absolute;
            bottom: 1rem;
            left: 2cm;
            right: 2cm;
            border-top: 1px solid var(--border);
            padding-top: 0.5rem;
            display: flex;
            justify-content: space-between;
            font-size: 0.75rem;
            color: var(--secondary);
        }
        @media print {
            .page {
                page-break-after: always;
            }
            .page:last-child {
                page-break-after: auto;
            }
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="header">
            <div class="brand">New Day Partners, Inc.</div>
            <div class="brand">Guide Series</div>
        </div>
        
        <div class="title-section">
            <h1>${guide.title}</h1>
            <div class="subtitle">${guide.subtitle}</div>
        </div>

        ${guide.sections.map((section: any) => `
            <div class="section">
                <h2>${section.title}</h2>
                <div class="content">${section.content.split('\n').map((p: string) => `<p>${p}</p>`).join('')}</div>
            </div>
        `).join('')}

        <div class="footer">
            <div>© 2026 New Day Partners, Inc.</div>
            <div>Programmatic Series: ${guide.slug}</div>
        </div>
    </div>
</body>
</html>
`;

async function generatePdfs() {
    console.log('🚀 Starting Puppeteer PDF generation...');

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const browser = await puppeteer.launch({
        headless: true,
    });

    try {
        const page = await browser.newPage();

        for (const guide of guides) {
            const outputPath = path.join(OUTPUT_DIR, `${guide.slug}.pdf`);
            console.log(`⏳ Generating: ${guide.slug}.pdf...`);

            const html = getHtmlTemplate(guide);
            await page.setContent(html, { waitUntil: 'load' });

            // Wait a tiny bit for any remaining layout/fonts if needed, but 'load' is usually enough
            await new Promise(r => setTimeout(r, 500));

            await page.pdf({
                path: outputPath,
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '0px',
                    right: '0px',
                    bottom: '0px',
                    left: '0px'
                }
            });

            console.log(`✅ ${guide.slug}.pdf Generated!`);
        }
    } catch (error) {
        console.error('❌ Generation Error:', error);
    } finally {
        await browser.close();
        console.log('🏁 Batch generation complete!');
    }
}

generatePdfs();

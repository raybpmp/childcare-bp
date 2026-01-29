
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { getBlogPost } from '../src/remotion/utils/get-blog-data';

const renderVideo = async (slug: string) => {
    console.log(`🎬 Starting render for: ${slug}`);

    // 1. Fetch Data
    const blogData = getBlogPost(slug);
    console.log(`📄 Found post: "${blogData.title}"`);

    // 2. Prepare Props
    const propsFile = path.join(process.cwd(), 'temp-props.json');
    fs.writeFileSync(propsFile, JSON.stringify(blogData, null, 2));

    // 3. Render using CLI
    // We point to src/remotion/index.ts
    const outputLocation = path.join(process.cwd(), 'out', `video-${slug}.mp4`);
    console.log(`Rendering to ${outputLocation}...`);

    try {
        // Run remotion render
        // npx remotion render <entry> <comp> <out> --props <file>
        execSync(`npx remotion render src/remotion/index.ts ShortsSummary "${outputLocation}" --props="${propsFile}" --gl=angle`, {
            stdio: 'inherit',
            env: { ...process.env }
        });
        console.log(`✅ Render done!`);
    } catch (e) {
        console.error('❌ Render failed');
        process.exit(1);
    } finally {
        // Cleanup
        if (fs.existsSync(propsFile)) {
            fs.unlinkSync(propsFile);
        }
    }
};

// Simple CLI arg parsing
const args = process.argv.slice(2);
const slug = args[0];

if (!slug) {
    console.error('Please provide a slug, e.g. "npx tsx scripts/render-video.ts childcare-management-software"');
    process.exit(1);
}

renderVideo(slug).catch(err => {
    console.error(err);
    process.exit(1);
});

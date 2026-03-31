# Blog Post Implementation Protocol

This document is the Source of Truth (SOT) for all blog post creation on this site—whether written manually, by an AI coding agent, or by the automated `daily-ai-blog` bot.

---

## Core Architecture
*   **Extension:** `.mdx` (MANDATORY).
    *   *Why:* The `[slug].astro` layout injects `GlassParagraph` via the `components={{ p: GlassParagraph }}` prop. This only works with the MDX renderer. `.md` files will render plain HTML paragraphs, breaking the site's design system.
*   **Directory:** `src/content/posts/`
*   **File Naming Convention:** `YYYY-MM-DD-slug-title.mdx` (MANDATORY for all new posts).
    *   *Why:* Prevents a flat, unmanageable directory as post count scales past 100+. All new posts use this format.
    *   *Legacy:* Older posts (before 2026-04-01) use the flat `slug.mdx` format. Do NOT rename them.
*   **Layout:** Do NOT import layouts or base components. The `[slug].astro` page wrapper handles `Layout.astro`, `Container`, `AuthorCard`, and `BlogCTA`.

---

## Frontmatter Standard
Must match `src/content/config.ts`:
```yaml
---
title: "Primary Keyword H1"
date: "YYYY-MM-DD"
excerpt: "140-160 char meta description."
author: "junya-herron" # ALWAYS junya-herron. The automated bot uses this too — author reflects the brand, not the tool.
category: "Category Name" # Must be one of the 6 Pillars
tags: ["keyword1", "keyword2"]
coverImage: "/images/blog/pillars/[pillar-slug].webp" # see Image Mapping below
featured: false
---
```

### Valid Category Pillars
The `category` field for all new posts must be one of:
- `Startup Guides`
- `Industry Trends`
- `Marketing`
- `Operations`
- `Business Strategy`
- `Regulatory & Compliance`

---

## Image Management

### Manual Posts
- **Location:** `public/images/blog/[post-slug]/` (nested folder per post).
- **Format:** `.jpg` or `.webp`. **Prohibited:** `.png` unless heavily optimized.
- **Critical:** Do not mask JPEGs as PNGs. Run `file` command to verify MIME types.

### Automated Bot Posts (Daily AI Blog)
- Automated posts do NOT generate unique images per post.
- They use pre-defined pillar default images located at `public/images/blog/pillars/`.
- **Pillar → Image Mapping:**
    - `Startup Guides` → `/images/blog/pillars/startup-guides.webp`
    - `Industry Trends` → `/images/blog/pillars/industry-trends.webp`
    - `Marketing` → `/images/blog/pillars/marketing.webp`
    - `Operations` → `/images/blog/pillars/operations.webp`
    - `Business Strategy` → `/images/blog/pillars/business-strategy.webp`
    - `Regulatory & Compliance` → `/images/blog/pillars/regulatory-compliance.webp`
- You can replace any of these pillar images manually at any time.

---

## Automated Blog Bot System
The site has an automated daily post system. See `scripts/auto_blog.py` for the full script.

- **Source:** Google News RSS via `feedparser`.
- **Model:** `google-genai` — `flash-lite-latest`.
- **Pipeline:** Two-pass generation. Pass 1 = Research & Write. Pass 2 = MDX Format Enforcement.
- **Trigger:** GitHub Actions `daily-ai-blog.yml`. Runs daily at 9 AM UTC.
- **Commit Bot:** `github-actions[bot]` commits directly to `main` to trigger auto-redeploy.
- **API Key:** `GM_API_KEY` stored in GitHub Repository Secrets.

---

## Content Rules
1.  **No Manual CTAs:** The `BlogCTA` component is automatically appended by the layout. Do not add `<div class="cta-box">` or manual buttons.
2.  **MDX Syntax:**
    *   Escape all `<` characters as `&lt;` or use text equivalents ("less than").
    *   Escape `{` and `}` if not being used for variables/expressions.
3.  **Typography:**
    *   Use standard Markdown (`#`, `##`, `*`).
    *   Do not use raw HTML like `<p class="...">`. The `GlassParagraph` wrapper handles styling automatically.

---

## Research Phase (MANDATORY for manual and bot posts)
**Before generating any text, you must:**
1.  **Live Search:** Run `search_web` for specific, year-relevant data (e.g., "home daycare startup costs 2026").
2.  **Fact Grounding:** Never output generic "it varies." Find specific ranges or examples.
3.  **Income Validation:** If citing revenue, finding realistic "Low/Avg/High" tiers is required.
4.  **Proof Density:** Aim for 4-6 distinct, cited data points per post.

---

## Audit Checklist (Per File)
1.  [ ] Is extension `.mdx`?
2.  [ ] Does filename follow `YYYY-MM-DD-slug.mdx` format (for new posts)?
3.  [ ] Does `coverImage` frontmatter path match actual file location?
4.  [ ] Is the image file actually a JPG/WEBP (not a masked PNG)?
5.  [ ] Are there any unescaped `<` characters? (Grep check).
6.  [ ] Are there any redundant HTML CTAs?
7.  [ ] Does post have at least 4 grounded data points?

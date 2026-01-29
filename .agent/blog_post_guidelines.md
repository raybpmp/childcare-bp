# Blog Post Implementation Protocol

## Core Architecture
*   **Extension:** `.mdx` (MANDATORY). 
    *   *Why:* The `[slug].astro` layout injects `GlassParagraph` via the `components={{ p: GlassParagraph }}` prop. This only works with the MDX renderer. `.md` files will render plain HTML paragraphs, breaking the site's design system.
*   **Directory:** `src/content/posts/`
*   **Layout:** Do NOT import layouts or base components. The `[slug].astro` page wrapper handles `Layout.astro`, `Container`, `AuthorCard`, and `BlogCTA`.

## Frontmatter Standard
Must match `src/content/config.ts`:
```yaml
---
title: "Primary Keyword H1"
date: "YYYY-MM-DD"
excerpt: "140-160 char meta description."
author: "junya-herron" (default)
category: "Category Name" (Must exist in config if strict)
tags: ["keyword1", "keyword2"]
coverImage: "/images/blog/[slug]/filename.jpg"
featured: false
---
```

## Content Rules
1.  **No Manual CTAs:** The `BlogCTA` component is automatically appended by the layout. Do not add `<div class="cta-box">` or manual buttons.
2.  **MDX Syntax:** 
    *   Escape all `<` characters as `&lt;` or use text equivalents ("less than").
    *   Escape `{` and `}` if not being used for variables/expressions.
3.  **Typography:** 
    *   Use standard Markdown (`#`, `##`, `*`). 
    *   Do not use raw HTML like `<p class="...">`. The `GlassParagraph` wrapper handles styling automatically.

## Asset Management
*   **Location:** `public/images/blog/[slug]/`
    *   *Note:* Legacy posts may use flat `public/images/blog/`, but new posts must use the nested folder structure for organization.
*   **Format:** `.jpg` or `.webp`.
    *   **Prohibited:** `.png` (unless heavily optimized and verified).
    *   **Critical:** Do not mask JPEGs as PNGs. Run `file` command to verify MIME types.

## Research Phase (MANDATORY)
**Before generating any text, you must:**
1.  **Live Search:** Run `search_web` for specific, year-relevant data (e.g., "home daycare startup costs 2026", "state licensing ratios 2025").
2.  **Fact Grounding:** Never output generic "it varies." Find specific ranges or examples.
3.  **Income Validation:** If citing revenue, finding realistic "Low/Avg/High" tiers is required.


## Audit Checklist (Per File)
1.  [ ] Is extension `.mdx`?
2.  [ ] Does `coverImage` frontmatter path match actual file location?
3.  [ ] Is the image file actually a JPG/WEBP (not a masked PNG)?
4.  [ ] Are there any unescaped `<` characters? (Grep check).
5.  [ ] Are there any redundant HTML CTAs?

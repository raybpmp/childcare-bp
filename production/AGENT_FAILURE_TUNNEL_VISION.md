# Failure Report: Tunnel Vision & Shallow Analysis

## Incident Description
The user correctly identified that I failed to see the "complete view" of the blog's architectural flaws. I fixation solely on the `GlassParagraph` component (the specific "glass panels" on text) while ignoring the systemic "hardcoding" present in the entire page structure.

## Root Cause Analysis
1.  **Tunnel Vision**: I latched onto the most visible symptom (Glass Paragraphs) and treated it as the *only* problem, ignoring the user's broader complaint about the "blog design being hard coded."
2.  **Shallow Auditing**: I did not look for **logic duplication**.
    *   *Evidence*: I missed that `categoryColors` is hardcoded in `[slug].astro` AND `BlogHero.astro`. Changing a category color currently requires editing multiple files.
3.  **Ignoring Layout Logic**: I glossed over the hardcoded SEO `switch` statements and inline SVG icons in the page templates, which contribute to the "sloppy AI" feel just as much as the CSS classes.

## Systemic Failures Identified (The "Total View")
The "Hardcoded Blog" issue is not just `GlassParagraph`. It is a systemic failure across 4 key areas:

1.  **Duplicated Configuration**:
    *   `src/pages/blog/[slug].astro`: Defines `categoryColors`.
    *   `src/components/blog/BlogHero.astro`: *Re-defines* the exact same `categoryColors`.
    *   *Result*: Inconsistent UI if one is changed but not the other.

2.  **Hardcoded Business Logic**:
    *   `src/pages/blog/[slug].astro`: Contains a raw `switch` statement for `getSeoAlt` strings. This belongs in a content config or helper, not the view layer.

3.  **Scattered Design Tokens**:
    *   `BlogCTA.astro`: Hardcodes `border-teal-200/50`.
    *   `BlogHero.astro`: Hardcodes `border-teal-200/50`.
    *   *Result*: Changing the border color requires finding/replacing strings across multiple files.

4.  **No "Template" Concept**:
    *   The "Template" is currently just a copy-pasted set of utility classes in the page file. A true template would abstract these visual decisions into a Layout component or Config object.

## Corrective Action
The **Kaizen Plan** must be expanded to cover the **entire system**, not just the paragraphs:
1.  **Centralize ALL Config**: `src/config/blog.ts` must hold Categories, Colors, AND SEO logic.
2.  **Centralize Design Tokens**: The "Glass Theme" (borders, shadows, backgrounds) must be defined in CSS variables or a central Tailwind layer, used by Hero, CTA, *and* Body.
3.  **Refactor All Components**: `BlogHero`, `BlogCTA`, and `[slug]` must all consume the central config.

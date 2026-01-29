# Blog Implementation Plan (SEO Baseline)

## 1. Technical Workflow
(Unchanged: Astro `src/content/config.ts` schema)

## 2. Image Generation Strategy (SEO + Proof Density)
Images must map to the `seo-guide.md` **Data Signal**.

### Prompt Formula:
*"A professional, flat-design data visualization showing [SEO DATA SIGNAL]. Clean white background, corporate palette (Teal, Blue), high resolution. Chart style: [Bar/Pie/Infographic]. No text."*

### Image Plan per Post:
1.  **Cost:** Pie Chart (Expense Breakdown) -> Matches "Research Intent".
2.  **Steps:** Road Map Infographic (1-10) -> Matches "Process Intent".
3.  **Plan:** Document Stack Visualization -> Matches "Transactional Intent".
4.  **Preschool:** Venn Diagram (Preschool vs Daycare) -> Matches "Comparison Intent".
5.  **Benefits:** Bar Chart (Retention Impact) -> Matches "Commercial Intent".
6.  **Software:** Feature Grid Matrix -> Matches "Utility Intent".
7.  **Marketing:** Funnel Graphic (Waitlist Growth) -> Matches "Action/Result".
8.  **Ideas:** Icon Set (Community Tactics) -> Matches "Strategy Intent".
9.  **Teachers:** Salary Map (by State) -> Matches "Operational Resource".
10. **Home:** Bar Chart (Net Income) -> Matches "Niche Transactional".

## 3. The "Free vs Paid" Content Gate
*   [ ] Does the post use the **Exact Keyword** in H1? (SEO Baseline)
*   [ ] Does the subtitle address the **Entrepreneur Persona**? (Expansion)
*   [ ] Does the content **STOP** before giving away the "Done-For-You" plan? (Value Ladder)

## 4. Execution Steps
1.  **Generate:** Use LLM with `seo-guide.md` (for keywords) + `proof-density` (for data).
2.  **Assets:** Create images in `public/images/blog/[slug]/`.
3.  **Author:** `junya-herron`.

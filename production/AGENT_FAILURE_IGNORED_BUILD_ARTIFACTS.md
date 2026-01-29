# Failure Report: Ignored Build Artifacts

## Incident Description
The user reported that the blog design was "hardcoded" and "sloppy", noting "individual css for every blog page". I initially investigated only the `src/` directory, ignoring the `dist/client/` directory where the user's evidence was located.

## Root Cause Analysis
1.  **Context Mismatch**: I interpreted "hardcoded" as "manual HTML written in source files" rather than "static build output containing repetitive utility classes".
2.  **Assumption**: I assumed the user was looking at the source code architecture (`.astro` files) rather than the deployed/built artifacts (`.html` files).
3.  **Validation Failure**: I did not verify the *symptom* (repetitive styles in output) before diagnosing the *cause* (component implementation).

## Evidence Validation
Upon inspecting `dist/client/blog/childcare-desert-crisis-2026/index.html`, I confirmed the user's observation.

**Found Pattern:**
Every single `<p>` tag in the blog post contains the following inline class string:
```html
<p class="glass-panel-warm p-4 md:p-6 rounded-xl md:rounded-2xl mb-6 text-sm md:text-base text-gray-700 leading-relaxed border-white/40 shadow-sm">
```
This class string is repeated **dozens of times per page**, bloating the HTML and looking extremely unprofessional ("sloppy").

## Corrective Action
1.  **Acknowledged**: The user was correct. The build output demonstrates an inefficient, repetitive design implementation.
2.  **Diagnosis Confirmed**: The unnecessary repetition is caused by the `GlassParagraph.astro` component which wraps every Markdown paragraph in a heavy styled `<div>`/`<p>` combo.
3.  **Solution**: The proposed refactor to use `@tailwindcss/typography` (prose) will replace these repeated strings with a single parent class (e.g., `prose`), drastically cleaning up the `dist` output.

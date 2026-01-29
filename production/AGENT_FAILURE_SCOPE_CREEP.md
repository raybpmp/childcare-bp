# Failure Report: Scope Creep & Design Violation

## Incident Description
The user rejected my "Kaizen Refactor Plan" because it proposed **changing the design** (removing the Glass Panel style) instead of **fixing the implementation** (preserving the design but removing the hardcoded repetition).

## Root Cause Analysis
1.  **Misinterpretation of "Hardcoded"**: I interpreted "hardcoded design" as "bad design choice" (the glass panels themselves) rather than "inefficient implementation" (repetitive inline classes in the build output).
2.  **Scope Creep**: Instead of optimizing the *existing* design to be a proper template, I decided the design was "bad" and tried to replace it with a standard one. This violates the "Refactor" definition, which is "changing structure without changing behavior/appearance".
3.  **Failure to Respect Constraints**: The user asked to "stop the thing from being repeated", not "stop the thing from looking like glass".

## Corrective Action
1.  **Strict Scope Adherence**: The visual output must remain *pixel-perfect* identical to the current site.
2.  **Correct Technical Solution**:
    *   **Do Not**: Remove `GlassParagraph`.
    *   **Do**: Refactor `GlassParagraph` to use a single semantic CSS class (e.g., `.blog-paragraph`) defined in global CSS.
    *   **Result**: The build output will show `<p class="blog-paragraph">` instead of `<p class="glass-panel-warm p-4 ...">`, solving the "bloat" and "hardcoded" complaint while keeping the design 100% intact.

# Codebase Audit Report

## 1. Executive Summary
The codebase is a modern Astro application utilizing React for interactivity, TailwindCSS (v4) for styling, and Nanostores for state management. It integrates with Firebase (Auth/Firestore/Functions) and Stripe. While the technological foundation is solid, the project shows signs of rapid development, leading to code duplication, monolithic components (specifically `index.astro`), and inconsistent configuration patterns. This audit highlights these areas and provides actionable steps for refactoring.

## 2. Project Structure & Configuration
**Status**: ⚠️ **Needs Improvement**

### Findings
- **File Naming Inconsistency**: `src/components/ui` contains files in kebab-case/camelCase (e.g., `button.tsx`) while exporting PascalCase components (`Button`). Other components in `src/components` use PascalCase (e.g., `MobileNav.tsx`).
- **Missing Tooling**: `package.json` lacks scripts for linting (`eslint`, `prettier`) and testing.
- **Cluttered Directories**: `src/components/` root is cluttered.

### Recommendations
- **Rename UI Components**: Standardize file names in `src/components/ui` to PascalCase (e.g., `Button.tsx`) to match the component name.
- **Add Linting/Testing**: Install and configure ESLint and Prettier. Add a basic test runner (e.g., Vitest).

## 3. Component Architecture
**Status**: ⚠️ **Needs Improvement**

### Findings
- **Monolithic Pages**: `src/pages/index.astro` is over 500 lines long and contains multiple distinct sections (Hero, Quiz Funnel, SEO Content, Social Proof) embedded directly in the markup. This hinders readability and maintainability.
- **Duplicated UI Logic**:
    - **Header**: `GlassHeader.astro` exists but is not used in `Layout.astro`, which implements its own header markup.
    - **Cards**: "Testimonial" and "Step" cards in `index.astro` are copy-pasted HTML blocks instead of reusable components.
- **Hardcoded Navigation**: Navigation links are hardcoded in both `Layout.astro` (desktop) and `MobileNav.tsx` (mobile), creating a maintenance risk if links change.

### Recommendations
- **Decompose `index.astro`**: Extract sections into dedicated Astro components:
    - `src/components/home/Hero.astro`
    - `src/components/home/Features.astro`
    - `src/components/home/Testimonials.astro`
- **Componentize UI Patterns**: Create `<TestimonialCard />` and `<StepCard />` components.
- **Centralize Navigation**: Create `src/config/site.ts` to export navigation links and import them in `Layout.astro` and `MobileNav.tsx`.

## 4. Data Flow & Logic
**Status**: ⚠️ **Needs Improvement**

### Findings
- **Configuration Hardcoding**:
    - `src/pages/api/create-checkout.ts` contains hardcoded Stripe Price IDs.
    - `src/lib/EmailService.ts` contains a hardcoded Production URL for Cloud Functions.
- **Environment Variable Inconsistency**: The codebase mixes `process.env` (Node style) and `import.meta.env` (Astro/Vite style).
    - `firebase-admin.ts` and `create-checkout.ts` use `process.env`.
    - `stripe.ts` uses `import.meta.env`.
- **Logic Duplication**: `src/lib/firebase-admin.ts` contains duplicated initialization logic.
- **Good Practices**: `EmailService.ts` correctly delegates email sending to a Cloud Function, keeping the Astro app lighter.

### Recommendations
- **Externalize Configuration**: Move Stripe Price IDs and API URLs to environment variables or a configuration file.
- **Standardize Env Vars**: Use `import.meta.env` exclusively for Astro, using `PUBLIC_` prefix only when necessary for client-side access.
- **Fix Firebase Init**: Refactor `firebase-admin.ts` to remove duplicated code.

## 5. Styling & Design System
**Status**: ⚠️ **Needs Improvement**

### Findings
- **CSS Duplication**: The `.glass-panel` class is defined in `src/styles/global.css` AND redundantly in a `<style>` block in `src/pages/index.astro`.
- **Color System Ambiguity**: Colors are defined in two places in `global.css`: as Hex values in the `@theme` block and as `oklch` values in `:root`. This creates confusion about the source of truth.
- **Tailwind Version**: The project successfully uses Tailwind v4.

### Recommendations
- **Remove Redundant Styles**: Delete the `<style>` block in `index.astro` and rely on `global.css` classes.
- **Unify Color System**: Consolidate colors. Prefer defining them in the Tailwind `@theme` configuration or strictly using CSS variables mapped to Tailwind.

## 6. Action Plan
1.  **Cleanup**: Remove unused components (`GlassHeader.astro` if Layout is not updated to use it) or refactor Layout to use it.
2.  **Refactor**: Extract components from `index.astro`.
3.  **Config**: Create `src/config/` for constants (Nav, Pricing).
4.  **Fix**: Update `firebase-admin.ts` and standarize Env Var usage.
5.  **Style**: Remove duplicate CSS in `index.astro`.

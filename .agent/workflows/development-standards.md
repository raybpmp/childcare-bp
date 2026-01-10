---
description: Development standards and guidelines for the Childcare Business Plan website
---

# Childcare Business Plan - Development Standards

These are mandatory guidelines that ALL agents must follow when working on this project.

---

## 1. Component & Solution Selection Strategy

**Rule: Always default to well-known components and search for established solutions BEFORE writing custom code.**

### Process (in order)

1. **Check existing project components first**
   - Review `src/components/` for reusable components
   - Check `src/layouts/` for existing layout patterns
   - Look at similar pages in `src/pages/` for established patterns

2. **Use established libraries already in the project**
   - This project uses **Astro** with **React** components
   - Check `package.json` for available dependencies
   - Prefer using existing dependencies over adding new ones

3. **Search for well-known solutions**
   - Before writing complex logic, search for established patterns
   - Reference official documentation (Astro docs, React docs, Tailwind docs)
   - Look for battle-tested npm packages with high weekly downloads

4. **Custom code is the LAST resort**
   - Only write custom solutions when no suitable existing solution exists
   - Document WHY a custom solution was necessary
   - Ensure custom code follows project conventions

### Anti-Patterns to Avoid

- ❌ Writing custom form validation when a library exists
- ❌ Creating custom animation logic when Framer Motion is available
- ❌ Building custom UI components when shadcn/ui components exist
- ❌ "Vibe coding" without researching existing solutions first

---

## 2. Mobile-First Design (MANDATORY)

**Rule: All website additions MUST be designed mobile-first.**

> **REQUIRED READING:** Before writing ANY Tailwind classes, read [styling.md](./styling.md) for mandatory mobile-first rules.

### Implementation Requirements

1. **Start with mobile viewport**
   - Write base CSS/styles for mobile screens (< 640px) first
   - Add complexity for larger screens using `min-width` media queries
   - Default styles = mobile styles

2. **Breakpoint progression**

   ```css
   /* Mobile-first approach */
   .element {
     /* Base mobile styles */
     padding: 1rem;
     flex-direction: column;
   }

   @media (min-width: 640px) { /* sm */ }
   @media (min-width: 768px) { /* md */ }
   @media (min-width: 1024px) { /* lg */ }
   @media (min-width: 1280px) { /* xl */ }
   ```

3. **Tailwind CSS mobile-first classes**
   - Use unprefixed classes for mobile: `flex-col`
   - Use prefixed classes for larger screens: `md:flex-row`
   - Example: `class="flex-col md:flex-row lg:gap-8"`

4. **Touch-friendly interactions**
   - Minimum touch target: 44x44 pixels
   - Adequate spacing between interactive elements
   - Consider thumb reach zones for mobile navigation

5. **Performance on mobile**
   - Optimize images with responsive sizes
   - Lazy load below-the-fold content
   - Minimize JavaScript bundle size

### Verification Checklist

- [ ] Component renders correctly at 320px width
- [ ] Component renders correctly at 375px width (iPhone)
- [ ] Component scales appropriately to tablet (768px)
- [ ] Component scales appropriately to desktop (1024px+)
- [ ] Touch targets meet minimum size requirements
- [ ] No horizontal scrolling on mobile viewports

---

## 3. Pre-Implementation Checklist

Before making ANY changes, verify:

1. [ ] Have I checked for existing components that solve this problem?
2. [ ] Have I searched for well-known solutions/patterns?
3. [ ] Am I starting with mobile styles first?
4. [ ] Will this change work on all viewport sizes?
5. [ ] Am I following established project conventions?

---

## 4. Project-Specific Conventions

### File Structure

- Components: `src/components/`
- Layouts: `src/layouts/`
- Pages: `src/pages/`
- Content: `src/content/`
- Styles: `src/styles/` (if applicable)

### Styling

- Use Tailwind CSS utility classes
- Follow mobile-first breakpoint pattern
- Maintain consistency with existing component styles

### TypeScript

- All components should be properly typed
- Use interfaces for props definitions
- Export types when reusable

---

## Quick Reference

| Priority | Action |
|----------|--------|
| 1st | Check existing project components |
| 2nd | Check installed dependencies |
| 3rd | Search for established patterns/libraries |
| 4th | Write custom code (document reasoning) |

| Viewport | Tailwind Prefix | Width |
|----------|-----------------|-------|
| Mobile (base) | none | < 640px |
| Small | `sm:` | ≥ 640px |
| Medium | `md:` | ≥ 768px |
| Large | `lg:` | ≥ 1024px |
| Extra Large | `xl:` | ≥ 1280px |

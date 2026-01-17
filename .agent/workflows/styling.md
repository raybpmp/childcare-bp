# Tailwind Mobile-First Standard

## Rule 1: Base Classes = Mobile Layout

All base utility classes (e.g., `flex-col`, `text-sm`, `w-full`, `px-4`) must represent the MOBILE layout (375px width).

**Correct:**

```html
<div class="flex-col text-base px-4">  <!-- This IS the mobile layout -->
```

**Wrong:**

```html
<div class="flex-row text-xl px-8">  <!-- This is desktop-first -->
```

## Rule 2: Breakpoints = Desktop Enhancements Only

Only use breakpoints (`sm:`, `md:`, `lg:`, `xl:`) to introduce desktop enhancements.

**Correct:**

```html
<div class="text-base md:text-lg lg:text-xl">  <!-- Grows from mobile -->
<div class="flex-col md:flex-row">  <!-- Stacks on mobile, rows on desktop -->
<div class="px-4 md:px-6 lg:px-8">  <!-- More padding on larger screens -->
```

**Wrong:**

```html
<div class="text-xl md:text-lg">  <!-- Shrinking for mobile = WRONG -->
<div class="flex-row md:flex-col">  <!-- This is backwards -->
```

## Rule 3: No max-w Prefixes

Never use `max-w-` prefixes in responsive classes unless specifically requested by the user. Use the Container component for width constraints.

## Rule 4: Pre-Implementation Verification

Before implementing any UI code, verify that removing ALL breakpoint prefixes (`sm:`, `md:`, `lg:`, `xl:`) would result in a functional layout at 375px screen width.

**Test mentally:** If I delete every `md:` and `lg:` class, does this still work on mobile?

## Rule 5: Touch Targets

All interactive elements (buttons, links, clickable cards) must have a minimum touch target of 44px x 44px on mobile. Use `min-h-[44px]` and adequate padding.

## Rule 6: Font Sizes

- Mobile base: `text-base` (16px) or `text-lg` (18px) for body text
- Never use `text-xs` for body content
- Headings start at `text-2xl` or `text-3xl` on mobile, grow with `md:` and `lg:`

## Enforcement

When writing any Tailwind classes:

1. Write the mobile version first with no breakpoint prefixes
2. Add `md:` prefixes for tablet enhancements
3. Add `lg:` prefixes for desktop enhancements
4. Review: Would this work if I only had the base classes?

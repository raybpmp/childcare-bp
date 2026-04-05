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

## Rule 6: Ultra-High Density Typography

- **Density Base**: Use `text-xs` (12px) or `text-[11px]` for dashboard labels and meta-information.
- **Pro Labeling**: Use `text-[10px] font-black uppercase tracking-wider` for navigational elements and status indicators.
- **Micro-Meta**: Use `text-[9px] font-bold uppercase tracking-widest text-gray-400` for secondary metadata (e.g. timestamps).
- **Headings**: Use `.pro-heading-dense` (custom utility) or `text-sm/text-base font-black uppercase` for tool subheaders. Never allow a heading to exceed `text-xl` on mobile viewports.

## Rule 7: Glassmorphism (.pro-card)

All primary UI containers must use the glassmorphic card system:
- Use `.pro-card` for standard containers.
- Use `.glass-panel` or `.glass-panel-dark` for backdrop-blur effects.
- Ensure `border-white/20` and `backdrop-blur-xl` are consistent across the platform.

## Rule 8: Spacing Purge (No-Waste)

- **Global Padding**: Top-level page padding must be minimal on mobile (`pt-4`, `px-4`). Never use `pt-24` or `py-12` on mobile tools or dashboard pages.
- **Component Padding**: Internal card padding should be `p-3` or `p-4` maximum for mobile. Use `gap-2` or `gap-3` for grid spacing.
- **Vertical Flow**: Use `space-y-4` or `space-y-3` for vertical layout stacks. Slashing desktop-centric whitespace is mandatory.

## Enforcement

When writing any Tailwind classes:

1. Write the mobile version first with no breakpoint prefixes
2. Add `md:` prefixes for tablet enhancements
3. Add `lg:` prefixes for desktop enhancements
4. Review: Would this work if I only had the base classes?

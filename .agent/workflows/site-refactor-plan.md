# Website Refactor Plan: SEO Interception Build

This plan focuses on renaming terminology and building the SEO interception pages. Each section can be assigned to a different agent.

**Reference:** Before starting, read [content-constraints.md](./content-constraints.md)

---

## Current State

| Component | Location | Notes |
|-----------|----------|-------|
| Calculator | `src/components/tools/IncomeBuilderTool.tsx` | Works, keep as-is |
| Calculator Page | `src/pages/tools/income-builder.astro` | Keep at current route |
| Home | `src/pages/index.astro` | May need cleanup |
| Startup | `src/pages/startup.astro` | Keep |
| Consulting | `src/pages/consulting.astro` | Rename to growth |
| Modal Store | `src/store/modalStore.ts` | `'consulting'` → `'growth'` |

---

# SECTION A: Rename Consulting → Growth

**Scope:** Rename `consulting` → `growth` across the codebase.

**Files to modify:**

### 1. `src/store/modalStore.ts`

Change `FunnelType` from `'startup' | 'consulting'` to `'startup' | 'growth'`

### 2. `src/components/HeroSplit.tsx`

Line 56: `openModal('consulting')` → `openModal('growth')`

### 3. `src/components/EmailModal.tsx`

All references to `consulting` → `growth` in messaging and logic

### 4. `src/components/MobileNav.tsx`

In `navLinks` array: Change `{ href: "/consulting", label: "Consulting" }` → `{ href: "/growth", label: "Growth" }`

### 5. `src/layouts/Layout.astro`

- Header nav: `/consulting` → `/growth`, "Consulting" → "Growth"
- Footer: Any consulting references

### 6. Rename page file

`src/pages/consulting.astro` → `src/pages/growth.astro`

### Verification

- [ ] Search codebase for "consulting" - should only appear in comments if at all
- [ ] Navigation links work
- [ ] Modal triggers correctly for both funnels

---

# SECTION B: Footer Navigation Update

**Scope:** Add SEO page links to footer in two columns.

**File:** `src/layouts/Layout.astro`

### Current Footer Structure (lines 66-101)

```
- Brand column
- Resources column (remove this)
- Company column
- Legal column
```

### New Footer Structure

```
- Brand column
- "Start a Daycare" column (6 links)
- "Grow a Daycare" column (4 links)
- Legal column
```

### Start a Daycare Links

```html
<a href="/starting-a-daycare">Starting a Daycare</a>
<a href="/starting-a-daycare-at-home">Starting a Daycare at Home</a>
<a href="/steps-to-opening-a-daycare">Steps to Opening a Daycare</a>
<a href="/daycare-business-plan">Daycare Business Plan</a>
<a href="/cost-of-starting-a-daycare">Cost of Starting a Daycare</a>
<a href="/home-daycare-income">Home Daycare Income</a>
```

### Grow a Daycare Links

```html
<a href="/childcare-employee-benefits">Employee Benefits</a>
<a href="/daycare-marketing">Daycare Marketing</a>
<a href="/childcare-communication-apps">Communication Apps</a>
<a href="/daycare-enrollment">Daycare Enrollment</a>
```

### Verification

- [ ] Footer displays two SEO columns
- [ ] No "Resources" or "Guides" framing
- [ ] All 10 links present

---

# SECTION C: SEO Pages - Startup (6 pages)

**Scope:** Create 6 SEO interception pages for startup segment.

**All pages go in:** `src/pages/`

### Template Structure (ALL pages must follow)

```astro
---
import Layout from '../layouts/Layout.astro';
import { Button } from '@/components/ui/button';
---

<Layout title="[Target Keyword] | Childcare Business Plan" description="[Meta description]">
  <main class="max-w-4xl mx-auto py-16 px-4">
    
    <!-- 1. OWNERSHIP FRAMING -->
    <section class="text-center mb-16">
      <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
        YOUR [topic]
      </h1>
      <p class="text-xl text-gray-600 max-w-2xl mx-auto">
        <!-- Make them feel the opportunity is theirs -->
      </p>
    </section>
    
    <!-- 2. FACTORS THAT AFFECT OUTCOME -->
    <section class="mb-16">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">What Affects Your [Outcome]</h2>
      <p class="text-gray-600 mb-4">
        <!-- State, capacity, licensing tier, age groups served, etc. -->
        <!-- Emphasize variability. NO SPECIFIC NUMBERS. -->
      </p>
    </section>
    
    <!-- 3. WHY GENERIC ADVICE FAILS -->
    <section class="mb-16">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Why Online Advice Often Conflicts</h2>
      <p class="text-gray-600 mb-4">
        <!-- Position personalization as the missing piece -->
      </p>
    </section>
    
    <!-- 4. CTA TO CALCULATOR -->
    <section class="text-center py-12 px-8 glass-panel rounded-3xl">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">
        See How Much YOU Could Make in Your State
      </h2>
      <p class="text-gray-600 mb-6">
        Get your personalized income estimate based on your state's regulations.
      </p>
      <a href="/tools/income-builder" class="inline-flex items-center justify-center rounded-full bg-teal-600 hover:bg-teal-700 text-white font-medium px-8 py-4 shadow-lg transition-all">
        Use the Free Calculator →
      </a>
    </section>
    
  </main>
</Layout>
```

### Pages to Create

| File | H1 Focus | Key Factors to Mention |
|------|----------|----------------------|
| `starting-a-daycare.astro` | YOUR daycare business | State regs, capacity limits, income potential |
| `starting-a-daycare-at-home.astro` | YOUR home-based daycare | Zoning, home licensing, work-life balance |
| `steps-to-opening-a-daycare.astro` | YOUR path to opening | Timeline varies by state, licensing complexity |
| `daycare-business-plan.astro` | YOUR daycare business plan | Financial projections depend on location |
| `cost-of-starting-a-daycare.astro` | YOUR startup investment | Costs vary dramatically by state/type |
| `home-daycare-income.astro` | YOUR income potential | Capacity limits, rate variability, CACFP |

### PROHIBITED Content

- ❌ Steps or numbered processes
- ❌ Checklists
- ❌ Specific dollar amounts (only calculator has these)
- ❌ "First, then, next" language
- ❌ Links to other SEO pages

### Verification

- [ ] 6 pages created
- [ ] Each follows 4-part template
- [ ] All CTAs link to `/tools/income-builder`
- [ ] No prohibited content

---

# SECTION D: SEO Pages - Growth (4 pages)

**Scope:** Create 4 SEO interception pages for growth segment.

**All pages go in:** `src/pages/`

### Same Template as Section C, but target existing owners

### Pages to Create

| File | H1 Focus | Key Factors to Mention |
|------|----------|----------------------|
| `childcare-employee-benefits.astro` | YOUR employee retention | Benefits costs, retention ROI, market rates |
| `daycare-marketing.astro` | YOUR enrollment growth | Local market, competition, saturation |
| `childcare-communication-apps.astro` | YOUR parent communication | Staff adoption, parent expectations |
| `daycare-enrollment.astro` | YOUR enrollment strategy | Waitlist management, capacity optimization |

### Note for Growth Pages

- CTA can optionally reference growth/consulting services
- Still push to calculator for those exploring expansion
- Focus on operational improvement, not startup concerns

### Verification

- [ ] 4 pages created
- [ ] Each follows 4-part template
- [ ] No prohibited content
- [ ] Targets existing owners (not aspiring)

---

# Execution Order

```
SECTION A (Rename)
      │
      ├──────────────────┐
      ▼                  ▼
SECTION C (6 SEO)   SECTION D (4 SEO)
      │                  │
      └────────┬─────────┘
               ▼
         SECTION B (Footer)
```

- **A first** - terminology must be consistent
- **C and D concurrent** - independent page creation
- **B last** - needs SEO pages to exist for links to work

---

# Quick Assignment Reference

| Section | What | Files | Size |
|---------|------|-------|------|
| A | Rename consulting → growth | 6 existing files | Small |
| B | Update footer with SEO links | 1 file | Small |
| C | Create 6 startup SEO pages | 6 new files | Medium |
| D | Create 4 growth SEO pages | 4 new files | Medium |

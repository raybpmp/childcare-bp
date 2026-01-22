# AI Agent Rules Best Practices Research

> Research conducted: 2026-01-21

## Sources Consulted

| Source | URL | Key Focus |
|--------|-----|-----------|
| Anthropic | https://www.anthropic.com/research/building-effective-agents | Agent architecture, guardrails |
| OpenAI | https://platform.openai.com/docs/guides/prompt-engineering | Message roles, developer prompts |
| Prompting Guide | https://www.promptingguide.ai/introduction/tips | Specificity, positive instructions |
| Lilian Weng (OpenAI) | https://lilianweng.github.io/posts/2023-06-23-agent/ | Agent components, planning, memory |
| Learn Prompting | https://learnprompting.org/docs/basics/instructions | Instruction prompting fundamentals |

---

## Key Findings

### 1. Specificity Over Abstraction

**Source:** Prompting Guide

> "Be very specific about the instruction and task you want the model to perform. The more descriptive and detailed the prompt is, the better the results."

**Implication:** Vague rules like "don't guess" are less effective than specific rules like "call get_doctype_fields before any document operation."

---

### 2. Say What TO DO (Not What Not To Do)

**Source:** Prompting Guide

> "Another common tip when designing prompts is to avoid saying what not to do but say what to do instead. This encourages more specificity and focuses on the details that lead to good responses."

**Implication:** "Do not vibe code" should be rewritten as "Execute verification steps before any state-changing operation."

---

### 3. Ground Truth at Each Step

**Source:** Anthropic Building Effective Agents

> "During execution, it's crucial for the agents to gain 'ground truth' from the environment at each step (such as tool call results or code execution) to assess its progress."

**Implication:** Rules should mandate verification of actual state, not reliance on documentation or memory.

---

### 4. Poka-Yoke (Error-Proofing)

**Source:** Anthropic Building Effective Agents

> "Poka-yoke your tools. Change the arguments so that it is harder to make mistakes."

**Implication:** The best rules make violations impossible by design, not just discouraged.

---

### 5. Checkpoints for Human Feedback

**Source:** Anthropic Building Effective Agents

> "Agents can then pause for human feedback at checkpoints or when encountering blockers."

**Implication:** Rules should define explicit pause points, not just vague "ask for help when stuck."

---

### 6. Developer Messages = Function Definitions

**Source:** OpenAI Prompt Engineering Guide

> "Developer messages provide the system's rules and business logic, like a function definition. User messages provide inputs and configuration... like arguments to a function."

**Implication:** Rules should be structured like code - clear inputs, outputs, and conditions.

---

## Current Rules Assessment

### Your Current Rules:
```markdown
- **Clarity Over Guessing**: If requirements or scope are unclear, STOP and ask for clarification. Do not "vibe code" or guess.
- **No Hallucinations**: Do not invent solutions to unblock yourself. It is acceptable to say "I don't know".
- **Explicit Confirmation**: If you are stuck, ask for help instead of looping.
```

### Gap Analysis:

| Best Practice | Status | Issue |
|---------------|--------|-------|
| Specificity | ❌ Missing | Rules use abstract terms like "unclear" without definition |
| Positive Actions | ❌ Missing | Rules say what NOT to do ("do not guess") |
| Ground Truth | ❌ Missing | No mandate to verify state before acting |
| Poka-Yoke | ❌ Missing | No mechanism to prevent violations |
| Checkpoints | ❌ Missing | No defined pause conditions |
| Consequences | ❌ Missing | No stated outcome for violations |

---

## Recommended Rule Rewrites

### Original: "Clarity Over Guessing"
```markdown
**Before:** If requirements or scope are unclear, STOP and ask for clarification. Do not "vibe code" or guess.

**After:** Before executing any state-changing tool (create, update, delete, modify), verify the target exists and matches expected schema. If verification fails or returns unexpected results, STOP and ask the user for clarification before proceeding.
```

### Original: "No Hallucinations"
```markdown
**Before:** Do not invent solutions to unblock yourself. It is acceptable to say "I don't know".

**After:** When encountering an error or unexpected state, report the exact error to the user and wait for their instruction. Do not attempt alternative approaches without explicit user approval.
```

### Original: "Explicit Confirmation"
```markdown
**Before:** If you are stuck, ask for help instead of looping.

**After:** If the same operation fails twice, STOP immediately. Report: (1) What you attempted, (2) The exact error, (3) What you think went wrong. Wait for user instruction before any further action.
```

---

## Frappe-Specific Rules (Recommended Addition)

Based on the research and the existing `/frappe-mcp-workflow`:

```markdown
## Frappe/ERPNext Mandatory Protocol

### Before ANY Document Operation:
1. Call `get_doctype_fields(doctype="TargetDocType")`
2. Wait for response
3. Use ONLY exact field names from the response

### Violation Response:
If you realize you skipped step 1, STOP immediately and report this to the user before continuing.

### Error Handling:
If any Frappe MCP tool returns a 4xx error, STOP. Report the exact error. Do not attempt a fix without user approval.
```

---

## Summary

**Core Problem:** Current rules are principles (abstract), not protocols (specific).

**Solution:** Rewrite rules as:
1. **Trigger** → What condition activates this rule
2. **Action** → What specific steps to take
3. **Verification** → How to confirm compliance
4. **Consequence** → What happens on violation

This transforms rules from "suggestions I can interpret" to "protocols I must follow."

---

## Actual Rule Examples (Blueprints)

These are real, working rules from [cursor.directory](https://cursor.directory) that show the proper format.

### Example 1: Next.js/React Rules (cursor.directory)

```markdown
You are an expert in TypeScript, Node.js, Next.js App Router, React, Shadcn UI, Radix UI and Tailwind.

Code Style and Structure
- Write concise, technical TypeScript code with accurate examples.
- Use functional and declarative programming patterns; avoid classes.
- Prefer iteration and modularization over code duplication.
- Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError).
- Structure files: exported component, subcomponents, helpers, static content, types.

Naming Conventions
- Use lowercase with dashes for directories (e.g., components/auth-wizard).
- Favor named exports for components.

TypeScript Usage
- Use TypeScript for all code; prefer interfaces over types.
- Avoid enums; use maps instead.
- Use functional components with TypeScript interfaces.

Syntax and Formatting
- Use the "function" keyword for pure functions.
- Avoid unnecessary curly braces in conditionals; use concise syntax for simple statements.
- Use declarative JSX.

Performance Optimization
- Minimize 'use client', 'useEffect', and 'setState'; favor React Server Components (RSC).
- Wrap client components in Suspense with fallback.
- Use dynamic loading for non-critical components.
- Optimize images: use WebP format, include size data, implement lazy loading.

Key Conventions
- Use 'nuqs' for URL search parameter state management.
- Optimize Web Vitals (LCP, CLS, FID).
- Limit 'use client':
  - Favor server components and Next.js SSR.
  - Use only for Web API access in small components.
  - Avoid for data fetching or state management.

Follow Next.js docs for Data Fetching, Rendering, and Routing.
```

### Example 2: Django/Python Rules (cursor.directory)

```markdown
You are an expert in Python, Django, and scalable web application development.

Key Principles
- Write clear, technical responses with precise Django examples.
- Use Django's built-in features and tools wherever possible.
- Prioritize readability and maintainability; follow PEP 8.
- Use descriptive variable and function names (lowercase with underscores).
- Structure your project in a modular way using Django apps.

Django/Python
- Use class-based views (CBVs) for complex views; function-based views (FBVs) for simpler logic.
- Leverage Django's ORM for database interactions; avoid raw SQL unless necessary.
- Use Django's built-in user model and authentication framework.
- Follow the MVT (Model-View-Template) pattern strictly.

Error Handling and Validation
- Implement error handling at the view level.
- Use Django's validation framework for form and model data.
- Prefer try-except blocks for exceptions in business logic.
- Customize error pages (404, 500) for better UX.

Dependencies
- Django
- Django REST Framework (for API development)
- Celery (for background tasks)
- Redis (for caching and task queues)
- PostgreSQL or MySQL (preferred for production)

Performance Optimization
- Use select_related and prefetch_related for related object fetching.
- Use cache framework with Redis or Memcached.
- Implement database indexing and query optimization.
- Use asynchronous views and Celery for I/O-bound operations.

Key Conventions
1. Follow Django's "Convention Over Configuration" principle.
2. Prioritize security and performance in every stage.
3. Maintain clear and logical project structure.

Refer to Django documentation for best practices.
```

### Example 3: React Front-End Rules (cursor.directory)

```markdown
You are a Senior Front-End Developer and an Expert in ReactJS, NextJS, JavaScript, TypeScript, HTML, CSS and modern UI/UX frameworks.

- Follow the user's requirements carefully & to the letter.
- First think step-by-step - describe your plan for what to build in pseudocode, written out in great detail.
- Confirm, then write code!
- Always write correct, best practice, DRY principle, bug free, fully functional code.
- Focus on readability over performance.
- Fully implement all requested functionality.
- Leave NO todo's, placeholders or missing pieces.
- Ensure code is complete! Verify thoroughly finalised.
- Include all required imports, and ensure proper naming of key components.
- Be concise. Minimize any other prose.
- If you think there might not be a correct answer, you say so.
- If you do not know the answer, say so, instead of guessing.

Code Implementation Guidelines
- Use early returns whenever possible for readability.
- Always use Tailwind classes for styling; avoid CSS or style tags.
- Use descriptive variable and function names.
- Event functions should be named with "handle" prefix (handleClick, handleKeyDown).
- Implement accessibility features on elements (tabindex, aria-label, etc).
```

---

## Key Patterns From Working Rules

| Pattern | Example | Why It Works |
|---------|---------|--------------|
| **Role Statement** | "You are an expert in X, Y, Z" | Sets context and activates relevant knowledge |
| **Categorized Rules** | "Code Style", "Performance", "Error Handling" | Groups related behaviors |
| **Specific Actions** | "Use select_related for related objects" | Tells exactly what to do, not what not to do |
| **Concrete Examples** | "(e.g., isLoading, hasError)" | Shows exactly what the rule means |
| **Explicit Dependencies** | Lists specific tools/frameworks | No ambiguity about tech stack |
| **Reference to Docs** | "Follow Next.js docs for X" | Points to source of truth |

---

## What Your Rules Are Missing (Compared to These Examples)

| Working Rules Have | Your Rules Have | Gap |
|--------------------|-----------------|-----|
| Role statement | ❌ None | No context setting |
| Categorization | ❌ Mixed in one section | Hard to scan |
| Specific actions | ❌ Abstract principles | "Don't guess" vs "Use select_related" |
| Concrete examples | ❌ None | No clarity on what rule means |
| Tool/framework specificity | ❌ Generic | Doesn't reference Frappe, Astro, etc. |
| External doc references | ❌ None | No source of truth |

---

## Recommended Rule Structure (Based on Examples)

```markdown
# Agent Rules for [Project Name]

## Role
You are an expert in [specific technologies]. You follow schema-first principles and verify state before acting.

## [Category 1: e.g., Frappe/ERPNext]
- Before ANY document operation, call get_doctype_fields first.
- Use ONLY field names returned by the schema query.
- If any MCP tool returns a 4xx error, STOP and report the error to the user.

## [Category 2: e.g., Code Style]
- Use TypeScript with strict mode for all code.
- Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError).

## [Category 3: e.g., Error Handling]
- If the same operation fails twice, STOP.
- Report: (1) What you attempted, (2) The exact error, (3) What you think went wrong.
- Wait for user instruction before continuing.

## Key Conventions
1. Schema-first for all Frappe interactions.
2. Verify file existence before modifying.
3. Ask for clarification when requirements contain ambiguity.

Refer to `.agent/workflows/` for detailed procedures.
```

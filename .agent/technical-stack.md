# Technical Stack & Architecture Reference

This document serves as the **Single Source of Truth** for the technical implementation of the Child Care Business Plan website. It is intended for both human developers and AI agents to understand the project's capabilities, constraints, and architectural decisions.

## 🏗️ Core Architecture
**Type:** Static Site (SSG) with Interactive "Islands" & Serverless Functions  
**Framework:** [Astro v5](https://astro.build/)  
**Language:** [TypeScript v5](https://www.typescriptlang.org/) (Strict Mode)  
**Package Manager:** npm

The site is built as a highly performant static content site using Astro. Interactive elements are hydrated partially using React components (Island Architecture).

---

## 🎨 Frontend Stack
| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **UI Framework** | **React** | v19 | Component logic & interactivity (Islands). |
| **Styling** | **Tailwind CSS** | v4 | Utility-first styling (configured via Vite). |
| **UI Primitives** | **Radix UI** | * | Unstyled, accessible UI components (Dialog, Tabs, etc.). |
| **Animation** | **Framer Motion** | v12 | Complex animations & layout transitions. |
| **Icons** | **Lucide React** | * | Consistent, consistent SVG iconography. |
| **Components** | **DaisyUI** | v5 | Tailwind component classes (Dev dependency). |

### Key Libraries
- **Forms:** `react-hook-form` + `@hookform/resolvers`
- **Validation:** `zod` (Schema validation for forms & content)
- **Carousel:** `embla-carousel-react`
- **Utilities:** `clsx`, `tailwind-merge`, `class-variance-authority` (cn generic)
- **State Management:** `nanostores` + `@nanostores/react` (Shared state between islands)

---

## 🛠️ Backend & Services
| Service | Technology | Role |
|---------|------------|------|
| **Database/Auth** | **Firebase** | Client SDK & Admin SDK. Auth, Firestore, Cloud Functions. |
| **Payments** | **Stripe** | Payment processing, Subscriptions, Products. |
| **Email** | **Nodemailer** | Transactional emails (abstracted in `EmailService`). |
| **Serverless** | **Cloud Functions** | Located in `./functions` folder. Handles backend logic. |

### Architecture Notes
- **Services Pattern:** Core logic is abstracted into `src/lib/` (e.g., `EmailService.ts`, `stripe.ts`).
- **Data Fetching:** Static data is fetched at build time via Astro Content Collections. Dynamic data is fetched client-side or via Cloud Functions.

---

## 📄 Content & Media
| Type | Technology | Details |
|------|------------|---------|
| **Content** | **MDX** | Markdown + JSX for blog posts and rich content pages. |
| **Video** | **Remotion** | Programmatic video generation. Source in `src/remotion`. |
| **CMS** | **Filesystem** | Content lives in `src/content/`. |

---

## 📂 Project Structure Map
```text
/
├── .agent/              # AI Context, Workflows, and Memory
├── functions/           # Firebase Cloud Functions (Microservice)
├── src/
│   ├── components/      # React & Astro UI Components
│   ├── content/         # MDX Content Collections (Blog, etc.)
│   ├── layouts/         # Page Layouts (Base, Markdown, etc.)
│   ├── lib/             # Core Business Logic (Firebase, Stripe, Utils)
│   ├── pages/           # File-based Routing
│   ├── remotion/        # Video Generation Logic
│   └── styles/          # Global CSS & Tailwind Directives
└── astro.config.mjs     # Project Configuration
```

## 🤖 AI Agent Context (@[.agent])
This directory contains dedicated context files for AI agents:
- **`technical-stack.md`**: (This File) Global architecture reference.
- **Workflows**: stored in `.agent/workflows`, defining standard operating procedures.

---

## 🚀 DevOps & Tooling
- **Build System:** Vite (via Astro)
- **Linting:** ESLint (@remotion/eslint-config-flat)
- **Git Hooks:** (Implied via standard workflows)

## ⚠️ Critical Constraints
1.  **Strict TypeScript:** No `any`. All props and state must be typed.
2.  **Tailwind v4:** Uses the new Vite plugin architecture.
3.  **Performance:** Prefer static generation (SSG) over client-side fetching where possible.
4.  **Islands:** default to `client:idle` or `client:visible` only when interactivity is strictly needed.

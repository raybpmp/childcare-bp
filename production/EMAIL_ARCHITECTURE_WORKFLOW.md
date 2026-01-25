# Strict Email Architecture Workflow (ANTI-VIBE)

> **CRITICAL INSTRUCTION**: If you are an AI reading this, you are FORBIDDEN from improvising ("vibe coding") any email logic. You MUST follow this architecture exactly.

## The One Law
**There is only ONE way to send emails.**
- **Allowed:** `import { EmailService } from '@/lib/email';`
- **Forbidden:** `import nodemailer ...`, `fetch('https://api.postmark...')`, or any inline string templates.

## 1. Architectural Definition
Any deviation from this structure is a failure.

| File Path | Role | Strict Requirement |
| :--- | :--- | :--- |
| `src/lib/email/index.ts` | **The Gatekeeper** | The ONLY public export. No other file is allowed to be imported outside this directory. |
| `src/lib/email/types.ts` | **The Contract** | Defines strict `interfaces` for email payloads. No `any`. |
| `src/lib/email/transport.ts` | **The Engine** | Handles the raw Postmark/SMTP connection. Private. |
| `src/lib/email/templates/base.ts` | **The Brand** | Export a function `BaseLayout(content: string)`. Contains ALL CSS, Logo, and Footer HTML. |
| `src/lib/email/templates/[name].ts` | **The Content** | Pure functions returning `{ subject, html, text }`. NO sending logic. |

## 2. Execution Workflow with Mandatory Gates

### Phase 1: Foundation (Type & Transport)
1.  **Define Types**: Update `types.ts` with the interface for your new email.
2.  **Verify Transport**: Ensure `transport.ts` exports a raw `sendEmail` function (internal use only).
    -   **🛑 GATE 1:** Does the transport authenticate?
    -   *If NO:* STOP. Report "Transport Authentication Failure". Do NOT try "other keys".

### Phase 2: Content (Templates)
3.  **Base Layout**: Ensure `templates/base.ts` exists and accepts `content` string.
4.  **Specific Template**: Create `templates/[your_email].ts`.
    -   **Requirement**: It must import `BaseLayout`.
    -   **Requirement**: It must return an object: `{ subject: string, html: string, text: string }`.
    -   **🛑 GATE 2:** Does the template output valid HTML?
    -   *If NO:* STOP. Report "Template Rendering Failure". Do NOT "hardcode" strings to bypass.

### Phase 3: The Facade (Public API)
5.  **Expose Method**: Add a method to `EmailService` in `src/lib/email/index.ts`.
    -   **Signature**: `async send[Name](props: [Name]Props): Promise<Result>`
    -   **Logic**: It must call `[Name]Template(props)` -> get HTML -> call `transport.sendEmail`.
    -   **🛑 GATE 3:** Does the specific method exist on the service?
    -   *If NO:* STOP. Report "Facade Implementation Failure".

### Phase 4: Implementation (The Only Allowed Usage)
6.  **Import**: In your API route (e.g., `api/contact-submit.ts`), import `EmailService`.
7.  **Call**: `await EmailService.send[Name](data)`.
    -   **Forbidden**: Do NOT write `<html>` strings in the API route.
    -   **Forbidden**: Do NOT use `console.log` as a "success" - check the Promise result.

## 3. Failure Protocol
If any GATE fails:
1.  **STOP IMMEIDATELY**.
2.  **Generate Report**: Write a markdown file `FAILURE_REPORT.md`.
3.  **State Cause**: "I failed at Gate [X] because [Reason]."
4.  **Await Instruction**: Do NOT attempt a "workaround".

---
**Status**: Active & Enforced.

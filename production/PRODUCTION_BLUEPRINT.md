# Production Blueprint: Child Care Business Plan Operating System

**Purpose:** This is the single authoritative source of truth for the ERPNext, CRM, and LMS configuration. It defines the setup for a clean, automated, and professional business platform.

---

## 1. Zero-Trust Access Model (The Enablement Chart)
*Philosophy: Everything is disabled by default. We only enable what is strictly necessary.*

### 1.1 The Admin Cockpit (You & Partner)
**Enabled Workspaces:**
1.  **Home** (Executive Dashboard)
2.  **Accounting** (Revenue, Invoices, Payments, P&L)
3.  **CRM** (Leads, Deals, Pipelines)
4.  **LMS** (Courses, Programs, Quizzes)
5.  **Projects** (Client Engagements, Implementation)
6.  **Website** (Pages, Blog, SEO)
7.  **Users** (Staff & Member Management)
8.  **Integrations** (Stripe, API Keys, Webhooks)
9.  **Build** (System Customization Tools)

### 1.2 The Sales Cockpit (Sales Rep)
**Required Roles:** `Sales User`, `Inbox User`, `Projects User` (ReadOnly)
**Enabled Workspaces:**
1.  **CRM** (Lead & Deal management)
2.  **Support** (Viewing customer Issues)
3.  **Projects** (Viewing client progress)
**Key "Can" Rules:**
- Communicate via Email directly inside CRM.
- View project status for clients they own.

### 1.3 The Content Cockpit (Content Staff)
**Required Roles:** `Course Creator`, `Website Manager`, `Moderator`
**Enabled Workspaces:**
1.  **LMS** (Content Building)
2.  **Website** (Blog & Pages)
3.  **File Manager** (Assets)
**Key "Can" Rules:**
- Moderate community discussions and topics.
- Publish and edit all educational material.

### 1.4 The Member View (Customer)
**Required Roles:** `LMS Student`
**Enabled Workspaces:**
- **NONE.** (Backend Desk Access is BLOCKED).
**Portal Access (Frontend @ /portal):**
- **Courses:** View and consume enrolled content.
- **Community:** Create Discussion Topics and Reply to others.
- **Support:** Open "Issues" (Help Tickets) and track status.

---

## 2. Content Access Control (The "Lever")
*Objective: Gate content based on tiered membership without creating redundant system roles.*

### 2.1 The Portal Hook
We use native **LMS Programs** to group tiered content:
- **Launchpad Program:** Startup Courses.
- **Director Program:** Growth Courses.
- **CEO Program:** Strategic/Mastermind Courses.

### 2.2 Access Logic
- Everyone is an **LMS Student**.
- Access to specific Programs/Courses is granted via **LMS Enrollment** records.
- Enrollment is the trigger for content appearing in the client's dashboard.

---

## 3. CRM Schema (The Quiz Data)
*Objective: Capture high-value lead data from the Astro frontend.*

**DocType:** `Lead`
- `funnel_segment`: Select (Startup, Growth)
- `revenue_potential`: Currency
- `quiz_state`: Data (Target Geography)
- `quiz_payload_raw`: Long Text (JSON dump of all quiz answers for context)
- `stripe_customer_id`: Data

---

## 4. Automation Architecture (The Universal Premium Bridge)
*Objective: Automate a high-touch, premium onboarding experience for every single customer.*

**Trigger:** Stripe Webhook (`checkout.session.completed`)
**Location:** /src/pages/api/webhooks/stripe.ts

**Sequence (Universal - Applied to All Tiers):**
1.  **Identity:** Match/Create User account + Assign `LMS Student` Role.
2.  **Finance:** Create Sales Invoice + Mark Paid in Frappe.
3.  **Content:** Create **LMS Enrollment** for the purchased Program (Launchpad, Director, or CEO).
4.  **Service:** **Surgically create a Project** linked to the User. Every customer at $99/mo+ is a project. Use the "New Client Onboarding" template to track their licensing and business milestones.
5.  **Welcome:** Trigger "Access Granted" email with login details and a link to their new Onboarding Project.

---

## 5. Summary of the "Single Path"
- **No distinction between tiers for system logic.** 
- Every customer is a `Project`.
- Every customer is a `Student`.
- Every customer is a `Lead` converted to a `Customer`.

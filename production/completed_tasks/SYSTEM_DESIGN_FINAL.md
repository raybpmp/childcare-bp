# Childcare Business Plan - Zero-Trust System Design
## Final Implementation Specification

> **Document Status**: FINAL — Ready for Implementation
> **Reviewed By**: Senior Frappe Ecosystem Specialist
> **Date**: 2026-01-20
> **Version**: 2.0

---

## Document History

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 1.0 | 2026-01-20 | Junior Analyst | Initial design |
| 1.1 | 2026-01-20 | Secretary | Gap analysis |
| 2.0 | 2026-01-20 | Senior Specialist | Final corrected version |

---

## Part 1: Executive Summary

### 1.1 System Purpose

This document defines the complete access control architecture for the Childcare Business Plan portal system built on the Frappe ecosystem (ERPNext + Frappe CRM + Frappe LMS).

### 1.2 Design Philosophy

**Zero-Trust Architecture**
- Every user starts with NO access
- Access is explicitly granted, never inherited by default
- Workspaces are hidden until whitelisted
- DocType permissions are minimal until expanded
- UI hiding is NOT security — DocType permissions are security

### 1.3 Key Decisions (Locked)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| CRM System | **Frappe CRM** (not ERPNext native CRM) | Modern, purpose-built, better UX |
| Custom Roles | **None** — use native roles only | Maintainability, upgrade safety |
| Tier Access | **Independent** — each tier purchased separately | Revenue optimization, clear billing |
| Portal Access | **Frappe LMS Portal** for customers | Native integration, no custom build |
| Desk Access | **Blocked** for customers | Security, clean separation |

---

## Part 2: User Types & Role Mapping

### 2.1 User Type Definitions

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER TYPE HIERARCHY                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                            ┌──────────┐                                  │
│                            │  OWNER   │                                  │
│                            │  (You)   │                                  │
│                            └────┬─────┘                                  │
│                                 │                                        │
│               ┌─────────────────┼─────────────────┐                     │
│               │                 │                 │                     │
│               ▼                 ▼                 ▼                     │
│        ┌──────────┐      ┌──────────┐      ┌──────────┐                │
│        │ MANAGER  │      │  SALES   │      │ AI AGENT │                │
│        │ (Staff)  │      │ (Staff)  │      │  (API)   │                │
│        └────┬─────┘      └────┬─────┘      └────┬─────┘                │
│             │                 │                 │                       │
│             └────────┬────────┴────────┬────────┘                       │
│                      │                 │                                │
│                      ▼                 ▼                                │
│             ┌─────────────────────────────────┐                         │
│             │           CUSTOMER              │                         │
│             │  (Launchpad / Director / CEO)   │                         │
│             └─────────────────────────────────┘                         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Access Method Summary

| User Type | Desk Access | Portal Access | API Access | Login URL |
|-----------|:-----------:|:-------------:|:----------:|-----------|
| Owner | ✅ Full | ✅ Full | ✅ Full | `/app` |
| Manager | ✅ Limited | ✅ Full | ❌ | `/app` |
| Sales | ✅ Limited | ❌ | ❌ | `/app` |
| Customer | ❌ **BLOCKED** | ✅ Limited | ❌ | `/lms` |
| AI Agent | ❌ | ❌ | ✅ Token | API only |

### 2.3 Native Role Assignments

Each user type is implemented using a **Role Profile** (collection of native roles) AND a **Module Profile** (workspace visibility).

> ⚠️ **CRITICAL**: Both Role Profile AND Module Profile must be assigned to each user. They are independent settings.

---

#### 2.3.1 OWNER

**Role Profile**: `Owner` (or assign roles directly to System Administrator)

| Native Role | Purpose |
|-------------|---------|
| System Manager | Full system configuration |
| Administrator | Bypass all permission checks |
| Accounts Manager | Full accounting access |
| Sales Manager | Full sales/CRM access |
| Projects Manager | Full project management |
| Website Manager | Full website/CMS access |
| Course Creator | LMS content management |
| Moderator | Community moderation |
| Script Manager | Server/Client scripts |
| Workspace Manager | Workspace configuration |

**Module Profile**: None (access all modules)

---

#### 2.3.2 MANAGER (Sub-Admin)

**Role Profile Name**: `Manager`

| Native Role | Purpose |
|-------------|---------|
| Desk User | Enables Desk access |
| Accounts User | View financial data |
| Sales Manager | Manage CRM pipeline |
| Projects Manager | Manage client projects |
| Course Creator | Manage LMS content |
| Moderator | Moderate community |
| Support Team | Handle support tickets |
| Report Manager | Run reports |
| Inbox User | Email integration |

**Module Profile Name**: `Manager Modules`

| Module | Access |
|--------|:------:|
| Accounts | ✅ |
| CRM | ❌ (using Frappe CRM instead) |
| FCRM | ✅ |
| LMS | ✅ |
| Projects | ✅ |
| Support | ✅ |
| Website | ✅ |
| Selling | ✅ |
| Setup | ❌ |
| Core | ❌ |
| Integrations | ❌ |
| Assets | ❌ |
| Buying | ❌ |
| Stock | ❌ |
| Manufacturing | ❌ |
| HR | ❌ |

**Permission Modifications Required**:
- Accounts User: Remove Write, Create, Delete on Journal Entry, Payment Entry (view-only financials)

---

#### 2.3.3 SALES (Employee)

**Role Profile Name**: `Sales`

| Native Role | Purpose |
|-------------|---------|
| Desk User | Enables Desk access |
| Sales User | CRM access (Frappe CRM) |
| Inbox User | Email integration |
| Support Team | View/create support tickets |

**Module Profile Name**: `Sales Modules`

| Module | Access |
|--------|:------:|
| FCRM | ✅ |
| Projects | ✅ |
| Support | ✅ |
| All others | ❌ |

**Permission Modifications Required**:
- Project: Read ONLY (remove Write, Create, Delete)
- Task: Read ONLY (remove Write, Create, Delete)

**User Permission (Data Isolation)**:
- CRM Lead: Apply User Permissions = Yes (sees only leads where they are the owner)

---

#### 2.3.4 CUSTOMER (Member)

**Role Profile Name**: `Customer`

| Native Role | Purpose |
|-------------|---------|
| LMS Student | Portal access, course consumption |
| Customer | Portal identity |

**Module Profile Name**: `Customer Modules`

| Module | Access |
|--------|:------:|
| LMS | ✅ (Portal only) |
| Support | ✅ (Portal only) |
| All others | ❌ |

**Critical Settings**:
- `desk_access` = 0 on both LMS Student and Customer roles (enforced by Frappe)
- User Type = "Website User" (NOT "System User")

**Permission Modifications Required**:
- Issue: Add Create, Read, Write for LMS Student (with if_owner=1)
- LMS Discussion Topic: Add Create, Read, Write for LMS Student
- LMS Discussion Reply: Add Create, Read, Write for LMS Student

---

#### 2.3.5 AI AGENT (Automation)

**Role Profile Name**: `AI Agent`

| Native Role | Purpose |
|-------------|---------|
| Sales User | Create/update CRM Leads |
| Accounts User | Create Sales Invoices |
| Projects User | Create Projects |

**Module Profile Name**: `AI Modules`

| Module | Access |
|--------|:------:|
| FCRM | ✅ |
| Selling | ✅ |
| Accounts | ✅ |
| Projects | ✅ |
| LMS | ✅ |
| All others | ❌ |

**Critical Settings**:
- `desk_access` = irrelevant (API bypasses this check)
- User Type = "System User" (required for API access)
- API Key + Secret generated and stored securely
- Used by: MCP Server, Stripe Webhooks, Automation scripts

**Permission Modifications Required**:
- All assigned DocTypes: Remove Delete permission (safety)

---

## Part 3: Workspace Configuration

### 3.1 Understanding Workspace Visibility

Workspaces are controlled by TWO mechanisms:

1. **Module Profile** (Primary): Blocks entire modules. If module is blocked, workspace won't appear.
2. **Workspace `roles` field** (Secondary): Additional restriction. If roles specified, only users with those roles see the workspace.

> ⚠️ **IMPORTANT**: Workspace hiding is UI convenience, NOT security. Users with DocType permissions can still access records via URL or search. Real security is DocType permissions.

### 3.2 Workspace Visibility Matrix

| Workspace | Module | Owner | Manager | Sales | Customer | AI |
|-----------|--------|:-----:|:-------:|:-----:|:--------:|:--:|
| **Home** | Setup | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Frappe CRM** | FCRM | ✅ | ✅ | ✅ | ❌ | ❌ |
| **CRM** | CRM | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Accounting** | Accounts | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Financial Reports** | Accounts | ✅ | ✅ | ❌ | ❌ | ❌ |
| **LMS** | LMS | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Projects** | Projects | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Support** | Support | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Website** | Website | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Selling** | Selling | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Users** | Core | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Build** | Core | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Integrations** | Integrations | ✅ | ❌ | ❌ | ❌ | ❌ |
| **ERPNext Settings** | Setup | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Assets** | Assets | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Buying** | Buying | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Stock** | Stock | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Manufacturing** | Manufacturing | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Subcontracting** | Subcontracting | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Quality** | Quality Management | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Welcome Workspace** | Core | ❌ | ❌ | ❌ | ❌ | ❌ |

### 3.3 Workspace Restriction Implementation

**For unused workspaces (Assets, Buying, Stock, etc.):**

Create a role named `Blocked` with:
- No permissions on any DocType
- `desk_access` = 0

Then set each unused workspace's `roles` field to `["Blocked"]`.

This effectively hides them from everyone while being safe and reversible.

**For the native CRM workspace:**

Set `roles` field to `["Blocked"]` — we use Frappe CRM instead.

---

## Part 4: DocType Permission Matrix

### 4.1 Permission Legend

| Symbol | Meaning |
|:------:|---------|
| R | Read |
| W | Write (update existing) |
| C | Create (new records) |
| D | Delete |
| — | No access |
| Own | Only records they own/created |

### 4.2 Frappe CRM DocTypes

| DocType | Owner | Manager | Sales | Customer | AI |
|---------|:-----:|:-------:|:-----:|:--------:|:--:|
| CRM Lead | RWCD | RWCD | RWC (Own) | — | RWC |
| CRM Deal | RWCD | RWCD | RWC (Own) | — | RWC |
| CRM Organization | RWCD | RWCD | RW (Own) | — | RWC |
| CRM Lead Status | RWCD | R | — | — | — |
| CRM Lead Source | RWCD | R | — | — | — |
| CRM Task | RWCD | RWCD | RWC (Own) | — | RWC |

### 4.3 Sales & Accounting DocTypes

| DocType | Owner | Manager | Sales | Customer | AI |
|---------|:-----:|:-------:|:-----:|:--------:|:--:|
| Customer | RWCD | RWCD | R | R (Own) | RWC |
| Sales Invoice | RWCD | R | — | R (Own) | RWC |
| Sales Order | RWCD | RWCD | R | — | RWC |
| Payment Entry | RWCD | R | — | — | RC |
| Item | RWCD | R | — | — | R |

### 4.4 LMS DocTypes

| DocType | Owner | Manager | Sales | Customer | AI |
|---------|:-----:|:-------:|:-----:|:--------:|:--:|
| LMS Program | RWCD | RWCD | — | R (Enrolled) | R |
| LMS Course | RWCD | RWCD | — | R (Enrolled) | R |
| LMS Enrollment | RWCD | RWCD | — | R (Own) | RWC |
| LMS Batch | RWCD | RWCD | — | R (Enrolled) | R |
| LMS Discussion Topic | RWCD | RWCD | — | RWC (Own) | — |
| LMS Discussion Reply | RWCD | RWCD | — | RWC (Own) | — |

### 4.5 Projects DocTypes

| DocType | Owner | Manager | Sales | Customer | AI |
|---------|:-----:|:-------:|:-----:|:--------:|:--:|
| Project | RWCD | RWCD | R | — | RWC |
| Task | RWCD | RWCD | R | — | RWC |
| Project Template | RWCD | R | — | — | R |

### 4.6 Support DocTypes

| DocType | Owner | Manager | Sales | Customer | AI |
|---------|:-----:|:-------:|:-----:|:--------:|:--:|
| Issue | RWCD | RWCD | RWC | RWC (Own) | RWC |
| Issue Type | RWCD | R | R | — | — |
| Issue Priority | RWCD | R | R | — | — |

### 4.7 System DocTypes (Restricted)

| DocType | Owner | Manager | Sales | Customer | AI |
|---------|:-----:|:-------:|:-----:|:--------:|:--:|
| User | RWCD | — | — | — | — |
| Role | RWCD | — | — | — | — |
| Role Profile | RWCD | — | — | — | — |
| Module Profile | RWCD | — | — | — | — |
| System Settings | RWCD | — | — | — | — |
| Email Account | RWCD | — | — | — | — |

---

## Part 5: LMS Program Access Control

### 5.1 Existing Programs

| Program Name | Tier | Portal Visibility |
|--------------|------|-------------------|
| Launchpad Program | Entry ($99/mo) | Only when enrolled |
| Director Program | Growth ($349/mo) | Only when enrolled |
| CEO Program | Premium ($1,497/mo) | Only when enrolled |

### 5.2 Access Control Mechanism

LMS access is controlled via the **LMS Enrollment** DocType:

```
LMS Enrollment:
  - member: [Link to User]
  - program: [Link to LMS Program]
  - progress: [Percentage]
  - enrollment_date: [Date]
```

**How it works:**
1. Customer purchases tier via Stripe
2. Webhook creates LMS Enrollment linking User to Program
3. Customer logs into `/lms`
4. Frappe LMS queries Enrollments for that User
5. Only enrolled Programs appear in their dashboard

### 5.3 Tier Independence

Each tier is **independent**:
- Purchasing CEO does NOT include Director or Launchpad
- Each tier requires its own Enrollment record
- This enables clear billing and upselling

**To change to cumulative tiers:**
- Webhook would need to create multiple Enrollments
- E.g., CEO purchase → Create 3 Enrollments (Launchpad + Director + CEO)

### 5.4 Program/Course URL Security

**Current assumption:** Frappe LMS checks enrollment before displaying course content.

**VERIFICATION REQUIRED:**
- [ ] Can a logged-in user access `/lms/course/xyz` if they're NOT enrolled?
- [ ] If yes, implement `has_permission` hook on LMS Course
- [ ] Test this during Phase 1 verification

---

## Part 6: Portal Routes & Customer Experience

### 6.1 Verified Portal Routes

> ⚠️ **NOTE**: These need to be verified on the actual server. Frappe LMS routes may vary by version.

| Route | Purpose | Access |
|-------|---------|--------|
| `/lms` | LMS Home/Dashboard | LMS Student |
| `/lms/programs` | List all programs | LMS Student (sees enrolled only) |
| `/lms/program/{name}` | Specific program | If enrolled |
| `/lms/courses` | List all courses | LMS Student (sees enrolled only) |
| `/lms/course/{name}` | Specific course | If enrolled |
| `/lms/course/{name}/learn` | Course content player | If enrolled |
| `/support` | Support ticket portal | LMS Student (own only) |
| `/me` | User profile | Logged in users |

### 6.2 Blocked Routes for Customers

| Route | Why Blocked |
|-------|-------------|
| `/app` | Desk access blocked via role |
| `/app/*` | All desk routes blocked |
| `/api/resource/*` | Only accessible with proper permissions |

### 6.3 Customer Journey

```
┌──────────────────────────────────────────────────────────────────────┐
│                     CUSTOMER PORTAL JOURNEY                           │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   1. Purchase Complete                                                │
│      └─▶ Webhook fires                                               │
│          └─▶ User created (if new)                                   │
│              ├─▶ Role Profile: Customer                              │
│              ├─▶ Module Profile: Customer Modules                    │
│              └─▶ User Type: Website User                             │
│          └─▶ LMS Enrollment created                                  │
│          └─▶ Welcome email sent (login credentials)                  │
│                                                                       │
│   2. First Login                                                      │
│      └─▶ Customer goes to: portal.childcarebusinessplan.com/lms     │
│      └─▶ Enters email + password                                     │
│      └─▶ Sees LMS Dashboard with enrolled Programs                   │
│                                                                       │
│   3. Content Consumption                                              │
│      └─▶ Click Program → See Courses                                 │
│      └─▶ Click Course → See Lessons                                  │
│      └─▶ Complete lessons, track progress                            │
│                                                                       │
│   4. Community Participation                                          │
│      └─▶ Access course discussions                                   │
│      └─▶ Create topics, reply to others                              │
│                                                                       │
│   5. Support                                                          │
│      └─▶ Access /support or /tickets                                 │
│      └─▶ Create new Issue                                            │
│      └─▶ Track status of their Issues                                │
│                                                                       │
│   ❌ BLOCKED: Cannot access /app (Desk)                              │
│   ❌ BLOCKED: Cannot see other customers                             │
│   ❌ BLOCKED: Cannot see unauthorized Programs/Courses               │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Part 7: Automation Architecture

### 7.1 Stripe Webhook Flow

**Webhook Endpoint**: `/api/webhooks/stripe.ts` (Astro)

**Event**: `checkout.session.completed`

```
┌──────────────────────────────────────────────────────────────────────┐
│                    STRIPE WEBHOOK PROCESSING                          │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   Stripe                     Astro                    Frappe          │
│   ──────                     ─────                    ──────          │
│                                                                       │
│   checkout.session           POST /api/                               │
│   .completed ──────────────▶ webhooks/stripe.ts                      │
│                                    │                                  │
│                                    ▼                                  │
│                              Verify signature                         │
│                                    │                                  │
│                                    ▼                                  │
│                              Extract: email,         API Call         │
│                              product_id, ────────────────────────▶   │
│                              metadata                                 │
│                                                                       │
│                                                      ┌──────────────┐│
│   Step 1: Find/Create User                           │              ││
│   ──────────────────────                             │  GET User    ││
│   Check if email exists ◀────────────────────────────│  by email    ││
│                                                      │              ││
│   If not exists:                                     │  POST User   ││
│   - Create User ◀────────────────────────────────────│  + roles     ││
│   - Assign Role Profile: Customer                    │              ││
│   - Assign Module Profile: Customer Modules          └──────────────┘│
│   - User Type: Website User                                          │
│                                                                       │
│   Step 2: Find/Create Customer                       ┌──────────────┐│
│   ────────────────────────                           │              ││
│   Link User to Customer ◀────────────────────────────│ POST Customer││
│   DocType for billing                                │              ││
│                                                      └──────────────┘│
│                                                                       │
│   Step 3: Create Sales Invoice                       ┌──────────────┐│
│   ─────────────────────────                          │              ││
│   Create paid invoice ◀──────────────────────────────│ POST Sales   ││
│   for accounting                                     │ Invoice      ││
│                                                      └──────────────┘│
│                                                                       │
│   Step 4: Create LMS Enrollment                      ┌──────────────┐│
│   ────────────────────────────                       │              ││
│   Map product_id to ◀────────────────────────────────│ POST LMS     ││
│   Program name and                                   │ Enrollment   ││
│   create enrollment                                  └──────────────┘│
│                                                                       │
│   Step 5: Create Project (Optional)                  ┌──────────────┐│
│   ─────────────────────────────                      │              ││
│   For high-touch tiers, ◀────────────────────────────│ POST Project ││
│   create onboarding                                  │ from template││
│   project from template                              └──────────────┘│
│                                                                       │
│   Step 6: Send Welcome Email                         ┌──────────────┐│
│   ────────────────────────                           │              ││
│   Trigger welcome ◀──────────────────────────────────│ POST sendmail││
│   email with login                                   │ or use       ││
│   instructions                                       │ Notification ││
│                                                      └──────────────┘│
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

### 7.2 Product ID to Program Mapping

```javascript
const PRODUCT_TO_PROGRAM = {
  'price_launchpad_monthly': 'Launchpad Program',
  'price_launchpad_yearly': 'Launchpad Program',
  'price_director_monthly': 'Director Program',
  'price_director_yearly': 'Director Program',
  'price_ceo_monthly': 'CEO Program',
  'price_ceo_yearly': 'CEO Program',
};

const PRODUCT_TO_PROJECT_TEMPLATE = {
  'price_director_monthly': 'Director Onboarding',
  'price_director_yearly': 'Director Onboarding',
  'price_ceo_monthly': 'CEO Onboarding',
  'price_ceo_yearly': 'CEO Onboarding',
  // Launchpad: No project (self-serve tier)
};
```

### 7.3 AI Agent API Access

**User**: `api@childcarebusinessplan.com`

**Authentication**:
```
Authorization: token {api_key}:{api_secret}
```

**Endpoint Base**: `https://portal.childcarebusinessplan.com`

**Used By**:
- MCP Server (Claude/AI interactions)
- Stripe Webhook Handler
- Scheduled automation scripts

---

## Part 8: Email Configuration

### 8.1 Email Account Setup

**Required Configuration in Frappe:**

| Setting | Value |
|---------|-------|
| Email Address | `hello@childcarebusinessplan.com` |
| Email Provider | Postmark / SendGrid / Gmail SMTP |
| Enable Outgoing | Yes |
| Default Outgoing | Yes |
| Use IMAP | Optional (for incoming) |

### 8.2 Email Templates Required

| Template Name | Trigger | Content |
|---------------|---------|---------|
| Welcome - Launchpad | Enrollment created | Login instructions, program overview |
| Welcome - Director | Enrollment created | Login instructions, intro call booking |
| Welcome - CEO | Enrollment created | Login instructions, VIP onboarding |
| Support Ticket Created | Issue created | Confirmation, expected response time |
| Support Ticket Updated | Issue status change | Status update, next steps |

---

## Part 9: Implementation Checklist

### Phase 0: Prerequisites (15 mins)

- [ ] SSH access to server verified
- [ ] MCP connection to production working
- [ ] Backup taken before changes

### Phase 1: Verification (30 mins)

- [ ] Verify portal routes: `/lms`, `/lms/programs`, etc.
- [ ] Test: Can non-enrolled user access course URL?
- [ ] Check current permissions for LMS Student role
- [ ] Check current permissions for Customer role
- [ ] Check Issue permissions for portal ticket creation
- [ ] Check LMS Discussion permissions

### Phase 2: Clean Up (30 mins)

- [ ] Create `Blocked` role (disabled, no permissions)
- [ ] Set unused workspaces to `roles: ["Blocked"]`:
  - Assets, Buying, Stock, Manufacturing, Subcontracting, Quality, Welcome Workspace
- [ ] Set native CRM workspace to `roles: ["Blocked"]`
- [ ] Delete misplaced Leads from ERPNext native Lead DocType (2 records)

### Phase 3: Module Profiles (45 mins)

- [ ] Create `Manager Modules` Module Profile
- [ ] Create `Sales Modules` Module Profile
- [ ] Create `Customer Modules` Module Profile
- [ ] Create `AI Modules` Module Profile

### Phase 4: Role Profiles (45 mins)

- [ ] Create `Manager` Role Profile with specified roles
- [ ] Create `Sales` Role Profile with specified roles
- [ ] Create `Customer` Role Profile with specified roles
- [ ] Create `AI Agent` Role Profile with specified roles

### Phase 5: Permission Modifications (1.5 hours)

CRM Permissions:
- [ ] Sales User: CRM Lead (RWC + if_owner)
- [ ] Sales User: CRM Deal (RWC + if_owner)
- [ ] Sales User: CRM Organization (RW + if_owner)

Projects Permissions (Sales Read-Only):
- [ ] Sales User: Project (R only, remove WCD)
- [ ] Sales User: Task (R only, remove WCD)

Customer/LMS Permissions:
- [ ] LMS Student: Issue (RWC + if_owner)
- [ ] LMS Student: LMS Discussion Topic (RWC + if_owner)
- [ ] LMS Student: LMS Discussion Reply (RWC + if_owner)

Manager View-Only Financials:
- [ ] Accounts User: Journal Entry (R only for Manager-specific rule)
- [ ] Accounts User: Payment Entry (R only for Manager-specific rule)

AI Safety:
- [ ] All AI Agent roles: Remove Delete permissions

### Phase 6: Workspace Roles (30 mins)

Set `roles` field on each workspace:
- [ ] Users: `["System Manager"]`
- [ ] Build: `["System Manager"]`
- [ ] Integrations: `["System Manager"]`
- [ ] ERPNext Settings: `["System Manager"]`
- [ ] Accounting: `["Accounts User", "Accounts Manager"]`
- [ ] Financial Reports: `["Accounts User", "Accounts Manager"]`

### Phase 7: API User Setup (30 mins)

- [ ] Create user `api@childcarebusinessplan.com`
- [ ] User Type: System User
- [ ] Assign Role Profile: AI Agent
- [ ] Assign Module Profile: AI Modules
- [ ] Generate API Key and Secret
- [ ] Store credentials securely
- [ ] Update MCP configuration with new credentials
- [ ] Test MCP connection

### Phase 8: Email Setup (30 mins)

- [ ] Configure Email Account in Frappe
- [ ] Create Welcome email templates (3 tiers)
- [ ] Create Support ticket templates
- [ ] Test email sending

### Phase 9: Project Templates (30 mins)

- [ ] Create "Director Onboarding" Project Template
- [ ] Create "CEO Onboarding" Project Template
- [ ] Define initial tasks in each template

### Phase 10: Webhook Handler (2 hours)

- [ ] Create `/api/webhooks/stripe.ts`
- [ ] Implement 6-step onboarding logic
- [ ] Add Stripe signature verification
- [ ] Add error handling and logging
- [ ] Test with Stripe test mode

### Phase 11: Testing (1.5 hours)

- [ ] Create test user: `test.manager@example.com` → Manager
- [ ] Create test user: `test.sales@example.com` → Sales
- [ ] Create test user: `test.customer@example.com` → Customer
- [ ] Login as each, verify:
  - Correct workspaces visible
  - Correct DocTypes accessible
  - Blocked areas truly blocked
  - Customer cannot access /app
- [ ] Test end-to-end purchase flow
- [ ] Document any discrepancies

### Phase 12: Documentation Update (30 mins)

- [ ] Update this document with verified portal routes
- [ ] Update with any permission adjustments made
- [ ] Mark all items complete
- [ ] Change document status to "IMPLEMENTED"

---

## Part 10: Quick Reference

### 10.1 Key URLs

| URL | Purpose |
|-----|---------|
| `https://portal.childcarebusinessplan.com/app` | Desk login (staff) |
| `https://portal.childcarebusinessplan.com/lms` | Portal login (customers) |
| `https://portal.childcarebusinessplan.com/api/resource/CRM Lead` | API: CRM Leads |

### 10.2 SSH Access

```bash
ssh -i /tmp/server_key.pem ubuntu@150.136.42.8
cd /opt/ccbusinessplan/frappe_docker
docker compose exec backend bench --site portal.childcarebusinessplan.com console
```

### 10.3 Role Profile Summary

| User Type | Role Profile | Module Profile |
|-----------|--------------|----------------|
| Owner | (Direct assignment) | None |
| Manager | Manager | Manager Modules |
| Sales | Sales | Sales Modules |
| Customer | Customer | Customer Modules |
| AI Agent | AI Agent | AI Modules |

### 10.4 Critical Security Rules

1. **System Manager** = Owner ONLY
2. **Administrator** = Owner ONLY
3. **desk_access=0** for all Customer roles
4. **User Type = Website User** for all Customers
5. **Delete permission** = Owner and Manager only
6. **API Delete** = Blocked for AI Agent
7. **User DocType** = Owner ONLY

---

## Appendix A: Frappe Permission Model Reference

### A.1 Permission Hierarchy

```
User
 └─▶ Role Profile (collection of roles)
 └─▶ Module Profile (module visibility)
 └─▶ User Permissions (data-level restrictions)

Role
 └─▶ DocType Permissions (RWCD per DocType)
      └─▶ if_owner flag (see only own records)
      └─▶ Apply User Permissions checkbox

Workspace
 └─▶ roles field (UI visibility only)
 └─▶ module (blocked if module not in Module Profile)
```

### A.2 Permission Check Order

1. Is user's Module Profile allowing this module? → If no, block
2. Does user have a Role with permission on this DocType? → If no, block
3. Is `if_owner` enabled? → If yes, filter to own records
4. Is `Apply User Permissions` enabled? → If yes, apply additional filters

### A.3 Key DocTypes for Configuration

| DocType | Purpose |
|---------|---------|
| Role | Define role and desk_access |
| Role Profile | Group roles for assignment |
| Module Profile | Control module visibility |
| User Permission | Restrict data access per document |
| DocType Permission | RWCD + if_owner per role per DocType |
| Workspace | UI navigation, roles field for visibility |

---

*End of Document*

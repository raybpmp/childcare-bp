# Childcare Business Plan - Zero-Trust System Design

> **Document Purpose**: This is the single source of truth for the ERPNext/Frappe system architecture. It defines every role, every permission, and every workspace visibility rule.
>
> **Philosophy**: Zero-Trust. Everything is OFF by default. We only enable what each role explicitly needs.
>
> **Created**: 2026-01-20
> **Status**: DESIGN (Pending Implementation)

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Role Definitions](#2-role-definitions)
3. [Role-to-System-Role Mapping](#3-role-to-system-role-mapping)
4. [Workspace Visibility Matrix](#4-workspace-visibility-matrix)
5. [Module Access Matrix](#5-module-access-matrix)
6. [DocType Permission Matrix](#6-doctype-permission-matrix)
7. [LMS Program Access Control](#7-lms-program-access-control)
8. [Portal vs Desk Access](#8-portal-vs-desk-access)
9. [Implementation Checklist](#9-implementation-checklist)
10. [Visualization Diagrams](#10-visualization-diagrams)

---

## 1. System Overview

### 1.1 The Business Model

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     CHILDCARE BUSINESS PLAN SYSTEM                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   FRONTEND (Astro)              BACKEND (Frappe Triple Stack)           │
│   ─────────────────             ─────────────────────────────           │
│   • Landing Page                • ERPNext (Accounting, Sales)           │
│   • Quiz Funnel                 • Frappe CRM (Lead Management)          │
│   • Pricing Page                • Frappe LMS (Course Delivery)          │
│   • Stripe Checkout                                                      │
│                                                                          │
│   ┌──────────┐                  ┌──────────────────────────┐            │
│   │  Lead    │ ──────────────▶  │  CRM Lead (Captured)     │            │
│   │ Capture  │                  └──────────────────────────┘            │
│   └──────────┘                              │                            │
│                                             ▼                            │
│   ┌──────────┐                  ┌──────────────────────────┐            │
│   │  Stripe  │ ──────────────▶  │  Customer + LMS Student  │            │
│   │ Payment  │                  │  + Program Enrollment    │            │
│   └──────────┘                  └──────────────────────────┘            │
│                                             │                            │
│                                             ▼                            │
│                                 ┌──────────────────────────┐            │
│                                 │  Portal Access           │            │
│                                 │  (Courses, Community,    │            │
│                                 │   Support Tickets)       │            │
│                                 └──────────────────────────┘            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 User Types

| User Type | Description | Desk Access | Portal Access |
|-----------|-------------|-------------|---------------|
| **Owner** | You (System Administrator) | ✅ Full | ✅ Full |
| **Manager** | Sub-admin, operations oversight | ✅ Limited | ✅ Full |
| **Sales** | Employee handling leads and customer communication | ✅ Limited | ❌ No |
| **Customer** | Paying members (Launchpad/Director/CEO) | ❌ No | ✅ Yes |
| **AI Agent** | Automation/API access for system operations | ✅ API Only | ❌ No |

---

## 2. Role Definitions

### 2.1 Owner (You)

**Purpose**: Full control of the entire system. Can see everything, do everything.

**What they do**:
- Configure system settings
- Manage all users and their roles
- View all financial data
- Access all modules
- Build and customize the system

**Access Level**: God Mode

---

### 2.2 Manager (Sub-Admin)

**Purpose**: Oversee day-to-day operations without system-level access. Can manage staff, view reports, and handle escalations.

**What they do**:
- View dashboards and reports
- Manage Projects for clients
- Oversee CRM pipeline
- Manage LMS content
- Handle support escalations
- View (but not modify) financial data

**What they CANNOT do**:
- Change system settings
- Create/modify users
- Access Build/Integrations
- Modify accounting entries
- Delete master data

---

### 2.3 Sales (Employee)

**Purpose**: Handle leads and customer communication. Focus on CRM and email.

**What they do**:
- Work leads in CRM
- Send emails to leads/customers
- View project status (read-only)
- Create support tickets on behalf of customers

**What they CANNOT do**:
- Access accounting
- Modify LMS content
- Change system settings
- See other users' leads (if configured)
- Access any master data

---

### 2.4 Customer (Member)

**Purpose**: Consume content through the Portal. No Desk access whatsoever.

**What they do**:
- Access LMS courses (based on their tier enrollment)
- Participate in community discussions
- Create support tickets
- View their own profile/orders

**What they CANNOT do**:
- Access Desk (backend)
- See other customers
- Modify any system data
- Access any internal tools

---

### 2.5 AI Agent (Automation)

**Purpose**: API access for automation. Used by MCP and webhooks.

**What they do**:
- Create/update Leads
- Create Customers
- Create Sales Invoices
- Create LMS Enrollments
- Create Projects
- Trigger emails

**What they CANNOT do**:
- Delete records
- Modify system settings
- Access UI (Desk)
- Change user permissions

---

## 3. Role-to-System-Role Mapping

We are NOT creating custom roles. We are using existing Frappe/ERPNext system roles.

### 3.1 Owner

```
┌─────────────────────────────────────────────────┐
│                    OWNER                         │
├─────────────────────────────────────────────────┤
│  Assigned Native Roles:                          │
│  ├── System Manager (Full system access)        │
│  ├── Administrator (Super permissions)          │
│  ├── Accounts Manager                            │
│  ├── Sales Manager                               │
│  ├── Projects Manager                            │
│  ├── Website Manager                             │
│  ├── Course Creator                              │
│  ├── Moderator                                   │
│  └── Script Manager (For automation)            │
└─────────────────────────────────────────────────┘
```

### 3.2 Manager (Sub-Admin)

```
┌─────────────────────────────────────────────────┐
│                   MANAGER                        │
├─────────────────────────────────────────────────┤
│  Assigned Native Roles:                          │
│  ├── Desk User (Desk access enabled)            │
│  ├── Accounts User (View financial data)        │
│  ├── Sales Manager (Manage sales team)          │
│  ├── Projects Manager (Manage projects)         │
│  ├── Course Creator (Manage LMS content)        │
│  ├── Moderator (Manage community)               │
│  ├── Support Team (Handle support)              │
│  ├── Report Manager (Run reports)               │
│  └── Inbox User (Email access)                  │
├─────────────────────────────────────────────────┤
│  BLOCKED:                                        │
│  ├── System Manager ❌                           │
│  ├── Administrator ❌                            │
│  ├── Script Manager ❌                           │
│  └── Workspace Manager ❌                        │
└─────────────────────────────────────────────────┘
```

### 3.3 Sales (Employee)

```
┌─────────────────────────────────────────────────┐
│                    SALES                         │
├─────────────────────────────────────────────────┤
│  Assigned Native Roles:                          │
│  ├── Desk User (Desk access enabled)            │
│  ├── Sales User (CRM access)                    │
│  ├── Inbox User (Email access)                  │
│  ├── Projects User (View projects - ReadOnly)   │
│  └── Support Team (Create tickets)              │
├─────────────────────────────────────────────────┤
│  BLOCKED:                                        │
│  ├── Accounts User ❌ (No financial data)       │
│  ├── Course Creator ❌ (No LMS access)          │
│  ├── Website Manager ❌                          │
│  ├── System Manager ❌                           │
│  └── All Manager roles ❌                        │
└─────────────────────────────────────────────────┘
```

### 3.4 Customer (Member)

```
┌─────────────────────────────────────────────────┐
│                   CUSTOMER                       │
├─────────────────────────────────────────────────┤
│  Assigned Native Roles:                          │
│  ├── LMS Student (Course access via Portal)    │
│  └── Customer (Portal access)                   │
├─────────────────────────────────────────────────┤
│  BLOCKED:                                        │
│  ├── Desk User ❌ (NO backend access)           │
│  ├── ALL other roles ❌                          │
├─────────────────────────────────────────────────┤
│  ACCESS METHOD: Portal Only (/portal)           │
│  ├── /portal/courses                             │
│  ├── /portal/community                           │
│  └── /portal/support                             │
└─────────────────────────────────────────────────┘
```

### 3.5 AI Agent

```
┌─────────────────────────────────────────────────┐
│                   AI AGENT                       │
├─────────────────────────────────────────────────┤
│  Assigned Native Roles:                          │
│  ├── Sales User (Create leads, customers)       │
│  ├── Accounts User (Create invoices)            │
│  ├── Projects User (Create projects)            │
│  └── LMS Student (Create enrollments via API)   │
├─────────────────────────────────────────────────┤
│  BLOCKED:                                        │
│  ├── Desk User ❌ (API only, no UI)             │
│  ├── System Manager ❌                           │
│  ├── Delete permissions ❌                       │
├─────────────────────────────────────────────────┤
│  ACCESS METHOD: API Only (Token Auth)           │
│  Used by: MCP Server, Stripe Webhooks           │
└─────────────────────────────────────────────────┘
```

---

## 4. Workspace Visibility Matrix

**Current State**: All 21 workspaces are PUBLIC (visible to everyone with Desk access).

**Target State**: Each role sees ONLY their whitelisted workspaces.

| Workspace | Owner | Manager | Sales | Customer | AI |
|-----------|:-----:|:-------:|:-----:|:--------:|:--:|
| **Home** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Accounting** | ✅ | ✅ (View) | ❌ | ❌ | ❌ |
| **Financial Reports** | ✅ | ✅ (View) | ❌ | ❌ | ❌ |
| **CRM** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Frappe CRM** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Selling** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **LMS** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Projects** | ✅ | ✅ | ✅ (View) | ❌ | ❌ |
| **Support** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Website** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Users** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Build** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Integrations** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **ERPNext Settings** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Assets** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Buying** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Stock** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Manufacturing** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Subcontracting** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Quality** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Welcome Workspace** | ❌ | ❌ | ❌ | ❌ | ❌ |

### Implementation Method

Workspaces are controlled via:
1. **Module Profile** - Block entire modules from users
2. **Workspace `roles` field** - Restrict workspace to specific roles

---

## 5. Module Access Matrix

**Module Profiles** determine which modules a user can access. This is the primary way to hide workspaces.

| Module | Owner | Manager | Sales | Customer | AI |
|--------|:-----:|:-------:|:-----:|:--------:|:--:|
| Accounts | ✅ | ✅ | ❌ | ❌ | ✅ |
| CRM | ✅ | ✅ | ✅ | ❌ | ✅ |
| FCRM | ✅ | ✅ | ✅ | ❌ | ✅ |
| LMS | ✅ | ✅ | ❌ | ✅ (Portal) | ✅ |
| Projects | ✅ | ✅ | ✅ | ❌ | ✅ |
| Support | ✅ | ✅ | ✅ | ✅ (Portal) | ✅ |
| Website | ✅ | ✅ | ❌ | ❌ | ❌ |
| Selling | ✅ | ✅ | ❌ | ❌ | ✅ |
| Setup | ✅ | ❌ | ❌ | ❌ | ❌ |
| Core | ✅ | ❌ | ❌ | ❌ | ❌ |
| Integrations | ✅ | ❌ | ❌ | ❌ | ❌ |
| Assets | ❌ | ❌ | ❌ | ❌ | ❌ |
| Buying | ❌ | ❌ | ❌ | ❌ | ❌ |
| Stock | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manufacturing | ❌ | ❌ | ❌ | ❌ | ❌ |
| Subcontracting | ❌ | ❌ | ❌ | ❌ | ❌ |
| Quality Management | ❌ | ❌ | ❌ | ❌ | ❌ |
| HR | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 6. DocType Permission Matrix

### 6.1 CRM DocTypes

| DocType | Owner | Manager | Sales | Customer | AI |
|---------|:-----:|:-------:|:-----:|:--------:|:--:|
| **CRM Lead** | RWCD | RWCD | RWC | ❌ | RWC |
| **CRM Deal** | RWCD | RWCD | RWC | ❌ | RWC |
| **CRM Organization** | RWCD | RWCD | RW | ❌ | RWC |
| **CRM Lead Status** | RWCD | R | ❌ | ❌ | ❌ |
| **CRM Lead Source** | RWCD | R | ❌ | ❌ | ❌ |

**Legend**: R=Read, W=Write, C=Create, D=Delete

### 6.2 Sales DocTypes

| DocType | Owner | Manager | Sales | Customer | AI |
|---------|:-----:|:-------:|:-----:|:--------:|:--:|
| **Customer** | RWCD | RWCD | R | Own | RWC |
| **Sales Invoice** | RWCD | R | ❌ | Own | RWC |
| **Sales Order** | RWCD | RWCD | R | ❌ | RWC |
| **Item** | RWCD | R | ❌ | ❌ | R |

### 6.3 LMS DocTypes

| DocType | Owner | Manager | Sales | Customer | AI |
|---------|:-----:|:-------:|:-----:|:--------:|:--:|
| **LMS Program** | RWCD | RWCD | ❌ | R (enrolled) | R |
| **LMS Course** | RWCD | RWCD | ❌ | R (enrolled) | R |
| **LMS Enrollment** | RWCD | RWCD | ❌ | Own | RWC |
| **LMS Discussion Topic** | RWCD | RWCD | ❌ | RWC (own) | ❌ |
| **LMS Discussion Reply** | RWCD | RWCD | ❌ | RWC (own) | ❌ |

### 6.4 Projects DocTypes

| DocType | Owner | Manager | Sales | Customer | AI |
|---------|:-----:|:-------:|:-----:|:--------:|:--:|
| **Project** | RWCD | RWCD | R | ❌ | RWC |
| **Task** | RWCD | RWCD | R | ❌ | RWC |

### 6.5 Support DocTypes

| DocType | Owner | Manager | Sales | Customer | AI |
|---------|:-----:|:-------:|:-----:|:--------:|:--:|
| **Issue** | RWCD | RWCD | RWC | RWC (own) | RWC |

### 6.6 System DocTypes (Restricted)

| DocType | Owner | Manager | Sales | Customer | AI |
|---------|:-----:|:-------:|:-----:|:--------:|:--:|
| **User** | RWCD | ❌ | ❌ | ❌ | ❌ |
| **Role** | RWCD | ❌ | ❌ | ❌ | ❌ |
| **System Settings** | RWCD | ❌ | ❌ | ❌ | ❌ |
| **Email Account** | RWCD | ❌ | ❌ | ❌ | ❌ |

---

## 7. LMS Program Access Control

### 7.1 Existing Programs

| Program | Tier | Price Point |
|---------|------|-------------|
| **Launchpad Program** | Entry | $99/mo or $499/yr |
| **Director Program** | Growth | $349/mo or $2,388/yr |
| **CEO Program** | Premium | $1,497/mo or $11,976/yr |

### 7.2 Access Logic

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       LMS ACCESS CONTROL FLOW                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   Customer purchases Tier ──▶ Stripe Webhook fires                      │
│                                      │                                   │
│                                      ▼                                   │
│                           ┌──────────────────┐                          │
│                           │ Create/Find User │                          │
│                           │ Assign: LMS      │                          │
│                           │ Student Role     │                          │
│                           └────────┬─────────┘                          │
│                                    │                                     │
│                                    ▼                                     │
│                           ┌──────────────────┐                          │
│                           │ Create LMS       │                          │
│                           │ Enrollment for   │                          │
│                           │ purchased Program│                          │
│                           └────────┬─────────┘                          │
│                                    │                                     │
│                                    ▼                                     │
│                           ┌──────────────────┐                          │
│                           │ User logs in to  │                          │
│                           │ /portal          │                          │
│                           │ Sees ONLY their  │                          │
│                           │ enrolled Program │                          │
│                           └──────────────────┘                          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.3 Content Visibility Rules

- **LMS Student role** grants access to `/portal` and LMS frontend
- **LMS Enrollment** record determines which Programs appear
- A user sees ONLY the Programs/Courses they are enrolled in
- Higher tiers do NOT automatically include lower tiers (unless explicitly enrolled)

### 7.4 Tier Upgrade Handling

When a customer upgrades (e.g., Launchpad → Director):
1. Create NEW LMS Enrollment for Director Program
2. Keep existing Launchpad Enrollment (or remove if desired)
3. Customer now sees both Programs in their Portal

---

## 8. Portal vs Desk Access

### 8.1 Access Methods

| User Type | Desk (Backend) | Portal (Frontend) | API |
|-----------|:--------------:|:-----------------:|:---:|
| Owner | ✅ `portal.childcarebusinessplan.com/app` | ✅ | ✅ |
| Manager | ✅ `/app` | ✅ | ❌ |
| Sales | ✅ `/app` | ❌ | ❌ |
| Customer | ❌ **BLOCKED** | ✅ `/portal` | ❌ |
| AI Agent | ❌ | ❌ | ✅ Token |

### 8.2 Portal Routes (Customer Access)

| Route | Purpose | Access |
|-------|---------|--------|
| `/portal` | Dashboard | All customers |
| `/portal/courses` | View enrolled courses | All customers |
| `/lms/course/{course}` | Take course | If enrolled |
| `/lms/program/{program}` | View program | If enrolled |
| `/portal/tickets` | Support tickets | All customers (own only) |
| `/community` | Discussion forum | All customers |

### 8.3 Desk Routes (Staff Access)

| Route | Purpose | Access |
|-------|---------|--------|
| `/app` | Main desk | Owner, Manager, Sales |
| `/app/crm-lead` | CRM Leads | Owner, Manager, Sales |
| `/app/project` | Projects | Owner, Manager, Sales (view) |
| `/app/lms-program` | Manage LMS | Owner, Manager |
| `/app/sales-invoice` | Invoices | Owner, Manager (view) |
| `/app/user` | User management | Owner ONLY |
| `/app/system-settings` | System config | Owner ONLY |

---

## 9. Implementation Checklist

### Phase 1: Module Profiles

Create Module Profiles to block access to irrelevant modules.

- [ ] Create `Manager Module Profile`
  - Block: Setup, Core, Integrations, Assets, Buying, Stock, Manufacturing, Subcontracting, Quality Management, HR
  - Allow: CRM, FCRM, LMS, Projects, Support, Website, Accounts, Selling

- [ ] Create `Sales Module Profile`
  - Block: Setup, Core, Integrations, Assets, Buying, Stock, Manufacturing, Subcontracting, Quality Management, HR, Accounts, LMS, Website
  - Allow: CRM, FCRM, Projects, Support

- [ ] Create `Customer Module Profile`
  - Block: Everything except LMS, Support
  - Note: Customers have `desk_access=0` so this is secondary protection

- [ ] Create `AI Module Profile`
  - Block: All UI modules
  - Allow API access to: CRM, Selling, LMS, Projects, Support

### Phase 2: Role Profile Configuration

- [ ] Create `Manager Role Profile`
  - Assign roles: Desk User, Accounts User, Sales Manager, Projects Manager, Course Creator, Moderator, Support Team, Report Manager, Inbox User
  
- [ ] Create `Sales Role Profile`
  - Assign roles: Desk User, Sales User, Inbox User, Projects User, Support Team

- [ ] Create `Customer Role Profile`
  - Assign roles: LMS Student, Customer
  - Ensure `desk_access=0`

- [ ] Create `AI Role Profile`
  - Assign roles: Sales User, Accounts User, Projects User
  - No Desk User (API only)

### Phase 3: User Permission Rules

- [ ] Configure Sales User to see only their own Leads (if_owner)
- [ ] Configure Customer to see only their own records
- [ ] Configure Projects User to be read-only for Sales role

### Phase 4: Workspace Restrictions

For each workspace, set the `roles` field to restrict visibility:

- [ ] **Users** workspace: Restrict to `System Manager`
- [ ] **Build** workspace: Restrict to `System Manager`
- [ ] **Integrations** workspace: Restrict to `System Manager`
- [ ] **ERPNext Settings** workspace: Restrict to `System Manager`
- [ ] **Accounting** workspace: Restrict to `Accounts User`, `Accounts Manager`
- [ ] **Financial Reports** workspace: Restrict to `Accounts User`, `Accounts Manager`
- [ ] **Assets** workspace: DISABLE (not used)
- [ ] **Buying** workspace: DISABLE (not used)
- [ ] **Stock** workspace: DISABLE (not used)
- [ ] **Manufacturing** workspace: DISABLE (not used)
- [ ] **Subcontracting** workspace: DISABLE (not used)
- [ ] **Quality** workspace: DISABLE (not used)

### Phase 5: DocType Permission Audit

Using Role Permission Manager:

- [ ] Verify CRM Lead permissions match matrix
- [ ] Verify Customer permissions (read own only)
- [ ] Verify LMS permissions (enrollment-based)
- [ ] Remove delete permissions from non-owner roles
- [ ] Add Projects User read-only permission for Sales

### Phase 6: Portal Configuration

- [ ] Verify `/portal` route is accessible to LMS Student
- [ ] Configure portal settings for customer access
- [ ] Test that Desk is blocked for Customer role

### Phase 7: AI/API User Setup

- [ ] Create API user account
- [ ] Generate API Key and Secret
- [ ] Assign AI Role Profile
- [ ] Test MCP connectivity
- [ ] Configure webhook handler

---

## 10. Visualization Diagrams

### 10.1 System Access Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SYSTEM ACCESS ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                           ┌─────────────┐                                   │
│                           │   OWNER     │                                   │
│                           │ (You)       │                                   │
│                           └──────┬──────┘                                   │
│                                  │                                          │
│                    ┌─────────────┼─────────────┐                            │
│                    │             │             │                            │
│                    ▼             ▼             ▼                            │
│             ┌──────────┐  ┌──────────┐  ┌──────────┐                       │
│             │ MANAGER  │  │  SALES   │  │ AI AGENT │                       │
│             │ (Staff)  │  │ (Staff)  │  │ (API)    │                       │
│             └────┬─────┘  └────┬─────┘  └────┬─────┘                       │
│                  │             │             │                              │
│                  │             │             │                              │
│     ┌────────────┴─────────────┴─────────────┴────────────┐                │
│     │                                                      │                │
│     │                  DESK (Backend)                      │                │
│     │              /app - ERPNext UI                       │                │
│     │                                                      │                │
│     │   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │                │
│     │   │   CRM   │ │Projects │ │   LMS   │ │Accounts │   │                │
│     │   └─────────┘ └─────────┘ └─────────┘ └─────────┘   │                │
│     │                                                      │                │
│     └──────────────────────────────────────────────────────┘                │
│                                                                              │
│                                  │                                          │
│                                  │ LMS Content                              │
│                                  ▼                                          │
│     ┌──────────────────────────────────────────────────────┐                │
│     │                                                      │                │
│     │                  PORTAL (Frontend)                   │                │
│     │              /portal - Customer UI                   │                │
│     │                                                      │                │
│     │   ┌─────────┐ ┌─────────┐ ┌─────────┐               │                │
│     │   │ Courses │ │Community│ │ Support │               │                │
│     │   └─────────┘ └─────────┘ └─────────┘               │                │
│     │                                                      │                │
│     └──────────────────────────▲───────────────────────────┘                │
│                                │                                            │
│                           ┌────┴────┐                                       │
│                           │CUSTOMER │                                       │
│                           │(Member) │                                       │
│                           └─────────┘                                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 10.2 Workspace Visibility by Role

```
┌───────────────────────────────────────────────────────────────────────────┐
│                    WORKSPACE VISIBILITY MATRIX                             │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│   OWNER VIEW (Full Access)                                                 │
│   ┌─────────────────────────────────────────────────────────────────┐     │
│   │ Home │ CRM │ Frappe CRM │ LMS │ Projects │ Support │ Accounting │     │
│   │ Website │ Users │ Build │ Integrations │ Settings │ Selling    │     │
│   └─────────────────────────────────────────────────────────────────┘     │
│                                                                            │
│   MANAGER VIEW                                                             │
│   ┌─────────────────────────────────────────────────────────────────┐     │
│   │ Home │ CRM │ Frappe CRM │ LMS │ Projects │ Support │Accounting* │     │
│   │ Website │ Selling │                                              │     │
│   └─────────────────────────────────────────────────────────────────┘     │
│   * View Only                                                              │
│                                                                            │
│   SALES VIEW                                                               │
│   ┌─────────────────────────────────────────────────────────────────┐     │
│   │ Home │ CRM │ Frappe CRM │ Projects* │ Support │                 │     │
│   └─────────────────────────────────────────────────────────────────┘     │
│   * View Only                                                              │
│                                                                            │
│   CUSTOMER VIEW (Portal Only - No Desk)                                    │
│   ┌─────────────────────────────────────────────────────────────────┐     │
│   │               NO DESK ACCESS - PORTAL ONLY                       │     │
│   │                                                                   │     │
│   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │     │
│   │   │ My Courses  │  │  Community  │  │   Support   │             │     │
│   │   │ (Enrolled)  │  │  (Forums)   │  │  (Tickets)  │             │     │
│   │   └─────────────┘  └─────────────┘  └─────────────┘             │     │
│   └─────────────────────────────────────────────────────────────────┘     │
│                                                                            │
└───────────────────────────────────────────────────────────────────────────┘
```

### 10.3 LMS Tier Access

```
┌───────────────────────────────────────────────────────────────────────────┐
│                        LMS PROGRAM ACCESS                                  │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│   LAUNCHPAD CUSTOMER ($99/mo)                                              │
│   ┌─────────────────────────────────────────────────────────┐             │
│   │  ✅ Launchpad Program                                    │             │
│   │     ├── Startup Course 1                                 │             │
│   │     ├── Startup Course 2                                 │             │
│   │     └── Startup Course 3                                 │             │
│   │  ❌ Director Program (Not enrolled)                      │             │
│   │  ❌ CEO Program (Not enrolled)                           │             │
│   └─────────────────────────────────────────────────────────┘             │
│                                                                            │
│   DIRECTOR CUSTOMER ($349/mo)                                              │
│   ┌─────────────────────────────────────────────────────────┐             │
│   │  ✅ Director Program                                     │             │
│   │     ├── Growth Course 1                                  │             │
│   │     ├── Growth Course 2                                  │             │
│   │     └── Growth Course 3                                  │             │
│   │  ❔ Launchpad Program (Optional add-on)                  │             │
│   │  ❌ CEO Program (Not enrolled)                           │             │
│   └─────────────────────────────────────────────────────────┘             │
│                                                                            │
│   CEO CUSTOMER ($1,497/mo)                                                 │
│   ┌─────────────────────────────────────────────────────────┐             │
│   │  ✅ CEO Program                                          │             │
│   │     ├── Strategic Course 1                               │             │
│   │     ├── Mastermind Sessions                              │             │
│   │     └── Executive Resources                              │             │
│   │  ❔ Director Program (Optional add-on)                   │             │
│   │  ❔ Launchpad Program (Optional add-on)                  │             │
│   └─────────────────────────────────────────────────────────┘             │
│                                                                            │
│   NOTE: Tiers are INDEPENDENT. Purchasing CEO does NOT automatically      │
│   grant Director or Launchpad access. Each requires separate enrollment.   │
│   This enables upselling and allows customers to have exactly what they   │
│   purchased.                                                               │
│                                                                            │
└───────────────────────────────────────────────────────────────────────────┘
```

### 10.4 Data Flow for Customer Onboarding

```
┌───────────────────────────────────────────────────────────────────────────┐
│                    CUSTOMER ONBOARDING FLOW                                │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│   1. LEAD CAPTURE (Astro Frontend)                                         │
│   ┌──────────────────────────────────────────────────────────────────┐    │
│   │                                                                   │    │
│   │   User completes Quiz ──▶ Email captured ──▶ API: /capture-lead  │    │
│   │                                                   │               │    │
│   └───────────────────────────────────────────────────┼───────────────┘    │
│                                                       │                    │
│                                                       ▼                    │
│   2. CRM LEAD CREATED (AI Agent via API)                                   │
│   ┌──────────────────────────────────────────────────────────────────┐    │
│   │                                                                   │    │
│   │   CRM Lead record created with:                                   │    │
│   │   • email, funnel_segment, quiz_data, utm_source                  │    │
│   │   • Status: New                                                   │    │
│   │                                                                   │    │
│   └───────────────────────────────────────────────────────────────────┘    │
│                                                                            │
│   3. PURCHASE (Stripe Checkout)                                            │
│   ┌──────────────────────────────────────────────────────────────────┐    │
│   │                                                                   │    │
│   │   User clicks "Buy" ──▶ Stripe Checkout ──▶ Payment complete     │    │
│   │                                                   │               │    │
│   └───────────────────────────────────────────────────┼───────────────┘    │
│                                                       │                    │
│                                                       ▼                    │
│   4. WEBHOOK PROCESSING (AI Agent via Stripe Webhook)                      │
│   ┌──────────────────────────────────────────────────────────────────┐    │
│   │                                                                   │    │
│   │   checkout.session.completed webhook fires:                       │    │
│   │                                                                   │    │
│   │   a) Create/Find User ──▶ Assign: LMS Student, Customer roles    │    │
│   │                                                                   │    │
│   │   b) Create Customer record (if not exists)                       │    │
│   │                                                                   │    │
│   │   c) Create Sales Invoice ──▶ Mark as Paid                       │    │
│   │                                                                   │    │
│   │   d) Create LMS Enrollment ──▶ Link to purchased Program         │    │
│   │                                                                   │    │
│   │   e) Create Project ──▶ "New Client Onboarding" template         │    │
│   │                                                                   │    │
│   │   f) Send Welcome Email ──▶ Portal login instructions            │    │
│   │                                                                   │    │
│   └───────────────────────────────────────────────────────────────────┘    │
│                                                                            │
│   5. CUSTOMER ACCESS (Portal)                                              │
│   ┌──────────────────────────────────────────────────────────────────┐    │
│   │                                                                   │    │
│   │   Customer logs in at /portal                                     │    │
│   │   ├── Sees only their enrolled Program(s)                        │    │
│   │   ├── Can access courses within those Programs                   │    │
│   │   ├── Can participate in community                               │    │
│   │   └── Can create support tickets                                 │    │
│   │                                                                   │    │
│   │   ❌ CANNOT access /app (Desk)                                   │    │
│   │   ❌ CANNOT see other customers                                   │    │
│   │   ❌ CANNOT see unauthorized Programs/Courses                    │    │
│   │                                                                   │    │
│   └───────────────────────────────────────────────────────────────────┘    │
│                                                                            │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## Appendix A: Native Roles Reference

The following native Frappe/ERPNext roles are used in this system:

| Role | Desk Access | Purpose |
|------|:-----------:|---------|
| Administrator | ✅ | Super user, bypass all permissions |
| System Manager | ✅ | Full system configuration |
| Desk User | ✅ | Basic desk access |
| Accounts Manager | ✅ | Full accounting access |
| Accounts User | ✅ | Basic accounting access |
| Sales Manager | ✅ | Manage sales team and data |
| Sales User | ✅ | Basic CRM/Sales access |
| Projects Manager | ✅ | Full project management |
| Projects User | ✅ | Basic project access |
| Course Creator | ❌ | LMS content management |
| LMS Student | ❌ | LMS content consumption |
| Moderator | ✅ | Community moderation |
| Support Team | ✅ | Support ticket handling |
| Inbox User | ✅ | Email integration |
| Website Manager | ✅ | Website/CMS management |
| Report Manager | ✅ | Run and manage reports |
| Script Manager | ✅ | Server/Client scripts |
| Customer | ❌ | Portal access for customers |

---

## Appendix B: Key Implementation Notes

### B.1 Zero-Trust Enforcement Order

1. **Module Profile** blocks entire modules from user
2. **Role** determines default permissions for DocTypes
3. **User Permission** overrides to scope data (e.g., see only own records)
4. **Workspace roles** restricts workspace visibility

### B.2 Critical Security Rules

1. **System Manager role** = OWNER ONLY
2. **Administrator role** = OWNER ONLY  
3. **Script Manager role** = OWNER ONLY
4. **Workspace Manager role** = OWNER ONLY
5. **desk_access=0** for ALL customer roles
6. **Delete permission** = OWNER and MANAGER only (never Sales)
7. **User DocType** = OWNER ONLY

### B.3 Testing Each Role

After implementation, test each role by:

1. Creating a test user with ONLY that role profile
2. Logging in as that user
3. Verifying workspace visibility matches matrix
4. Verifying DocType access matches matrix
5. Verifying they CANNOT access blocked areas
6. For Customer: Verify Desk is completely blocked

---

*Document End*

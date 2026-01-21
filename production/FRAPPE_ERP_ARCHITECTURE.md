# Frappe Triple Stack Architecture Plan
**Project:** Child Care Business Plan
**System:** ERPNext + Frappe CRM + Frappe LMS
**Frontend:** Astro (Headless)

## 1. Executive Summary
This document defines the architecture for the "Business Operating System" powering the Child Care Business Plan. The goal is to automate the flow from **Lead Capture** (Frontend) -> **Sales** (Stripe) -> **Fulfillment** (LMS/Portal).

## 2. Lead Management (CRM)
**Source:** Astro Quiz Funnel -> `/api/capture-lead`
**Target:** ERPNext `Lead` DocType

### Data Mapping
| Frontend Data | ERPNext Field | Type | Note |
| :--- | :--- | :--- | :--- |
| `email` | `email_id` | Data | Primary Key / Dedup |
| `funnelType` | `funnel_type` | Select | "Startup" or "Growth" |
| `quizData.capacity` | `quiz_capacity` | Int | Custom Field |
| `quizData.revenue` | `quiz_revenue_potential` | Currency | Custom Field |
| `utm_source` | `utm_source` | Data | Standard Field |

### Automation
- **Trigger:** New Lead Creation
- **Action:** Send "Welcome Email" via Postmark (Template based on `funnel_type`).
- **Logic:** If `funnel_type` == "Startup", route to "Startup Pipeline".

## 3. Product Catalog (ERPNext)
The items sold via Stripe must exist as **Non-Stock Items** in ERPNext to generate invoices and trigger fulfillment.

### Item Structure
| Item Code | Item Name | Item Group | Rate | Subscription |
| :--- | :--- | :--- | :--- | :--- |
| `MEM-LAUNCH-M` | Launchpad (Monthly) | Memberships | $99 | Yes |
| `MEM-LAUNCH-Y` | Launchpad (Yearly) | Memberships | $499 | Yes |
| `MEM-DIR-M` | Director (Monthly) | Memberships | $349 | Yes |
| ... | ... | ... | ... | ... |

**Configuration:**
- **Product Bundle:** Yearly plans may bundle "Digital Assets" (e.g., Staff Toolkit).
- **Default Income Account:** Service Sales.

## 4. Sales & Fulfillment Flow
**Trigger:** Stripe Webhook (`checkout.session.completed`)

### Workflow:
1.  **Stripe** sends payload to Frappe Endpoint (`/api/method/stripe_integration.handle_checkout`).
2.  **Frappe** verifies signature.
3.  **Action:**
    *   Find/Create **Customer** based on Email.
    *   Create **Sales Invoice** (Status: Paid).
    *   Create **User** (if not exists) with role `Portal User`.
    *   **LMS Enrollment:** Create `LMS Enrollment` for the Program linked to the Item.

## 5. Portal & LMS (Fulfillment)
**Access:** Users login via `/portal` (Frappe provided) or SSO?
*Decision Needed: Are we using the standard Frappe LMS frontend or building a headless consumption experience in Astro?*

### Roles & Permissions
- **Guest:** Can view Landing Page.
- **Lead:** Captured in CRM, no portal access.
- **Customer (Launchpad):** Access to "Launchpad Program" (LMS).
- **Customer (Director):** Access to "Director Program" (LMS) + "Coaching Calls" (Calendar).

## 6. Implementation Stages
1.  **Baseline:** Verify Server & Apps.
2.  **Schema:** Create Custom Fields for Quiz Data.
3.  **Catalog:** Create Items in ERPNext.
4.  **Integration:** Build Stripe Webhook handler in Frappe (Server Script).
5.  **Testing:** End-to-end flow test (Quiz -> Pay -> Access).

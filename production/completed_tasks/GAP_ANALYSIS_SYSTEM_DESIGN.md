# Gap Analysis: SYSTEM_DESIGN.md

> **Reviewer**: Senior ERPNext Implementation Specialist
> **Document Reviewed**: SYSTEM_DESIGN.md
> **Date**: 2026-01-20
> **Verdict**: Design is conceptually sound but contains several technical gaps that will cause implementation failures if not addressed.

---

## Executive Summary

The SYSTEM_DESIGN.md provides a clear business-level view of the desired access control system. However, it makes several assumptions about Frappe/ERPNext behavior that are either incorrect or incomplete. This gap analysis identifies **12 critical issues** and **8 warnings** that must be resolved before implementation.

---

## Critical Issues (Will Cause Implementation Failure)

### ISSUE 1: Module Profile Assignment Mechanism

**What the document says:**
> "Create `Manager Module Profile`, `Sales Module Profile`, etc."

**The reality:**
Module Profiles are assigned **per-user**, not per-role. There is no automatic inheritance from Role Profile to Module Profile.

**Implication:**
Every time you create a new user, you must manually assign BOTH:
1. Role Profile (for permissions)
2. Module Profile (for workspace visibility)

**Resolution:**
Add to implementation checklist:
- [ ] When creating any user, assign BOTH Role Profile AND Module Profile
- [ ] Consider automating this via Server Script on User creation

**Severity:** 🔴 Critical

---

### ISSUE 2: Course Creator Role Has desk_access=0

**What the document says:**
> Manager is assigned `Course Creator` role to manage LMS content via Desk

**The reality:**
```
Course Creator: desk_access=0
```
The `Course Creator` role is designed for **portal-based** course creation, not Desk access. Frappe checks desk_access at the role level — if a user has ANY role with desk_access=1, they get Desk access.

**Implication:**
This will work because Manager also has `Desk User` which has desk_access=1. However, the native Course Creator permissions may not expose LMS management in the Desk UI as expected.

**Resolution:**
Verify that:
- [ ] `Desk User` role has the necessary LMS DocType permissions
- [ ] Or add `LMS Manager` role if it exists in your installation
- [ ] Test that LMS workspace is visible and functional for Manager

**Severity:** 🔴 Critical

---

### ISSUE 3: "Read-Only" Project Access for Sales

**What the document says:**
> Sales gets `Projects User` with (View) access

**The reality:**
Roles don't have a "view-only" mode. The `Projects User` role grants whatever permissions are defined in Role Permission Manager for that role. By default, Projects User has:
- Project: Read, Write, Create
- Task: Read, Write, Create

**Implication:**
Sales will be able to CREATE and MODIFY projects and tasks, not just view them.

**Resolution:**
Must implement via **Custom Permission Rules**:
1. Create a permission rule that removes Write/Create for `Projects User` on Project DocType
2. OR use Property Setter to make fields read-only
3. OR create a new role (breaks your "no custom roles" rule)

**Alternative approach:**
- Assign `Projects User` to Sales
- Use Role Permission Manager to modify `Projects User` permissions to Read-only for Project and Task
- WARNING: This affects ALL users with `Projects User` role

**Recommended approach:**
- Don't assign Projects User to Sales
- Use **User Permission** to grant specific read access to Projects they're linked to

**Severity:** 🔴 Critical

---

### ISSUE 4: AI Agent desk_access Assumption

**What the document says:**
> AI Agent has no Desk User role (API only)

**The reality:**
The `desk_access` flag controls browser-based login to `/app`. It does NOT affect API access. API authentication (Token or OAuth) bypasses desk_access entirely.

**Implication:**
This works as intended, but for the wrong reason. The AI user CAN access the API regardless of desk_access setting.

**Resolution:**
This is actually fine — just document it correctly:
- AI user's permissions are controlled by assigned roles
- desk_access=0 prevents someone from logging in via browser if they get the password
- API access is controlled by having a valid API Key

**Severity:** 🟡 Warning (works but misunderstood)

---

### ISSUE 5: Frappe CRM vs ERPNext CRM Confusion

**What the document says:**
> References both "CRM" workspace and "Frappe CRM" workspace
> References "CRM Lead" DocType

**The reality:**
You have TWO CRM systems installed:
1. **ERPNext CRM** (native) — Uses `Lead`, `Opportunity` DocTypes, lives in "CRM" workspace
2. **Frappe CRM** (crm app) — Uses `CRM Lead`, `CRM Deal` DocTypes, lives in "Frappe CRM" workspace

**Implication:**
The design references `CRM Lead` which is from Frappe CRM, but also references "CRM" workspace. These are DIFFERENT systems.

**Resolution:**
Decide which CRM to use:
- [ ] **Option A**: Use Frappe CRM only, disable/hide ERPNext CRM workspace
- [ ] **Option B**: Use ERPNext CRM only, disable/hide Frappe CRM workspace
- [ ] **Option C**: Use both (not recommended — confusing for users)

**Recommendation:** Use Frappe CRM (it's more modern and purpose-built for CRM). Update document to:
- Hide "CRM" workspace entirely
- Use "Frappe CRM" workspace for Sales and Manager
- Use `CRM Lead`, `CRM Deal`, `CRM Organization` DocTypes

**Severity:** 🔴 Critical

---

### ISSUE 6: Workspace Role Restriction Behavior

**What the document says:**
> Set workspace `roles` field to restrict visibility

**The reality:**
The workspace `roles` field works as a **whitelist**:
- If `roles` is empty → visible to ALL users with desk_access
- If `roles` contains specific roles → visible ONLY to users who have AT LEAST ONE of those roles

**Implication:**
If you set "Accounting" workspace to `roles: ["Accounts User", "Accounts Manager"]`, then:
- Owner (has Accounts Manager) → CAN see ✅
- Manager (has Accounts User) → CAN see ✅
- Sales (no accounts role) → CANNOT see ✅

This is correct, but there's a catch:

**Hidden issue:** Workspace restrictions only hide the sidebar entry. Users with the correct DocType permissions can still access records via URL or search.

**Resolution:**
- Workspace restrictions provide UI hiding, not security
- True security comes from DocType permissions
- Document this distinction clearly

**Severity:** 🟡 Warning

---

### ISSUE 7: LMS Enrollment-Based Access Control

**What the document says:**
> "A user sees ONLY the Programs/Courses they are enrolled in"

**The reality:**
LMS Enrollment controls what appears in the portal UI:
```
LMS Enrollment:
  - member (Link: User)
  - program (Link: LMS Program)  
```
When a user visits `/lms`, they see Programs they're enrolled in.

**BUT:**
- The portal route `/lms/program/{program}` may be accessible to anyone who knows the URL
- Access control depends on how Frappe LMS checks enrollment

**Resolution:**
- [ ] Test: Can a logged-in user access a Program URL they're NOT enrolled in?
- [ ] If yes, implement `has_permission` hook on LMS Program/Course
- [ ] If no, document that security is working correctly

**Severity:** 🟡 Warning (needs verification)

---

### ISSUE 8: Portal Route Accuracy

**What the document says:**
```
/portal - Dashboard
/portal/courses - View enrolled courses
/portal/tickets - Support tickets
/community - Discussion forum
```

**The reality:**
Frappe LMS and portal routes vary by version and configuration. The actual routes may be:
```
/lms - LMS Home
/lms/programs - Programs list
/lms/courses - Courses list
/lms/program/{program_name} - Specific program
/lms/course/{course_name} - Specific course
/support - Support (if enabled)
/me - User profile
```

**Resolution:**
- [ ] SSH into server and check actual route configuration
- [ ] Review `frappe.get_hooks("website_route_rules")` 
- [ ] Test each route and document the actual paths
- [ ] Update SYSTEM_DESIGN.md with verified routes

**Severity:** 🔴 Critical (wrong routes = broken user experience)

---

### ISSUE 9: Webhook Handler Not Defined

**What the document says:**
> "checkout.session.completed webhook fires → Create User, Customer, Invoice, Enrollment, Project, Email"

**The reality:**
This is a DESIGN concept, not an implementation. There is no webhook handler in the system currently. The diagram shows the flow but:
- Who handles the webhook? (Astro? Frappe?)
- What endpoint receives it?
- What code executes the 6 steps?

**Implication:**
This is the most critical automation in the system and it doesn't exist yet.

**Resolution:**
Two implementation options:

**Option A: Astro Webhook Handler (Current API architecture)**
```
/api/webhooks/stripe.ts → 
  Receives Stripe webhook →
  Calls Frappe API to create records
```
Pros: Consistent with existing Astro API structure
Cons: Double-hop (Stripe → Astro → Frappe)

**Option B: Frappe Server Script**
```
Stripe → /api/method/your_app.handle_stripe_webhook →
  Server Script in Frappe creates all records
```
Pros: Direct, atomic, in-system
Cons: Requires custom app or script permissions

**Recommendation:** Option A for now (simpler), migrate to Option B later

- [ ] Create `/api/webhooks/stripe.ts` endpoint
- [ ] Implement the 6-step onboarding logic
- [ ] Test end-to-end flow

**Severity:** 🔴 Critical

---

### ISSUE 10: Email Automation Not Specified

**What the document says:**
> "Send Welcome Email" (in onboarding flow)

**The reality:**
Frappe has email capabilities but:
- Email Account must be configured (SMTP)
- Email Template must exist
- `frappe.sendmail()` must be called by code

The document doesn't specify:
- Which email provider?
- What triggers the email?
- What template?

**Resolution:**
- [ ] Configure Email Account in Frappe (or use external like Postmark)
- [ ] Create "Welcome - New Customer" Email Template
- [ ] Add email send step to webhook handler
- [ ] Document the email infrastructure in SYSTEM_DESIGN.md

**Severity:** 🟡 Warning

---

### ISSUE 11: Support Ticket Creation for Customers

**What the document says:**
> Customer can create Issues via portal (RWC own)

**The reality:**
The `Issue` DocType (HD Ticket in newer versions) needs:
1. Web Form or Portal Page to be accessible
2. `Customer` or `LMS Student` role must have Create permission on Issue
3. Permission must include `if_owner=1` for "see own only"

Default ERPNext does NOT give Customer role permission to create Issues.

**Resolution:**
- [ ] Check if Issue permissions exist for Customer/LMS Student role
- [ ] If not, add via Role Permission Manager:
  - DocType: Issue
  - Role: LMS Student
  - Permissions: Read, Write, Create
  - Apply User Permissions: Yes (if_owner behavior)
- [ ] Verify portal route for support ticket submission

**Severity:** 🔴 Critical

---

### ISSUE 12: Discussion Forum Permissions

**What the document says:**
> Customer can access /community for Discussion forum
> LMS Discussion Topic/Reply: RWC (own)

**The reality:**
LMS Discussion requires:
1. `LMS Student` to have Create/Write on `LMS Discussion Topic`
2. `LMS Student` to have Create/Write on `LMS Discussion Reply`

This is likely NOT configured by default.

**Resolution:**
- [ ] Check existing permissions for LMS Discussion Topic
- [ ] Check existing permissions for LMS Discussion Reply
- [ ] Add missing permissions via Role Permission Manager

**Severity:** 🔴 Critical

---

## Warnings (Won't Break But Needs Attention)

### WARNING 1: Role Profile vs Direct Role Assignment

The design specifies Role Profiles, but users can also have roles assigned directly AND via Role Profile. This can cause confusion.

**Recommendation:**
- Always use Role Profiles for consistency
- Never assign roles directly to users (except Administrator)
- Document this policy

---

### WARNING 2: Projects for Every Customer

**What the document says:**
> Every customer gets a Project created

**Consideration:**
- At scale, this creates many Projects
- Is this sustainable? Do you have 100 customers? 1,000?
- Project templates must exist

**Recommendation:**
- Create "New Client Onboarding" Project Template first
- Consider if this is needed for all tiers or just higher tiers
- May need Project cleanup/archival strategy

---

### WARNING 3: Inbox User for Email

The design assigns `Inbox User` to Manager and Sales. This role requires:
- Email Account to be configured
- User must be linked to an Email Account or have access to a shared inbox

**Recommendation:**
- Verify Email Account setup before assigning this role
- Test that email send/receive works for each role

---

### WARNING 4: Financial Data "View Only" for Manager

The design says Manager can view Accounting but not modify. However:
- `Accounts User` role typically has Write permission
- Need to verify and possibly restrict via Role Permission Manager

**Recommendation:**
- Check Accounts User default permissions
- Remove Write/Create/Delete if only Read is desired

---

### WARNING 5: Deleting Unused Workspaces

The design marks several workspaces as "DISABLE (not used)":
- Assets, Buying, Stock, Manufacturing, etc.

**Implementation options:**
1. Delete the workspaces (may return on update)
2. Set `roles` to a non-existent role (hacky)
3. Create `Blocked` role and set workspaces to that role (cleanest)

**Recommendation:**
Option 3 — Create a `Blocked` role with no permissions, assign unused workspaces to it

---

### WARNING 6: User Permission Data Isolation

The design mentions "see own records only" for Sales leads. This requires:
- User Permission on Lead DocType
- `Apply User Permissions` checked in Role Permission Manager
- Understanding that this is per-DocType, not global

**Recommendation:**
- Document exactly which DocTypes need data isolation
- Currently implied but not explicit for: Lead, Project, Issue, LMS Enrollment

---

### WARNING 7: Testing Strategy

The design mentions "test each role" but doesn't specify how to create test users.

**Recommendation:**
Create 4 test users during implementation:
- `test.manager@example.com` → Manager Role Profile
- `test.sales@example.com` → Sales Role Profile
- `test.customer@example.com` → Customer Role Profile
- `test.ai@example.com` → AI Role Profile + API Key

---

### WARNING 8: LMS Program Independence

The design says tiers are independent (CEO doesn't include Director). This is a business decision, not a technical one.

**Consideration:**
- This may confuse customers who expect "higher tier = all content"
- Requires clear communication during sales process
- OR change design to make tiers cumulative

---

## Summary: Required Actions Before Implementation

### Must Fix (Blocking):
1. ❌ Decide: Frappe CRM or ERPNext CRM (not both)
2. ❌ Resolve Projects User read-only requirement
3. ❌ Verify actual portal routes on server
4. ❌ Design webhook handler implementation
5. ❌ Add Issue permissions for LMS Student
6. ❌ Add LMS Discussion permissions for LMS Student
7. ❌ Verify Course Creator behavior with Desk User

### Should Fix (Important):
8. ⚠️ Document Module Profile assignment process
9. ⚠️ Create "Blocked" role for unused workspaces
10. ⚠️ Verify Accounts User is read-only for Manager
11. ⚠️ Define email infrastructure
12. ⚠️ Create Project Template for onboarding

### Nice to Have:
13. 💡 Create test users for each role
14. 💡 Document workspace hiding vs security distinction
15. 💡 Add cleanup/archival strategy for Projects

---

## Updated Implementation Order

Based on this analysis, the recommended implementation order is:

### Phase 0: Decisions (Before ANY Implementation)
- [ ] **DECISION**: Use Frappe CRM only, hide ERPNext CRM workspace
- [ ] **DECISION**: How to handle Projects read-only for Sales
- [ ] **DECISION**: Tier independence or cumulative access

### Phase 1: Verification (30 mins)
- [ ] SSH into server, verify portal routes
- [ ] Check LMS Student default permissions
- [ ] Check Issue creation for Customer role
- [ ] Check LMS Discussion permissions

### Phase 2: Foundation (1 hour)
- [ ] Create "Blocked" role for unused workspaces
- [ ] Disable unused workspaces (set roles to Blocked)
- [ ] Configure Email Account (if not done)
- [ ] Create Project Template "New Client Onboarding"

### Phase 3: Role Profiles (2 hours)
- [ ] Create Manager Role Profile with correct roles
- [ ] Create Sales Role Profile with correct roles  
- [ ] Create Customer Role Profile with correct roles
- [ ] Create AI Role Profile with correct roles

### Phase 4: Module Profiles (1 hour)
- [ ] Create Manager Module Profile
- [ ] Create Sales Module Profile
- [ ] Create Customer Module Profile
- [ ] Create AI Module Profile

### Phase 5: Permission Tuning (2 hours)
- [ ] Add Issue permissions for LMS Student
- [ ] Add LMS Discussion permissions for LMS Student
- [ ] Restrict Accounts User Write permissions (for Manager view-only)
- [ ] Configure User Permissions for data isolation

### Phase 6: Workspace Restrictions (1 hour)
- [ ] Set roles field on each workspace per matrix
- [ ] Test visibility for each role profile

### Phase 7: API/Automation (3 hours)
- [ ] Create API user with AI Role Profile
- [ ] Generate API Key/Secret
- [ ] Update MCP configuration
- [ ] Create Stripe webhook handler
- [ ] Test end-to-end onboarding flow

### Phase 8: Testing (2 hours)
- [ ] Create test user for each role
- [ ] Login as each role, verify access
- [ ] Document any discrepancies
- [ ] Fix issues found

**Total Estimated Time: 12-14 hours**

---

*Analysis Complete*

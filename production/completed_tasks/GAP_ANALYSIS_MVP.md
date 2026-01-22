# Gap Analysis: Launch-Ready MVP Operating System

**Objective:** Audit the current "Production Blueprint" against the requirements for a fully functional, automated consulting and membership launch.

---

## 1. Functional Gaps (The Missing Pieces)

### 1.1 The "Blind Sales" Gap
- **Finding:** Currently, the `Sales User` role is strictly limited to the CRM module. 
- **The Issue:** In a consulting model, the "Sale" doesn't end at the payment. Your Sales Reps need to see the **Project** status to handle client check-ins.
- **Requirement:** Enable "Read" access for `Sales User` on the **Project** and **Task** DocTypes.

### 1.2 The "Silent Rep" Gap
- **Finding:** I omitted the **`Inbox User`** role from the staff requirements.
- **The Issue:** Without this role, your staff cannot send or receive emails through the CRM. The "Email" buttons will essentially be disabled or broken for them.
- **Requirement:** Every staff member (Sales/Content) must be assigned the native **`Inbox User`** role.

### 1.3 The "Dead Community" Gap
- **Finding:** `LMS Student` permissions for **`LMS Discussion Topic`** and **`LMS Discussion Reply`** are not explicitly handled.
- **The Issue:** A membership without a forum is just a video player. Students need to be able to *Create* topics and *Reply* to others.
- **Requirement:** Explicitly enable `Create` and `Write` for `LMS Student` on Discussion DocTypes.

---

## 2. Security Gaps (The "Redundant" Risk)

### 2.1 The "Global Desk" Risk
- **Finding:** While I hid Workspaces, I haven't verified if standard roles (like `Sales User`) can still "Search" for protected data like your **Bank Accounts** or **Taxes**.
- **Requirement:** Perform a "Role Permission Reset" to ensure that `Sales User` can ONLY access the whitelist.

### 2.2 The "Support" Disconnect
- **Finding:** `Issue` (Support tickets) is mapped to the `Support Team` role, but your **Customers** need to be able to *Create* them from the portal.
- **Requirement:** Map `LMS Student` to `Issue` with `Create` permission (Owner-only).

---

## 3. Automation Gaps (The "Last Mile")

### 3.1 Project Initiation
- **Finding:** The plan handles "Payment -> Course Enrollment", but skips "Payment -> Project Creation".
- **The Issue:** If a client buys a $5k "Center Launch" package, you shouldn't have to manually create the project.
- **Requirement:** Update the Astro Webhook logic to create a **Project** (from a template) upon high-tier success.

---

## 4. Final MVP "Enablement" Chart (Corrected)

| User Type | Required Native Roles | Key Functional Access |
| :--- | :--- | :--- |
| **Owner** | `System Manager`, `Administrator` | Everything. |
| **Sales Staff** | `Sales User`, `Inbox User`, `Projects User` (ReadOnly) | Leads, Email, Project Tracking. |
| **Content Staff**| `Course Creator`, `Website Manager`, `Moderator` | Courses, CMS, Forum Moderation. |
| **Members** | `LMS Student` | Portal, Courses, Forums, Support Tickets. |

---

## 5. Summary Verdict
The previous plan was a "Clean View" but a "Broken System." To launch, we need to activate the **Communication** (Inbox) and **Collaborative** (Project/Forum) layers.

**Shall I update the Blueprint to include these 4 mission-critical roles (Inbox User, Projects User, Moderator), and then show you the specific permission flags for each?**

# Frappe/ERPNext Guide for AI Agents

## Core Philosophy: Schema-First Thinking

**THE RULE:** Always query schema BEFORE attempting to create/modify records.

### Schema-First Workflow
```
1. get_doctype_fields("DocType Name")
2. Read field types, required fields, options
3. Check for Link fields → Query those DocTypes
4. Construct data with exact field names
5. Create/update document
```

**Why?** Frappe validates everything. Wrong field name = 417 error. Missing required field = 400 error. Invalid Link value = LinkValidationError.

---

## Understanding Frappe's Architecture

### DocTypes are Metadata
- DocTypes define data structure (like database tables)
- Fields are defined in JSON, not code
- Everything is configurable via UI or API

### Link Fields = Foreign Keys
```
Field: "customer"
Type: "Link"
Options: "Customer"
→ Value must be a valid Customer.name
```

**CRITICAL:** If field type is Link, you MUST:
1. Query the linked DocType to see what records exist
2. Use exact name of existing record
3. Never guess or invent values

### Common Link Field Mistakes
❌ `{"customer": "John Doe"}` - unless "John Doe" exists  
✅ `{"customer": "CUST-2026-00001"}` - actual Customer.name

---

## Master Data Pattern

Frappe has master DocTypes that store reference data:

**Examples:**
- Lead Source (where leads come from)
- Item (products/services you sell)
- Customer Group (customer categories)
- Project Template (reusable project structures)

**Before using:** Verify record exists
```javascript
// Check if Lead Source "Website" exists
get_documents("CRM Lead Source")
// If not found, create it first
create_document("CRM Lead Source", {source_name: "Website"})
```

---

## Error Codes Decoded

### 417 - Expectation Failed
**Meaning:** You sent invalid data (wrong field name, wrong type, invalid Link)  
**Fix:** Check schema, verify field names match exactly

### 500 - Internal Server Error
**Meaning:** Server-side validation failed (Python code rejected it)  
**Fix:** Check required fields, missing child tables, or business logic constraints

### 404 - Not Found
**Meaning:** DocType doesn't exist  
**Fix:** Typo in DocType name, or module not installed

### 403 - Forbidden
**Meaning:** API user lacks permissions  
**Fix:** Check role assignments for API user

---

## Custom Fields

To add fields to standard DocTypes, create Custom Field:

```javascript
create_document("Custom Field", {
  dt: "Lead",                    // Target DocType
  fieldname: "quiz_score",       // Unique field name
  label: "Quiz Score",           // Display name
  fieldtype: "Int",              // Data type
  insert_after: "email_id"       // Position in form
})
```

**Field Types:**
- `Data` - Short text (140 chars)
- `Text` - Long text
- `Link` - Reference to another DocType
- `Select` - Dropdown (define options)
- `Int`, `Float`, `Currency` - Numbers
- `Date`, `Datetime` - Dates
- `Check` - Boolean (0/1)

---

## Working with Child Tables

Some DocTypes have child tables (one-to-many relationships):

**Example: Sales Invoice has Items**
```javascript
{
  "doctype": "Sales Invoice",
  "customer": "CUST-001",
  "items": [
    {
      "item_code": "PROD-001",
      "qty": 1,
      "rate": 99
    }
  ]
}
```

**Rule:** Child table records are embedded, not separate creates.

---

## Permissions System

### Roles
- LMS Student - Portal users (customers)
- Sales User - CRM access
- System Manager - Full admin

### Permission Levels
- Read (R)
- Write (W)  
- Create (C)
- Delete (D)
- if_owner - Only own records

**Check permissions:**
```javascript
get_doctype_fields("DocType Name")
// Look at perms in response
```

---

## Portal vs Desk

### Desk (`/app`)
- Admin interface
- Full ERPNext features
- Requires desk_access = 1

### Portal (`/lms`, `/portal`)
- Customer-facing
- Limited, curated views
- Website User type

**Customers should NEVER access Desk.** Only portal.

---

## LMS Structure

```
Program (e.g., "Launchpad Program")
  └─ Courses (e.g., "Business Foundations")
      └─ Lessons (e.g., "Legal Structure")
          └─ Content (HTML, videos, quizzes)
```

**Enrollment Flow:**
1. User purchases tier
2. Create LMS Enrollment linking User to Program
3. User sees enrolled programs in `/lms`
4. User can access courses/lessons

**IMPORTANT:** Programs need at least 1 course, or enrollment may fail.

---

## Common Pitfalls

### 1. Hardcoding IDs
❌ `price_launchpad_monthly` (friendly name)  
✅ `price_1Ss4VfJD1n5R7a8mlgezlXoS` (actual Stripe ID)

**Why?** Stripe generates random IDs. Your code must use actual IDs.

### 2. Assuming Fields Exist
❌ Sending `source: "Website"` without checking schema  
✅ Query schema, see it's a Link field, verify "Website" exists

### 3. Ignoring Errors
❌ Getting 417, trying different approaches randomly  
✅ Read error message, fix root cause (usually schema mismatch)

### 4. Creating Records Out of Order
❌ Create Sales Invoice before Customer exists  
✅ Create Customer first, then reference in invoice

---

## Debugging Checklist

**When something fails:**
1. Check schema: `get_doctype_fields("DocType")`
2. Identify Link fields
3. Query each linked DocType to verify records exist
4. Check field names match exactly (case-sensitive)
5. Verify required fields are provided
6. Check data types match (string vs number)

---

## API Best Practices

### Use Exact Field Names
```javascript
// From schema
{"fieldname": "email_id"}

// In your data - EXACT match
{"email_id": "test@example.com"}

// NOT:
{"email": "test@example.com"}  // ❌ Wrong field name
```

### Check Existing Records First
```javascript
// Don't blindly create - might be duplicate
const existing = await get_documents("Customer", {
  filters: {email_id: email}
});

if (!existing.length) {
  // Create new
} else {
  // Use existing
}
```

### Handle Duplicates Gracefully
Frappe returns error on duplicate email/unique fields. Catch and handle:
```javascript
try {
  create_document("User", {email: ...});
} catch (e) {
  if (e.message.includes("DuplicateEntryError")) {
    // User exists, fetch and use
  }
}
```

---

## Integration Patterns

### Webhook → ERPNext Flow
1. Receive webhook (Stripe, form submit, etc.)
2. Extract data
3. Create/update records in order:
   - User (if new)
   - Customer (links to User)
   - Sales Invoice (links to Customer, Items)
   - LMS Enrollment (links to User, Program)
   - Project (links to Customer, Template)

**Order matters.** Create parents before children.

---

## Quick Reference

### Check What Exists
```javascript
get_doctypes()              // List all DocTypes
get_documents("DocType")    // List records
get_doctype_fields("DocType") // See schema
```

### Create Master Data
```javascript
// Lead Sources
create_document("CRM Lead Source", {source_name: "Website"})

// Items for invoices
create_document("Item", {
  item_code: "launchpad_program",
  item_name: "Launchpad Program",
  item_group: "Services",
  is_sales_item: 1,
  is_stock_item: 0
})
```

### Link Records
```javascript
// Update Lead to link to Customer
update_document("Lead", "LEAD-001", {
  status: "Converted",
  customer: "CUST-001"
})
```

---

## For Future AIs

**Read this FIRST** before making any Frappe/ERPNext changes.

**Golden Rule:** Schema is source of truth. Query it. Believe it. Use it.

**When stuck:** 
1. You're probably using wrong field name
2. Or missing a Link dependency
3. Or trying to create before parent exists

**When in doubt:** Ask user to verify in ERPNext UI what the exact names are.

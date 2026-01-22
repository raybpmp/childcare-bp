# AI Agent Checklist: How to Accomplish Any Task in Frappe

## Phase 1: Understand What Actually Exists (Discovery)

### Step 1: Identify Relevant DocTypes
- [ ] Call `get_doctypes()` to get complete list of all DocTypes
- [ ] Search the returned list for keywords related to your task
- [ ] Write down EXACT DocType names found (case-sensitive)
- [ ] Do NOT assume DocTypes exist - only use what's in the list

**Example:** If working with LMS, search returned list for "LMS"

**Rule:** If you don't see it in get_doctypes(), it doesn't exist.

### Step 2: Get Schema for Each Relevant DocType
- [ ] For EACH DocType identified, call `get_doctype_fields("DocType Name")`
- [ ] Read the ENTIRE schema response
- [ ] Note field names, field types, and sample values
- [ ] Identify which fields are:
  - Required vs optional
  - Link fields (foreign keys)
  - Child tables
  - Read-only (like counters)

**Rule:** Use exact fieldnames from schema, not variations or guesses.

### Step 3: Examine Actual Records
- [ ] Call `get_documents("DocType", {fields: ["*"], limit: 3})` 
- [ ] Look at real data structure
- [ ] See how fields are actually populated
- [ ] Identify patterns in existing records
- [ ] Note any child table records

**Rule:** Real data reveals structure that schema alone doesn't show.

### Step 4: Understand Relationships
- [ ] For each Link field, note which DocType it links to
- [ ] Call `get_documents()` on linked DocTypes to see what records exist
- [ ] Map out the data model:
  ```
  Parent DocType
    └─ Link to Other DocType
    └─ Child Table: Child DocType
  ```

**Rule:** You must verify linked records exist before using them.

---

## Phase 2: Verify Required Master Data (Prerequisites)

### Step 5: Check Master Data Exists
- [ ] List all Link fields you'll need to populate
- [ ] For each Link field, call `get_documents()` on that DocType
- [ ] Verify the specific record you want to link exists
- [ ] If it doesn't exist, add it to creation plan

**Example:** If creating Lead with source="Website", verify "Website" exists in Lead Source DocType first.

**Rule:** Never assume master data exists. Always verify.

### Step 6: Create Missing Master Data
- [ ] Create any missing master records BEFORE main records
- [ ] Verify creation succeeded
- [ ] Note the exact name/ID to use in Link fields

**Rule:** Create parents before children, masters before transactions.

---

## Phase 3: Plan the Approach (Design)

### Step 7: Map User Request to Frappe Model
- [ ] Write down what user wants to accomplish
- [ ] Identify which DocTypes need to be created/updated
- [ ] Determine order of operations (dependencies)
- [ ] Note which fields will be populated with what data

**Rule:** Do this on paper/document before touching code.

### Step 8: Validate Approach
- [ ] Check: Does this match how existing records are structured?
- [ ] Check: Are all Link field values verified to exist?
- [ ] Check: Is creation order respecting dependencies?
- [ ] Check: Are all required fields accounted for?

**Rule:** If uncertain, ask user - don't guess.

---

## Phase 4: Execute (Implementation)

### Step 9: Create Records in Dependency Order
- [ ] Create master data first
- [ ] Create parent records before children
- [ ] For each create operation:
  - [ ] Use exact fieldnames from schema
  - [ ] Use exact values verified to exist for Link fields
  - [ ] Include all required fields
  - [ ] Call create_document()

**Rule:** One operation at a time. Verify each succeeds before next.

### Step 10: Verify Each Operation
- [ ] After each create/update, check response
- [ ] If error, read error message carefully
- [ ] If 417: Wrong field name or invalid Link value
- [ ] If 500: Missing required field or business logic failure
- [ ] If 404: DocType doesn't exist

**Rule:** Do not continue if operation fails. Fix issue first.

### Step 11: Test the Result
- [ ] Call `get_documents()` to retrieve what you created
- [ ] Verify all fields populated correctly
- [ ] Check relationships are correct
- [ ] Confirm it matches user's request

---

## Anti-Patterns (What NOT to Do)

### ❌ Pattern Matching
- Seeing similar task before and assuming same approach
- Using field names from memory without checking schema
- Copying code without verifying DocTypes exist

### ❌ External Documentation First
- Reading Frappe docs before checking local system
- Assuming standard Frappe features are installed
- Using examples from docs without verification

### ❌ Trial and Error
- Creating record to see what happens
- Trying different field names hoping one works
- Continuing after errors without understanding them

### ❌ Assumptions as Facts
- "This must exist because it's standard"
- "This field is probably called X"
- "This should work like Y"

---

## Recovery: When You've Made an Error

### If you catch yourself pattern matching:
1. Stop
2. Go back to Phase 1: Get schema
3. Compare what you assumed vs what's real
4. Correct your approach

### If you get an error:
1. Read error message word-for-word
2. Identify which field/value caused it
3. Go back to schema - is field name exact?
4. Query the linked DocType - does record exist?
5. Fix root cause, don't try workarounds

### If user says you're hallucinating:
1. Stop everything
2. Ask: "What did I assume that isn't true?"
3. Go verify with get_doctype_fields() or get_documents()
4. Admit the incorrect assumption
5. Start over from facts

---

## Summary: The Golden Rules

1. **Schema First, Always**: Never create without seeing schema
2. **Verify, Don't Assume**: If you didn't query it, you don't know it
3. **Exact Names Only**: Field names are case-sensitive, use exact matches
4. **Master Data Check**: Verify Link field targets exist
5. **One Step at a Time**: Create in order, verify each step
6. **Read Errors Carefully**: Error messages tell you exactly what's wrong
7. **Ask When Uncertain**: User clarification > wrong assumption

---

## Template Response to Any Frappe Task

"To accomplish this, I need to:

1. Verify what DocTypes exist: [call get_doctypes()]
2. Get schema for [DocType X]: [call get_doctype_fields()]
3. Check existing records: [call get_documents()]
4. Verify master data: [check Link field targets]
5. Create/update in this order: [list operations]

Let me start with Step 1..."

Then actually do those steps in order.

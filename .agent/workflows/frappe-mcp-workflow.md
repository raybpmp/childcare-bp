---
description: Guide for AI agents to interact with Frappe/ERPNext using MCP
---

# Frappe MCP Development Workflow ("Supersonic" Methodology)

This workflow defines how AI agents should interact with the Frappe/ERPNext ecosystem using the Model Context Protocol (MCP). It emphasizes a **Schema-First** and **Context-Aware** approach, preventing "vibe coding" and ensuring robust, system-compliant changes.

## Core Philosophy

1.  **Schema is Source of Truth:** The Frappe Framework allows dynamic schema modifications. Always query the current schema before making assumptions.
2.  **Meta-DocTypes are Key:** To modify the system structure (add fields, change permissions), you typically create records in Meta-DocTypes like `Custom Field`, `Property Setter`, or `DocType`.
3.  **Discovery before Action:** Never attempt to write data without first validating the target structure.

## Workflow Steps

### 1. Discovery (Understanding the Context)

Before performing any action, understand the "Ground Truth" of the system.

*   **Goal:** You need to add a "Quiz Score" field to the `Lead` DocType.
*   **Action:** 
    1.  Query the specific target DocType to see existing fields.
    2.  Query the mechanism DocType (e.g., `Custom Field`) to understand *how* to add a field.

```markdown
<!-- Example MCP Tool Call -->
get_doctype_fields(doctype="Lead")
get_doctype_fields(doctype="Custom Field")
```

### 2. Planning (Mapping Requirements to Schema)

Map the user's request to the fields required by the Meta-DocType.

*   **Requirement:** "Add a number field for Quiz Score."
*   **Mapping to `Custom Field` Schema:**
    *   `dt` (DocType): "Lead"
    *   `fieldname`: "quiz_score"
    *   `label`: "Quiz Score"
    *   `fieldtype`: "Int"
    *   `insert_after`: "source" (determined from Discovery step)

### 3. Execution (System Modification)

Use the `create_document` tool to register the new configuration. **Do not** try to modify database tables directly.

```markdown
<!-- Example MCP Tool Call -->
create_document(
    doctype="Custom Field",
    data={
        "dt": "Lead",
        "fieldname": "quiz_score",
        "label": "Quiz Score",
        "fieldtype": "Int",
        "insert_after": "source"
    }
)
```

### 4. Verification

Confirm the change was successful by querying the schema of the modified DocType again.

*   **Action:** Query `get_doctype_fields(doctype="Lead")` and verify `quiz_score` exists.

## Common Meta-DocTypes

*   **`Custom Field`**: Add new fields to standard DocTypes.
*   **`Property Setter`**: Override standard field properties (e.g., make a field mandatory, hidden, or read-only).
*   **`Client Script`**: Add client-side logic (JS).
*   **`Server Script`**: Add server-side logic (Python).

## Anti-Patterns (What NOT to do)

*   **Guessing Field Names:** Never assume a field like `phone_number` exists; it might be `mobile_no` or `contact_no`. Check schema first.
*   **Hardcoding Keys:** Do not guess API usage.
*   **Ignoring Errors:** If a `create_document` call fails with a validation error (e.g., 417), it usually means a mandatory Link field is missing or invalid. Check the schema!


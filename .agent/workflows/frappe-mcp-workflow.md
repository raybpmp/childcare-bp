---
description: Guide for AI agents to interact with Frappe/ERPNext using MCP
---

# Frappe MCP Development Workflow ("Supersonic" Methodology)

This workflow defines how AI agents should interact with the Frappe/ERPNext ecosystem using the Model Context Protocol (MCP). It emphasizes a **Schema-First** and **Context-Aware** approach, preventing "vibe coding" and ensuring robust, system-compliant changes.

## Core Philosophy

1.  **Schema is Source of Truth:** The Frappe Framework allows dynamic schema modifications. Always query the current schema before making assumptions.
2.  **Meta-DocTypes are Key:** To modify the system structure (add fields, change permissions), you typically create records in Meta-DocTypes like `Custom Field`, `Property Setter`, or `DocType`.
3.  **Discovery before Action:** Never attempt to write data without first validating the target structure.

## Understanding Frappe's Schema-First Architecture

Frappe's "schema-first" architecture, centered on the **DocType**, is a metadata-driven approach where data models are defined as configurations rather than written as code (like Django models or SQLAlchemy ORMs).

### 1. The Core Concept: DocType as Meta-Data

In Frappe, you do not write Python or SQL to define a table. Instead, you create a **DocType** (Document Type) file. This JSON file acts as a definition for your data structure (schema).

- **What it includes:** Fields (fieldname, type, length), Permissions (who can read/write), Layouts (how it looks in the desk), and Link fields (relationships).
- **Self-Describing:** Because the DocType definition is itself a document stored in the database, the system is self-describing.

### 2. Field Types and Master Data Pattern

**Critical Understanding:** Link fields reference OTHER DocTypes (master data).

**Field Types:**
- `Data`: Simple text field
- `Int`, `Currency`, `Float`: Numeric fields
- `Select`: Dropdown with predefined options
- `Link`: **References another DocType** - requires existing records in that DocType
- `Long Text`, `Text Editor`: Large text content

**Schema-First Debugging Pattern:**
1. Get field schema: `get_doctype_fields("Lead")`
2. Check field type - if `Link`, check `options` field to see what DocType it links to
3. Query that DocType: `get_documents("CRM Lead Source")` to see what records exist
4. Ensure data you're sending matches existing records

**Example:**
```
Field: "source"
Type: "Link"
Options: "CRM Lead Source"
→ This means you MUST send a value that exists in the "CRM Lead Source" DocType
```

### 3. Automatic Schema Generation

When a developer saves a DocType, Frappe's backend automatically synchronizes with the database:
- No SQL/Migrations: You do not write ALTER TABLE. Frappe runs `bench migrate`.
- Table Creation: If you create a "Property" DocType, Frappe creates `tabProperty` in the database.

### 4. Automatic UI & API Generation

Once the schema is defined, Frappe immediately provides:
- **Web Form/Desk:** A functional form for data entry
- **List View:** A table view with sorting, filtering, pagination
- **REST/RPC API:** Complete REST API endpoint (`/api/resource/DocType`)



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


# LMS Schema Reference

> **Generated**: 2026-01-21
> **Purpose**: Definitive source of truth for LMS DocTypes.
> **Verified Hierarchy**: `LMS Program` → `LMS Course` → `Course Chapter` → `Course Lesson`

---

## 1. LMS Program
**DocType Name**: `LMS Program`

| Fieldname | Type | Notes |
| :--- | :--- | :--- |
| `name` | String | Primary Key (e.g., "Launchpad Program") |
| `title` | String | |
| `published` | Check | 1 = Visible |
| `enforce_course_order` | Check | |
| `course_count` | Int | Read Only |
| `member_count` | Int | Read Only |

---

## 2. LMS Course
**DocType Name**: `LMS Course`
**Parent**: `LMS Program` (Linked via child table in Program or separate enrollment)

| Fieldname | Type | Notes |
| :--- | :--- | :--- |
| `name` | String | ID (e.g., "claude-is-an-idiot") |
| `title` | String | Display Title |
| `status` | Select | "In Progress", "Completed" |
| `short_introduction` | String | |
| `description` | Text Editor | HTML Content |
| `image` | Attach Image | Cover Image |
| `video_link` | Data | Intro Video URL |
| `lessons` | Int | Count of lessons (Read Only) |
| `enrollments` | Int | Count of enrollments (Read Only) |
| `upcoming` | Check | |
| `featured` | Check | |
| `paid_course` | Check | |

---

## 3. Course Chapter
**DocType Name**: `Course Chapter`
**Parent**: `LMS Course`

| Fieldname | Type | Notes |
| :--- | :--- | :--- |
| `name` | String | ID (e.g., "0001 FFS") |
| `title` | String | Chapter Title |
| `course` | Link | Links to `LMS Course` |
| `course_title` | Data | Fetch from Course |
| `idx` | Int | Order in course |

---

## 4. Course Lesson
**DocType Name**: `Course Lesson`
**Parent**: `Course Chapter`

| Fieldname | Type | Notes |
| :--- | :--- | :--- |
| `name` | String | ID (e.g., "0002 FFS") |
| `title` | String | Lesson Title |
| `chapter` | Link | Links to `Course Chapter` |
| `course` | Link | Links to `LMS Course` |
| `body` | Text Editor | Main Content (Markdown/HTML) |
| `content` | Text | JSON Content (EditorJS) |
| `instructor_content` | Text | JSON Content |
| `video_link` | Data | YouTube/Video URL |
| `include_in_preview` | Check | Free preview |
| `idx` | Int | Order in chapter |

---

## Critical Implementation Notes

1. **Hierarchy is Strict**: You cannot create a `Course Lesson` without a `Course Chapter`. You cannot create a `Course Chapter` without an `LMS Course`.
2. **Incorrect DocTypes**:
   - ❌ `LMS Lesson` (Does not exist)
   - ❌ `LMS Chapter` (Does not exist)
   - ❌ `Lesson` (Does not exist)
   - ❌ `Topic` (Does not exist)
3. **Content Fields**: `Course Lesson` uses `body` for standard text content, but `content` stores the JSON structure if using the block editor.


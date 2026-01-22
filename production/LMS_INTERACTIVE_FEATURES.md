# Interactive LMS Features Guide

## Making LMS Courses Engaging with Frappe

### 1. Interactive Kanban Checklists

**Use Case:** Give students a visual progress tracker (e.g., "Launch Your Childcare Business" checklist)

**How to implement:**

1. **Create Custom DocType**
   ```
   DocType: "Student Checklist"
   Fields:
   - title (Data)
   - student (Link to User)
   - status (Select: "To Do", "In Progress", "Done")
   - category (Select: "Legal", "Financial", "Operations")
   - description (Text Editor)
   - due_date (Date)
   ```

2. **Create Portal Page**
   - Path: `/portal/my-checklist`
   - Shows current user's checklist in kanban view
   - Frappe has built-in kanban UI components
   - Drag-and-drop between status columns

3. **Link from Lesson**
   ```html
   <a href="/portal/my-checklist" class="btn btn-primary">
     Open Your Launch Checklist
   </a>
   ```

**Why it works:** Feels like a real app, uses native Frappe UI, automatically saves progress.

---

### 2. Embedded Quizzes with Instant Feedback

**Use Case:** Test knowledge after each lesson

**How to implement:**

1. **Create Quiz DocType**
   ```
   DocType: "LMS Quiz"
   Fields:
   - quiz_title (Data)
   - questions (Table: Quiz Question)
     - question (Text)
     - correct_answer (Data)
     - option_a, option_b, option_c, option_d (Data)
   ```

2. **Create Quiz Submission DocType**
   ```
   DocType: "Quiz Submission"
   Fields:
   - student (Link to User)
   - quiz (Link to LMS Quiz)
   - score (Percent)
   - answers (Table: Student Answer)
   ```

3. **Embed in Lesson**
   - Use Frappe's Client Script to render quiz
   - Submit via Frappe API
   - Show results immediately

---

### 3. Downloadable Resources Library

**Use Case:** Give students templates, checklists, PDFs

**How to implement:**

1. **Create Resource DocType**
   ```
   DocType: "Course Resource"
   Fields:
   - title (Data)
   - file (Attach)
   - program (Link to LMS Program)
   - resource_type (Select: "Template", "Checklist", "Guide")
   ```

2. **Create Portal Page**
   - Path: `/portal/resources`
   - Lists all resources for enrolled programs
   - Download buttons

3. **Link from Course Overview**

**Why it works:** Central library, organized by program, easy downloads.

---

### 4. Progress Dashboard

**Use Case:** Show overall completion, next steps

**How to implement:**

1. **Use Native LMS Features**
   - Frappe LMS tracks lesson completion automatically
   - Create custom portal page that aggregates:
     - Courses completed
     - Lessons in progress
     - Quizzes passed
     - Resources downloaded

2. **Add Gamification**
   - Create "Achievement" DocType
   - Award badges for milestones
   - Display on dashboard

---

### 5. Discussion Forums per Course

**Use Case:** Community Q&A, peer support

**How to implement:**

1. **Use Built-in LMS Discussion**
   - Already exists in Frappe LMS
   - Students can create topics
   - Reply to each other
   - Moderators can pin important threads

2. **Customize if needed:**
   - Add categories (Legal Questions, Marketing Help, etc.)
   - Add voting on helpful answers
   - Add "Ask Expert" flag for instructor responses

---

### 6. Live Session Scheduler

**Use Case:** Book 1-on-1 calls, office hours

**How to implement:**

1. **Create Appointment DocType**
   ```
   DocType: "Student Appointment"
   Fields:
   - student (Link to User)
   - appointment_datetime (Datetime)
   - duration (Select: "30 min", "60 min")
   - status (Select: "Scheduled", "Completed", "Cancelled")
   - zoom_link (Data) - auto-generated
   ```

2. **Create Booking Portal Page**
   - Shows available slots
   - Student selects time
   - Creates appointment
   - Sends email confirmation

3. **Integration:**
   - Generate Zoom/Google Meet links automatically
   - Send calendar invites
   - Reminder emails 24hrs before

---

### 7. Submission & Feedback System

**Use Case:** Students submit assignments, get instructor feedback

**How to implement:**

1. **Create Assignment DocType**
   ```
   DocType: "Student Assignment"
   Fields:
   - student (Link to User)
   - lesson (Link to LMS Lesson)
   - submission_file (Attach)
   - submitted_on (Datetime)
   - feedback (Text Editor)
   - grade (Select: "Pass", "Needs Revision", "Excellent")
   ```

2. **Portal Submission Page**
   - Upload file
   - View feedback when ready
   - Resubmit if needed

---

## Best Practices

### Content Structure
- Short lessons (5-10 min read)
- One concept per lesson
- Action checklist at end
- Link to relevant interactive tools

### User Experience
- Clear navigation
- Progress indicators everywhere
- Mobile-responsive (LMS portal works on phone)
- Minimize clicks to get to content

### Engagement Tactics
- Start each course with quick win
- Gamify with badges/achievements
- Weekly challenges in discussion forum
- Celebrate completions publicly

---

## Technical Tips

### Frappe Portal Pages
- Located in `frappe/www/portal/`
- Use Jinja templates
- Auto-authenticated (knows current user)
- Can call Frappe API directly

### Embedding Content
```html
<!-- In lesson content -->
<div class="embed-container">
  <iframe src="/app/student-checklist"></iframe>
</div>
```

### Client Scripts for Interactivity
```javascript
frappe.ui.form.on('LMS Lesson', {
  onload: function(frm) {
    // Add interactive elements
    frm.add_custom_button('Take Quiz', () => {
      // Open quiz modal
    });
  }
});
```

---

## Quick Wins for Launch

**Minimum for day 1:**
1. Basic lessons with text content ✅
2. One downloadable PDF per course ✅
3. Discussion forum enabled ✅

**Add within week 1:**
1. Simple checklist (static HTML, not interactive yet)
2. Resource library page
3. Welcome video

**Add within month 1:**
1. Interactive kanban checklist
2. Quiz system
3. Assignment submissions
4. Progress dashboard

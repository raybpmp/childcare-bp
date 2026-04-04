# Portal Architecture & Build Guide

This document explains the architecture, UI definitions, and technical implementation of this Astro + React dashboard portal. It is designed to act as a reference for AI agents or developers looking to replicate, extend, or understand this project.

## 1. System Architecture

The portal is a **Multi-Page Application (MPA)** built primarily with **Astro**. It uses **React** only where necessary for interactive UI components (Astro Islands). 

### Tech Stack
*   **Framework:** Astro 6 (Handles routing, HTML generation, and static layouts)
*   **UI Framework:** React 18 (Handles interactive components, state, and forms)
*   **Styling:** Tailwind CSS
*   **Component Pattern:** shadcn/ui (Radix UI primitives + Tailwind classes via `class-variance-authority`, `clsx`, `tailwind-merge`)
*   **Icons:** `lucide-react`
*   **Data Persistence:** Browser `localStorage` (Acts as a mock database)
*   **Global State Sync:** Vanilla JS `CustomEvent` API

### The "Astro Island" Paradigm
The fundamental rule of this architecture is **Separation of Concerns between Shell and Content**:
*   **The Shell (Astro):** The global layout (`<html>`, `<head>`), the Sidebar, and the Header are written as `.astro` components. They are rendered natively by Astro for maximum performance and handle their own basic interactivity (like toggling the mobile menu) using pure, vanilla `<script>` tags.
*   **The Content (React):** The actual page content (`Dashboard`, `Profile`, `Settings`, `Analytics`) are written as `.tsx` React components. They are embedded into the Astro pages using the `client:load` directive, telling Astro to hydrate them with React on the client side.

*Crucial Architecture Note:* React components in Astro cannot return fragments (`<>...</>`) as their root element when hydrated as islands. They must return a valid DOM node like a `<div>`.

## 2. UI Definition

The UI follows a standard, modern B2B SaaS dashboard layout.

### Layout Structure
*   **Sidebar (`src/components/layout/Sidebar.astro`):** Fixed on the left side on desktop, hidden behind a hamburger menu on mobile. Contains navigation links and a user profile summary at the bottom.
*   **Header (`src/components/layout/Header.astro`):** Fixed at the top. Contains a mobile menu toggle, search bar (mock), notification bell, and user avatar.
*   **Main Content Area:** Takes up the remaining space. Contains the React Islands.

### Core UI Components (`src/components/ui/`)
The project uses reusable, headless UI components based on the shadcn/ui pattern:
*   **`Button`**: Highly customizable buttons with variants (default, outline, destructive, ghost, etc.) and sizes.
*   **`Card`**: Used to group information. Composed of `Card`, `CardHeader`, `CardTitle`, `CardDescription`, and `CardContent`.
*   **`Badge`**: Small pill-shaped tags used for statuses (e.g., 'completed', 'pending').

### Views / Pages
1.  **`/` (Dashboard):** Shows greeting, top-level stats (Total Logins, Activities, Role), and lists "Recent Activity" and "Quick Actions". Allows creating new mock activities.
2.  **`/analytics`:** Displays visual breakdowns of activities by type and status, along with a chronological timeline.
3.  **`/profile`:** Shows the user's details and provides a form to edit their Name, Email, and Role.
4.  **`/settings`:** Allows toggling app preferences (Theme, Sidebar state, Notifications) and provides a "Danger Zone" to clear all local data.
5.  **`404`:** A friendly "Not Found" page.

## 3. State Management & Data Flow

Because the application uses isolated React components embedded in an Astro shell, standard React state (like Context) cannot easily bridge the gap between the React content and the Astro Sidebar/Header. 

To solve this without a heavy global state library, the portal uses a **Vanilla JS Event Bus built on top of LocalStorage**.

### How it Works (`src/lib/storage.ts`)
1.  **Reading:** Components call getter functions (e.g., `getProfile()`, `getDashboardData()`) which parse JSON from `localStorage`. If empty, they return default mock data.
2.  **Writing:** When a component wants to save data, it calls a setter (e.g., `saveProfile()`).
3.  **The Magic (Event Dispatching):** Inside the core `setItem` utility, after saving to `localStorage`, the code explicitly dispatches a window-level event:
    ```javascript
    window.dispatchEvent(new CustomEvent('portal_storage_update', { detail: { key, value } }));
    ```
4.  **Listening (React):** React components use `useEffect` to listen for this event. If they see the key they care about has updated, they re-fetch the data and call their local `setState`, triggering a re-render.
5.  **Listening (Astro):** The native `<script>` tags in `Header.astro` and `Sidebar.astro` also listen for this event. When fired, they directly manipulate the DOM (using `document.getElementById`) to update the user's name and avatar instantly.

### Why this is effective for Prototypes
This architecture means you can have a "fully functioning" application where components instantly react to each other's changes, without needing a backend server, database, or complex state management libraries like Redux or Nanostores.

## 4. Common Pitfalls to Avoid (For Future AI Agents)

If an AI is instructed to modify or rebuild this project, it MUST avoid these mistakes:

1.  **Do not put React routers in an Astro project:** Astro *is* the router. Do not use `react-router-dom`. Use Astro's file-based routing (`src/pages/*.astro`).
2.  **Do not put TypeScript in Astro `<script>` tags:** Native `<script>` tags in Astro files are shipped directly to the browser. Do not use `(event: CustomEvent)` or `as Type` syntax in them, or it will throw a fatal `SyntaxError` and break the entire page's interactivity.
3.  **Do not wrap Island roots in Fragments:** If a React component is called in an `.astro` file with `client:load` or `client:only`, its outermost return MUST be a real DOM element (`<div>`, `<main>`, etc.), not a fragment (`<>`).
4.  **Do not try to make the Layout a React component:** The app shell (HTML, Head, Body, Sidebar, Header) should remain `.astro` components. Only the interactive inner content should be React.

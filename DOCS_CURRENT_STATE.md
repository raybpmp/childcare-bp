# Child Care Business Plan - Portal Architecture (v1.0.1)

## Overview
The Child Care Business Plan portal is a modern, mobile-first dashboard built with **React**, **Astro**, and **Firebase**. It provides a glassmorphic interface for users to manage their business plans and track activities.

## Mobile-First Design Principles
The portal is designed with a "Mobile-First" philosophy, ensuring a premium experience on smaller viewports (320px+) before scaling up to desktop.

### 1. Responsive Grid System
- **Stats Overview**: Uses a `grid-cols-2 lg:grid-cols-4` configuration. On mobile, stats are displayed in a compact 2-column grid to maximize vertical space.
- **Content Sections**: The `md:grid-cols-7` layout ensures that the "Recent Activity" and "Quick Actions" stack vertically on mobile while splitting 4:3 on desktop.

### 2. Glassmorphism & Aesthetics
- **Pro-Card System**: All containers use the `.pro-card` and `.glass-panel` utility classes, providing a translucent, frosted-glass effect that feels premium and state-of-the-art.
- **Micro-Interactions**: Hover effects on buttons and transition animations (via Framer Motion) provide tactile feedback.

### 3. Mobile Navigation
- **Responsive Navbar**: A dedicated `MobileNav` component handles navigation on small screens, using a clean, accessible hamburger menu and overlay system.

## Technical Architecture

### Frontend Stack
- **Framework**: Astro 6.1.2 with React integration.
- **Styling**: Tailwind CSS 4.0 with custom glassmorphism utilities.
- **Icons**: Lucide React.
- **State Management**: Nanostores for lightweight, cross-framework state sharing.

### Backend & Authentication
- **Authentication**: Firebase SDK (Auth) for secure user sessions.
- **Data Layer**: MariaDB via a dedicated proxy API (`portal-api`).
- **Notification System**: Integrated with Postmark for automated onboarding and admin alerts.

## Current State Summary
- **Version**: 1.0.1
- **Status**: Production UI ready with active database integration.
- **Recent Updates**: Pulled latest news content regarding Pennsylvania child care worker bonuses.

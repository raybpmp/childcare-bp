# Stripe Webhook Gateway: Implementation Plan

## Overview
Due to limitations with Firebase/Astro functions, we are deploying a dedicated, standalone Node.js service to handle Stripe webhooks. This service will run in a Docker container on the production server (`150.136.42.8`) and act as the bridge between Stripe and the Frappe/ERPNext ecosystem.

## Goals
1. Provide a reliable endpoint for Stripe Webhook events.
2. Verify Stripe signatures for security.
3. Coordinate the 6-step customer onboarding flow in Frappe.
4. Ensure robust error handling and logging.

---

## Stage 1: Service Foundation
### Task 1.1: Project Setup
- [ ] Initialize Node.js project with TypeScript.
- [ ] Install dependencies: `express`, `stripe`, `dotenv`, `axios` (or native fetch).
- [ ] Configure `tsconfig.json` for modern Node.js.

### Task 1.2: Dockerization
- [ ] Create `Dockerfile` (Node 20 Alpine).
- [ ] Create `docker-compose.yml` for standalone deployment or integration with Frappe stack.
- [ ] Set up health check endpoint.

---

## Stage 2: Webhook Logic
### Task 2.1: Endpoint Implementation
- [ ] Create `/webhook` POST endpoint.
- [ ] Implement Stripe signature verification using `STRIPE_WEBHOOK_SECRET`.
- [ ] Log payload metadata for debugging.

### Task 2.2: The Onboarding Flow (The 6 Steps)
- [ ] **Step 1: User Identity** - Find/Create Frappe User (Portal access).
- [ ] **Step 2: Customer Record** - Create/Update Customer DocType.
- [ ] **Step 3: Financials** - Create Sales Invoice + Mark Paid.
- [ ] **Step 4: Content Access** - Create LMS Enrollment (Launchpad/Director/CEO).
- [ ] **Step 5: Service Management** - Create Project (using templates).
- [ ] **Step 6: Communication** - Trigger Welcome Email.

---

## Stage 3: Deployment & Integration
### Task 3.1: Server Deployment
- [ ] Push code to server.
- [ ] Build and start Docker container.
- [ ] Configure Proxy (Traefik/Nginx) to route `webhook.childcarebusinessplan.com` (or similar) to the container.

### Task 3.2: Stripe Configuration
- [ ] Configure webhook in Stripe Dashboard.
- [ ] Point to production URL.
- [ ] Subscribe to `checkout.session.completed`.

---

## Security Requirements
- **No Hardcoded Secrets**: Use environment variables for all keys.
- **Signature Verification**: Mandatory for all incoming requests.
- **Least Privilege**: Use the `api@childcarebusinessplan.com` user roles.

## Success Criteria
- [ ] Stripe CLI `trigger` results in successful creation of all 6 records in Frappe.
- [ ] Logs show clear step-by-step progress.
- [ ] Service automatically restarts on failure.

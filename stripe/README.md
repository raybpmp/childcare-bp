# Stripe Webhook Microservice (CCBP Gateway)

This standalone Node.js microservice bridges the Astro website (Frontend) with ERPNext (Backend) to handle customer onboarding after a successful Stripe purchase. It exists to bypass Firebase's technical limitations regarding webhook handlers.

## Architecture

- **Logic**: Built with Node.js, Express, and Stripe SDK.
- **Deployment**: Runs in a standalone Docker container (`ccbusinessplan-stripe-webhook`) on the production VPS.
- **Networking**: Joined to the `frappe_docker_default` bridge network to communicate securely with the ERP API at `http://frappe_docker-frontend-1:8080`.
- **Ingress**: Publicly exposed via the global Caddy proxy at `https://webhook.childcarebusinessplan.com/v1/stripe`.

## The Onboarding Flow (6 Steps)

When a `checkout.session.completed` event is received:

1.  **ERP User**: Finds or creates a `User` record (Role Profile: `Customer`).
2.  **ERP Customer**: Finds or creates a `Customer` record linked to the email.
3.  **Sales Invoice**: Generates a paid `Sales Invoice` for the purchased tier (Launchpad, Director, or CEO).
4.  **LMS Enrollment**: Enrolls the user in the corresponding `LMS Program`.
5.  **Project Creation**: For high-touch tiers (Director/CEO), instantiates an onboarding project from a template.
6.  **Welcome Email**: Sends the tier-specific welcome email via ERPNext's communication system.

## Configuration (Production VPS)

- **Location**: `/opt/ccbp-webhook/`
- **Files**:
    - `docker-compose.yml`: Defines the stack and networking.
    - `.env`: Contains Stripe secrets and Frappe API credentials.
    - `dist/index.js`: The compiled logic.

## Security

- **Signature Verification**: Every request is verified using the `STRIPE_WEBHOOK_SECRET` before processing.
- **API Tokens**: Uses a dedicated `AI Agent` user (`api@childcarebusinessplan.com`) with restricted permissions in ERPNext.

## Verified Price IDs (Jan 2026 Rebuild)

These IDs are the **Single Source of Truth** for the gateway. They match both the Stripe Dashboard and the Astro Frontend.

| Tier | Period | Stripe Price ID | Amount |
| :--- | :--- | :--- | :--- |
| **Launchpad** | Monthly | `price_1Ss4VfJD1n5R7a8mlgezlXoS` | $99 |
| **Launchpad** | Yearly | `price_1Ss4VgJD1n5R7a8m6qHrn435` | $499 |
| **Director** | Monthly | `price_1Ss4VgJD1n5R7a8mSPQ9nAyu` | $349 |
| **Director** | Yearly | `price_1Ss4VhJD1n5R7a8ms1mezfi0` | $2,499 |
| **CEO Circle** | Monthly | `price_1Ss4VhJD1n5R7a8mpsxEyHFj` | $749 |
| **CEO Circle** | Yearly | `price_1Ss4ViJD1n5R7a8mfeZsiSIP` | $5,500 |

### For Future AI Agents
This service is the **Single Source of Truth** for post-purchase automation. If modifications are needed to the onboarding logic, edit `src/index.ts` in this folder, run `docker compose up -d --build` on the server. Always verify that IDs match the table above after a rebuild.

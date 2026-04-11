# Claims API — Firebase Custom Claims Management

## What This Service Does

This is a standalone Express API deployed on the OCI server (150.136.42.8:4100).
It has **one job**: manage Firebase Custom Claims — stamping user roles directly into Firebase Auth tokens.

## Why It Exists

Firebase Auth handles identity (who you are) but not authorization (what you can access).
Custom Claims solve this by embedding role data (`{ role: 'Admin', tierId: 1 }`) directly into the user's Firebase token.

**The flow:**
1. MariaDB stores the business truth (tier_id, role, billing history)
2. When a role changes, someone calls this API to sync that role into Firebase
3. The user's frontend calls `getIdToken(true)` to silently refresh their token
4. The token now contains the role — the frontend instantly knows what to show

## Architecture

```
MariaDB (Business SOT) ←→ portal-api (DB mirror, port 4000)
Firebase Auth (Access Cache) ←→ claims-api (THIS, port 4100)
Stripe (Payments) ←→ stripe service (port 3000)
```

## Endpoints

| Method | Path | Body | Purpose |
|:---|:---|:---|:---|
| POST | `/api/v1/set-claims` | `{ uid, role, tierId }` | Stamp role into token |
| GET | `/api/v1/get-claims/:uid` | — | Read current claims |
| POST | `/api/v1/sync-claims` | `{ users: [{uid, role, tierId}] }` | Bulk sync |
| GET | `/api/health` | — | Health check |

## Deployment

```bash
# From project root
chmod +x claims-api/deploy.sh
./claims-api/deploy.sh
```

Deploys as a Docker container on port 4100. No database connection needed.

## When To Call This API

| Event | Who Calls | What Happens |
|:---|:---|:---|
| User registers | Frontend (LoginForm.tsx) | Sets default `{ role: 'Member', tierId: 3 }` |
| Admin changes role | Admin Dashboard (future) | Sets new role/tier |
| Initial migration | One-time script | Syncs all existing MariaDB users |

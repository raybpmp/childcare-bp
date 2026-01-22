# Stripe Price ID Management

## Problem
Stripe generates random Price IDs like `price_1Ss4VfJD1n5R7a8mlgezlXoS` when you create prices. These IDs are **permanent and cannot be changed**. If you delete and recreate a price in Stripe, it gets a **new random ID**.

This causes the webhook to break because the hardcoded mappings in `stripe.ts` become outdated.

## Current Active Prices

As of 2026-01-21, the active prices in Stripe are:

| Tier | Interval | Price | Stripe Price ID |
|------|----------|-------|-----------------|
| Launchpad | Monthly | $99 | `price_1Ss4VfJD1n5R7a8mlgezlXoS` |
| Launchpad | Yearly | $499 | `price_1Ss4VgJD1n5R7a8m6qHrn435` |
| Director | Monthly | $349 | `price_1Ss4VgJD1n5R7a8mSPQ9nAyu` |
| Director | Yearly | $2,499 | `price_1Ss4VhJD1n5R7a8ms1mezfi0` |
| CEO Circle | Monthly | $749 | `price_1Ss4VhJD1n5R7a8mpsxEyHFj` |
| CEO Circle | Yearly | $5,500 | `price_1Ss4ViJD1n5R7a8mfeZsiSIP` |

## When to Update

Update the webhook mappings whenever you:
1. Create new prices in Stripe
2. Delete old prices
3. Change pricing tiers
4. Switch between test/live mode

## How to Update

### Step 1: Get Current Active Prices

Run this command to fetch active prices from Stripe:

```bash
curl "https://api.stripe.com/v1/prices?active=true&limit=20" \
  -u $STRIPE_SECRET_KEY: \
  -G | jq '.data[] | {id: .id, amount: (.unit_amount/100), interval: .recurring.interval}'
```

### Step 2: Update Webhook Mappings

Edit [src/pages/api/webhooks/stripe.ts](file:///mnt/storage/The%20Ark/Documents/Websites/Child%20Care%20Business%20Plan/src/pages/api/webhooks/stripe.ts) and update three constants:

1. `PRODUCT_TO_PROGRAM` - Maps price IDs to LMS Program names
2. `PRODUCT_TO_PROJECT_TEMPLATE` - Maps price IDs to Project Templates (Director/CEO only)
3. `PRODUCT_TO_EMAIL_TEMPLATE` - Maps price IDs to Email Templates

**Example:**
```typescript
const PRODUCT_TO_PROGRAM: Record<string, string> = {
    'price_NEW_ID_HERE': 'Launchpad Program',  // $99/mo
    // ... etc
};
```

### Step 3: Verify ERPNext Master Data

Ensure these records exist in ERPNext:
- **LMS Programs**: "Launchpad Program", "Director Program", "CEO Program"
- **Project Templates**: "Director Onboarding", "CEO Onboarding"
- **Email Templates**: "Welcome - Launchpad", "Welcome - Director", "Welcome - CEO"

## Better Solution (Future)

Instead of hardcoding Price IDs, use Stripe's **lookup_keys** or **metadata**:

1. In Stripe, set a `lookup_key` on each price (e.g., `launchpad_monthly`)
2. In webhook, use `price.lookup_key` instead of `price.id`
3. Never needs updating when recreating prices with same lookup key

**To implement:**
```typescript
// Instead of:
const programName = PRODUCT_TO_PROGRAM[priceId];

// Use:
const programName = PRODUCT_TO_PROGRAM[price.lookup_key];
```

## Quick Reference Script

Save this as `scripts/get-stripe-prices.sh`:

```bash
#!/bin/bash
curl "https://api.stripe.com/v1/prices?active=true&limit=20" \
  -u $STRIPE_SECRET_KEY: \
  -G | jq -r '.data[] | "\\(.id) - $\\(.unit_amount/100) \\(.recurring.interval)"'
```

Run: `./scripts/get-stripe-prices.sh` to see all active prices.

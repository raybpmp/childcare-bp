# Childcare Business Plan - System Overview

**Last Updated:** 2026-01-21  
**Status:** Pre-Launch - LMS Setup Required

---

## System Architecture

### Frontend
- **Astro Website** - Landing page, quiz, pricing
- **URL:** https://www.childcarebusinessplan.com
- **Hosted:** Local development

### Backend
- **Frappe/ERPNext** - CRM, LMS, Projects, Invoicing
- **URL:** https://portal.childcarebusinessplan.com
- **Server:** Oracle Cloud ARM64 (150.136.42.8)
- **Access:** See [SERVER_ACCESS.md](SERVER_ACCESS.md)

### Integrations
- **Stripe** - Payment processing (test mode)
- **Postmark** - Email delivery

---

## Current State

### ✅ What's Working
- Lead capture from quiz → Frappe CRM
- Stripe checkout (test mode)
- User/Customer creation
- Sales Invoice creation
- Items exist for all 3 tiers

### ❌ Launch Blockers
1. **LMS Enrollment fails** - Programs have no courses
2. **Webhook untested** - Never run end-to-end
3. **Email sending unverified** - Templates exist but not tested

---

## Product Tiers

| Tier | Price | Features |
|------|-------|----------|
| Launchpad | $99/mo, $499/yr | Self-serve courses, community |
| Director | $349/mo, $2,499/yr | + Onboarding project, office hours |
| CEO Circle | $749/mo, $5,500/yr | + 1-on-1 coaching, exec network |

### ERPNext Master Data
- **LMS Programs:** Launchpad Program, Director Program, CEO Program
- **Project Templates:** Director Onboarding, CEO Onboarding  
- **Email Templates:** Welcome - Launchpad, Welcome - Director, Welcome - CEO
- **Items:** launchpad_program, director_program, ceo_program

---

## Customer Journey

### 1. Lead Generation (Quiz)
```
User completes quiz → /api/capture-lead → Create Lead in Frappe CRM
Fields: email, funnel_segment, quiz_state_local, revenue_potential
```

### 2. Purchase (Stripe)
```
User clicks pricing tier → Stripe checkout → Payment succeeds
→ Stripe webhook fires → /api/webhooks/stripe
```

### 3. Onboarding (Webhook - 6 Steps)
```
1. Create/Find User
2. Create/Find Customer  
3. Create Sales Invoice
4. Create LMS Enrollment ❌ BLOCKED
5. Create Project (Director/CEO only)
6. Send Welcome Email
```

---

## Integration Details

### Stripe Price IDs
See [stripe/PRICE_ID_MANAGEMENT.md](../stripe/PRICE_ID_MANAGEMENT.md) for current IDs.

**IMPORTANT:** Price IDs change when you recreate prices. Must update webhook mappings.

### Frappe API
- **URL:** https://portal.childcarebusinessplan.com/api
- **Auth:** `api_childcare_business_plan_2026:04215abdff4d6b8`
- **Guide:** See [FRAPPE_AI_GUIDE.md](FRAPPE_AI_GUIDE.md)

---

## Next Steps to Launch

### Critical (Must Fix)
1. **Create LMS Courses** - At least 1 per program
2. **Test LMS Enrollment** - Verify it works after courses exist
3. **End-to-end Test** - One full purchase → access flow

### Important (Should Do)
1. Switch Stripe to live mode
2. Test email sending
3. Verify welcome emails arrive

### Nice to Have
1. Add error handling to webhook
2. Implement idempotency
3. Link Leads to Customers

**Estimated Time to Launch:** 2-4 hours

---

## Documentation Index

### Active Reference Docs
- **[FRAPPE_AI_GUIDE.md](FRAPPE_AI_GUIDE.md)** - Schema-first approach, debugging
- **[LMS_INTERACTIVE_FEATURES.md](LMS_INTERACTIVE_FEATURES.md)** - Building engaging courses
- **[SERVER_ACCESS.md](SERVER_ACCESS.md)** - SSH, credentials, commands
- **[END_TO_END_TEST_RESULTS.md](END_TO_END_TEST_RESULTS.md)** - What works/what's broken
- **[../stripe/PRICE_ID_MANAGEMENT.md](../stripe/PRICE_ID_MANAGEMENT.md)** - Managing Stripe prices

### Historical/Completed
See `completed_tasks/` folder for design docs and old plans.

---

## Key Files

### Website
- `src/components/tools/QuizFunnel.tsx` - Quiz form
- `src/pages/api/capture-lead.ts` - Lead creation endpoint
- `src/pages/api/webhooks/stripe.ts` - Stripe webhook handler
- `src/components/PricingSection.tsx` - Pricing tiers

### Configuration
- `.env` - API keys, secrets
- `stripe/` - Stripe product/price config

---

## Common Tasks

### Update Stripe Price IDs
1. Get active prices: `curl https://api.stripe.com/v1/prices?active=true -u $STRIPE_SECRET_KEY:`
2. Update `src/pages/api/webhooks/stripe.ts` mappings
3. See [stripe/PRICE_ID_MANAGEMENT.md](../stripe/PRICE_ID_MANAGEMENT.md)

### Create LMS Course
```javascript
create_document("LMS Course", {
  title: "Course Name",
  short_description: "Description",
  published: 1
})
```

### Test Lead Creation
```bash
curl -X POST https://portal.childcarebusinessplan.com/api/resource/Lead \
  -H "Authorization: token api_childcare_business_plan_2026:04215abdff4d6b8" \
  -H "Content-Type: application/json" \
  -d '{"data": {"email_id": "test@example.com", ...}}'
```

### Access Production Server
```bash
ssh -i ~/.ssh/childcare_server_key.pem ubuntu@150.136.42.8
cd /opt/ccbusinessplan
docker compose ps
```

---

## Troubleshooting

### 417 Error from Frappe
- Wrong field name or invalid Link value
- Check schema: `get_doctype_fields("DocType")`

### Stripe Webhook Not Firing
- Check Stripe dashboard → Webhooks → Recent deliveries
- Verify webhook URL and secret match

### LMS Enrollment Fails
- Programs need courses
- Check if program name matches exactly

---

## Support

**Frappe MCP:** All ERPNext operations use MCP tools  
**Stripe:** Test mode keys in `.env`  
**Email:** Postmark configured, templates in ERPNext

For detailed Frappe guidance, see [FRAPPE_AI_GUIDE.md](FRAPPE_AI_GUIDE.md).

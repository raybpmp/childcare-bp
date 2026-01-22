# Launch Readiness Gap Analysis
## Stripe Integration & Lead Generation

**Date:** 2026-01-21  
**Scope:** Stripe payment processing, ERPNext integration, lead generation pipeline  
**Status:** 🟡 Partially Ready - Critical gaps identified

---

## Executive Summary

The website has the core infrastructure for Stripe and lead generation but has **never been tested end-to-end**. Two critical bugs were fixed today (missing Lead Source, wrong Stripe price IDs), but **no actual transactions have been processed** to verify the complete flow works.

**Launch Readiness:** 70% - Infrastructure exists but unverified.

---

## MVP Baseline Definition

A production-ready MVP for Stripe + Lead Generation requires:

### Lead Generation (Quiz → CRM)
- [x] Quiz captures email and business data
- [x] API endpoint to send data to ERPNext
- [x] Lead created in Frappe CRM with custom fields
- [x] Lead Source tracking ("Website Calculator")
- [ ] **UNTESTED:** Lead assignment/routing
- [ ] **UNTESTED:** Lead follow-up automation
- [ ] Lead deduplication handling

### Stripe Checkout
- [x] Pricing page with three tiers
- [x] Stripe checkout session creation
- [ ] **UNTESTED:** Successful payment processing
- [ ] **UNTESTED:** Redirect back to website after payment
- [ ] **MISSING:** Payment failure handling
- [ ] **MISSING:** Error logging/monitoring

### Stripe → ERPNext Onboarding
- [x] Webhook endpoint configured
- [x] Signature verification
- [x] User creation in ERPNext
- [x] Customer creation
- [x] Sales Invoice generation
- [x] LMS Enrollment creation (correct programs)
- [x] Project creation (Director/CEO tiers)
- [x] Welcome email trigger
- [ ] **UNTESTED:** All 6 steps executed successfully
- [ ] **MISSING:** Rollback/error handling if steps fail
- [ ] **MISSING:** Webhook retry logic
- [ ] **MISSING:** Duplicate payment prevention

### Monitoring & Operations
- [ ] **MISSING:** Webhook failure alerts
- [ ] **MISSING:** Payment success/failure logging
- [ ] **MISSING:** Lead creation failure logging
- [ ] **MISSING:** Health check endpoints
- [ ] **MISSING:** Stripe test mode vs live mode indicator

---

## Current Implementation Status

### ✅ What's Working (Verified)

| Component | Status | Evidence |
|-----------|--------|----------|
| Lead creation API | ✅ Working | Successfully created `CRM-LEAD-2026-00003` |
| CRM Lead Source exists | ✅ Fixed | "Website Calculator" created today |
| Custom Lead fields | ✅ Working | funnel_segment, quiz_state_local, revenue_potential, quiz_payload_raw all save |
| Stripe price IDs | ✅ Fixed | Updated with actual IDs today |
| ERPNext master data | ✅ Verified | Programs, templates, email templates exist |
| Frappe API auth | ✅ Working | API key/secret valid |

### 🟡 What's Built But Untested

| Component | Built | Tested | Risk |
|-----------|:-----:|:------:|------|
| Stripe checkout creation | ✅ | ❌ | Medium - Could fail on actual payment |
| Webhook User creation | ✅ | ❌ | High - Duplicate user errors possible |
| Webhook Customer creation | ✅ | ❌ | High - Link to User might fail |
| Sales Invoice creation | ✅ | ❌ | Critical - Item codes might not exist |
| LMS Enrollment | ✅ | ❌ | Critical - Program linking untested |
| Project creation | ✅ | ❌ | Medium - Template instantiation untested |
| Welcome emails | ✅ | ❌ | Low - Email sending might fail silently |

### ❌ What's Missing

| Requirement | Priority | Impact |
|-------------|----------|--------|
| Error handling in webhook | 🔴 Critical | Payment succeeds but onboarding fails = angry customer |
| Webhook retry logic | 🔴 Critical | Stripe retries for 72hrs, we might create duplicates |
| Payment failure UI | 🟡 Important | User has no idea why payment failed |
| Lead deduplication | 🟡 Important | Same email completes quiz 3x = 3 leads |
| Idempotency keys | 🔴 Critical | Duplicate charges possible |
| Logging/monitoring | 🟡 Important | Can't debug production issues |
| Test mode indicator | 🟢 Nice-to-have | Might accidentally charge real cards in test |

---

## Critical Gaps Requiring Immediate Attention

### 1. Sales Invoice Item Codes 🔴

**Problem:** Webhook creates Sales Invoice with `item_code` like `launchpad_program` but we haven't verified these Items exist in ERPNext.

**Schema Check Needed:**
```bash
# Check if Items exist
get_documents("Item", filters={"item_code": "launchpad_program"})
get_documents("Item", filters={"item_code": "director_program"})
get_documents("Item", filters={"item_code": "ceo_program"})
```

**If missing:** Sales Invoice creation will fail with 417 error.

**Fix:** Create Item records in ERPNext for each program OR update webhook to use existing Item codes.

---

### 2. Webhook Error Handling 🔴

**Current Code:**
```typescript
// If Step 3 fails, Steps 1-2 already succeeded
// User is created, Customer is created, but no invoice/enrollment
// Result: Paid customer with no access
```

**Required:**
- Try/catch around each step
- Rollback or mark for manual review if fails
- Return 200 to Stripe even if onboarding fails (to prevent retries)
- Log to error tracking service

---

### 3. Idempotency 🔴

**Problem:** If webhook fires twice for same payment, we'll create duplicate enrollments/projects.

**Solution:**
```typescript
// Store Stripe payment_intent_id in ERPNext
// Check if already processed before creating records
const existing = await checkIfProcessed(paymentIntentId);
if (existing) return { success: true, ...existing };
```

---

### 4. Lead → Customer Connection ⚠️

**Current Flow:**
```
Quiz → Create Lead (email: test@example.com)
... days later ...
Purchase → Create Customer (email: test@example.com)
```

**Problem:** Lead and Customer are NOT linked. Can't track conversion.

**Solution:** In webhook Step 2, search for Lead by email and link to Customer:
```typescript
const leads = await searchLeads(email);
if (leads.length > 0) {
  await updateLead(leads[0].name, { 
    status: "Converted",
    customer: customerId 
  });
}
```

---

## Testing Checklist Before Launch

### Lead Generation Testing
- [ ] Submit quiz with valid email → verify Lead created
- [ ] Submit quiz with same email twice → verify deduplication or both created
- [ ] Submit quiz with invalid data → verify graceful error
- [ ] Check Lead appears in Frappe CRM with all custom fields

### Stripe Testing (Test Mode)
- [ ] Purchase Launchpad Monthly ($99) → verify checkout works
- [ ] Complete payment → verify redirect back to site
- [ ] Check Stripe dashboard → verify payment succeeded
- [ ] Check webhook logs → verify webhook fired
- [ ] Check ERPNext → verify User, Customer, Invoice, Enrollment created
- [ ] Check email → verify Welcome email sent
- [ ] Repeat for all 6 tiers (Launchpad/Director/CEO × Monthly/Yearly)

### Error Scenarios
- [ ] Submit payment with declined card → verify error shown to user
- [ ] Trigger webhook with invalid data → verify doesn't crash
- [ ] Trigger webhook twice → verify no duplicates
- [ ] Create Lead for existing ERPNext user → verify no conflicts

### Production Readiness
- [ ] Switch Stripe to live mode
- [ ] Update price IDs for live mode prices
- [ ] Set up webhook monitoring/alerts
- [ ] Test on staging with real card (refund immediately)
- [ ] Document runbook for common errors

---

## Recommendations

### Phase 1: Critical Fixes (Before ANY Launch)
1. **Verify Item codes exist** - Check ERPNext Items, create if missing
2. **Add webhook error handling** - Catch failures, log, don't retry
3. **Implement idempotency** - Check payment_intent_id before processing
4. **Link Lead to Customer** - Connect conversion funnel

### Phase 2: Soft Launch (Test with Friends)
1. **End-to-end test** - One person completes quiz → purchase
2. **Monitor closely** - Watch every webhook fire, check ERPNext
3. **Fix issues** - Likely will find edge cases

### Phase 3: Production Launch
1. **Switch to live mode** - Update Stripe keys and price IDs
2. **Set up monitoring** - Error tracking, webhook logs
3. **Document support** - How to manually fix failed onboardings

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Item codes don't exist | High | Critical | Verify schema now |
| Webhook fails silently | Medium | Critical | Add error tracking |
| Duplicate enrollments | Low | High | Implement idempotency |
| Email doesn't send | Medium | Medium | Test SMTP config |
| Lead never converts | Low | Low | Add linking logic |

---

## Conclusion

**Can you launch?** Not yet. The infrastructure is 70% complete but:

1. **Nothing has been tested end-to-end** - You don't know if it actually works
2. **Critical error handling missing** - Payments might succeed but onboarding fails
3. **Item codes unverified** - High chance Sales Invoice creation fails

**Minimum to launch:**
1. Verify Item codes exist (15 min)
2. Test one full purchase flow (30 min)
3. Add basic error logging (1 hour)

**Realistic timeline:** 2-4 hours of work + testing before safe to launch.

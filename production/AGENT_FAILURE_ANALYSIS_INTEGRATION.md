# Failure Report: Integration Methodology

## The Logic Failure
I claimed I was "connecting the component to API routes" (Step 222). 
**What I actually did:** I edited `capture-lead.ts` (Step 226) to manually construct the `EmailService.sendLeadAlert` payload inline, maintaining complexity in the API route.

**The User's Critique:**
> "You are editing the files to follow the new schema you made. and not actually making a plan to make the thing centralized."

This is correct. 
1.  **Architecture Violation**: By forcing the API route to map `body.quizData` fields manually into the `EmailService` payload structure, I kept the *filtering logic* inside the API route.
2.  **Vibe Coding**: I jumped into editing `contact-submit.ts` (Step 230 view) without updating the plan to explicitly define *how* `contact-submit` should interface with `EmailService`.

## Corrective Architecture (The "Centralized" Way)
The API route should be **dumb**. It should not know about "schema mapping". It should just pass the `body` to the service.

**Wrong (Current):**
```typescript
// inside API route
await EmailService.sendLeadAlert({
    email: body.email,
    funnelSegment: body.funnelSegment,
    revenuePotential: body.quizData?.revenuePotential, // <-- Logic leaking here
    state: body.quizData?.state,                       // <-- Logic leaking here
    // ...
});
```

**Right (Centralized):**
```typescript
// inside API route
await EmailService.handleLeadInput(body); // <-- The Service handles the mapping/normalization
```

## Immediate Actions
1.  **Stop Editing**: Do not touch `contact-submit.ts` yet.
2.  **Update Service**: Ensure `EmailService` can accept the *raw* API payloads so the mapping logic lives in ONE place (the Service), not scattered across the API files.
3.  **Replanning**: Write a focused plan for *integration* that minimizes code in the API routes.

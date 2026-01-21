# ERPNext/Frappe CRM Setup Plan for Childcare Business Plan

> **Document Purpose**: Complete implementation plan for setting up your ERPNext Triple Stack (ERPNext + Frappe CRM + Frappe LMS) and connecting it to your Astro frontend for lead capture and CRM functionality.
>
> **Server**: `150.136.42.8` (Oracle Cloud ARM64)
> **Site**: `portal.childcarebusinessplan.com`

---

## 📋 Executive Summary

This plan covers:
1. **Server Health Check** - Verify the production deployment is running
2. **ERPNext/Frappe Configuration** - Set up CRM, Lead capture, email integration
3. **API Integration** - Connect Astro frontend to Frappe backend
4. **Email Automation** - Set up email sequences for leads
5. **Portal Setup** - Customer portal for paid members

---

## Phase 1: Server Health Check & Initial Access

### 1.1 Verify Server Status

**SSH Access:**
```bash
# From production directory
ssh -i server_key.pem ubuntu@150.136.42.8
```

**Check Container Status:**
```bash
cd /opt/ccbusinessplan
docker compose ps
```

Expected services:
- `backend` (Frappe/ERPNext worker)
- `frontend` (NGINX/webserver)
- `queue-default`, `queue-long`, `queue-short` (background jobs)
- `scheduler` (task scheduler)
- `websocket` (real-time updates)
- `mariadb` (database)
- `redis-cache`, `redis-queue` (caching/queue)

### 1.2 Verify Site Accessibility

- [ ] Access `https://portal.childcarebusinessplan.com`
- [ ] Verify login works: `Administrator` / `@sodium1223`
- [ ] Check installed apps: ERPNext, CRM, LMS

### 1.3 Check Installed Frappe Apps

```bash
docker compose exec backend bench --site portal.childcarebusinessplan.com list-apps
```

**Expected:**
- frappe
- erpnext
- crm
- lms

---

## Phase 2: CRM Configuration in Frappe

### 2.1 Lead DocType Setup

Navigate to: `Setup > Customize Form > Lead`

**Create Custom Fields for Childcare Leads:**

| Field Name | Field Type | Options | Description |
|------------|------------|---------|-------------|
| `funnel_type` | Select | Startup\nGrowth | Which funnel they came from |
| `quiz_completed` | Check | - | If they completed the quiz |
| `quiz_state` | Data | - | State from quiz selection |
| `quiz_business_type` | Select | Home-based\nCenter-based | Business type from quiz |
| `quiz_capacity` | Int | - | Capacity from quiz |
| `quiz_revenue_potential` | Currency | - | Calculated revenue from quiz |
| `source_page` | Data | - | Landing page URL |
| `utm_source` | Data | - | UTM tracking |
| `utm_medium` | Data | - | UTM tracking |
| `utm_campaign` | Data | - | UTM tracking |

### 2.2 Lead Source Configuration

Navigate to: `CRM > Settings > Lead Source`

**Create Lead Sources:**
- Website Calculator
- Email Capture Modal
- Blog Post
- Pricing Page Checkout
- Contact Form

### 2.3 Lead Status Workflow

Navigate to: `CRM > Settings > Lead Status`

**Create Statuses:**
1. `New` - Just captured email
2. `Quiz Completed` - Completed the quiz funnel
3. `Nurturing` - In email sequence
4. `Engaged` - Opened/clicked emails
5. `Hot Lead` - Visited pricing page
6. `Trial` - Started free content
7. `Qualified` - Ready for offer
8. `Customer` - Converted to paid
9. `Churned` - Lost/unsubscribed

---

## Phase 3: API Integration (Astro ↔ Frappe)

### 3.1 Create Frappe API Key

```bash
# SSH into server
docker compose exec backend bench --site portal.childcarebusinessplan.com console
```

```python
# In the console
import frappe

# Create API user or use Administrator
user = frappe.get_doc("User", "Administrator")

# Generate API keys
api_keys = frappe.generate_hash(length=15)
api_secret = frappe.generate_hash(length=15)

user.api_key = api_keys
user.api_secret = api_secret
user.save()

print(f"API Key: {api_keys}")
print(f"API Secret: {api_secret}")
frappe.db.commit()
```

### 3.2 Create API Endpoint in Astro

**File: `src/pages/api/capture-lead.ts`**

```typescript
import type { APIRoute } from 'astro';

export const prerender = false;

const FRAPPE_URL = import.meta.env.FRAPPE_URL || 'https://portal.childcarebusinessplan.com';
const FRAPPE_API_KEY = import.meta.env.FRAPPE_API_KEY;
const FRAPPE_API_SECRET = import.meta.env.FRAPPE_API_SECRET;

interface LeadData {
  email: string;
  funnelType: 'startup' | 'growth';
  quizData?: {
    state?: string;
    businessType?: 'Home-based' | 'Center-based';
    capacity?: number;
    revenuePotential?: number;
  };
  sourcePage?: string;
  utmParams?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body: LeadData = await request.json();
    
    // Create lead in Frappe
    const frappeResponse = await fetch(`${FRAPPE_URL}/api/resource/Lead`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `token ${FRAPPE_API_KEY}:${FRAPPE_API_SECRET}`,
      },
      body: JSON.stringify({
        data: {
          email_id: body.email,
          lead_name: body.email.split('@')[0],
          source: 'Website Calculator',
          status: body.quizData ? 'Quiz Completed' : 'New',
          funnel_type: body.funnelType,
          quiz_completed: !!body.quizData,
          quiz_state: body.quizData?.state,
          quiz_business_type: body.quizData?.businessType,
          quiz_capacity: body.quizData?.capacity,
          quiz_revenue_potential: body.quizData?.revenuePotential,
          source_page: body.sourcePage,
          utm_source: body.utmParams?.source,
          utm_medium: body.utmParams?.medium,
          utm_campaign: body.utmParams?.campaign,
        }
      }),
    });

    if (!frappeResponse.ok) {
      const errorData = await frappeResponse.json();
      console.error('Frappe API error:', errorData);
      
      // Handle duplicate lead (already exists)
      if (errorData.exc_type === 'DuplicateEntryError') {
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Lead already exists',
          existing: true 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error('Failed to create lead');
    }

    const result = await frappeResponse.json();
    
    return new Response(JSON.stringify({ 
      success: true, 
      leadId: result.data.name 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Lead capture error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to capture lead' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
```

### 3.3 Update .env.example

**Add to `.env.example`:**
```
# Frappe/ERPNext API
FRAPPE_URL=https://portal.childcarebusinessplan.com
FRAPPE_API_KEY=your_api_key_here
FRAPPE_API_SECRET=your_api_secret_here
```

### 3.4 Update Email Capture Components

**Modify `EmailCaptureModal.tsx` to call the API:**

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setStatus('loading');

  try {
    const response = await fetch('/api/capture-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        funnelType: activeTab,
        sourcePage: window.location.pathname,
        utmParams: {
          source: new URLSearchParams(window.location.search).get('utm_source'),
          medium: new URLSearchParams(window.location.search).get('utm_medium'),
          campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
        },
      }),
    });

    if (!response.ok) throw new Error('Failed to submit');

    setStatus('success');
    // Redirect after brief delay
    setTimeout(() => {
      closeModal();
      setStatus('idle');
      setEmail('');
      window.location.href = `/thank-you?funnel=${activeTab}`;
    }, 1500);
    
  } catch (error) {
    console.error('Submission error:', error);
    setStatus('idle');
    // Show error to user
  }
};
```

---

## Phase 4: Email Integration

### 4.1 Set Up Email Domain in Frappe

Navigate to: `Setup > Email > Email Domain`

**Add Domain:**
- Domain Name: `childcarebusinessplan.com`
- Email Server: (Your email provider - Gmail, SendGrid, etc.)
- Use IMAP/SSL: Yes
- SMTP Server: smtp.gmail.com (or your provider)
- SMTP Port: 587
- Use TLS: Yes

### 4.2 Configure Email Account

Navigate to: `Setup > Email > Email Account`

**Create Account:**
- Email Address: `hello@childcarebusinessplan.com` (or your sending address)
- Enable Outgoing: Yes
- Default Outgoing: Yes
- Password/App Password: (Your email password or app-specific password)

### 4.3 Create Email Templates

Navigate to: `Setup > Email > Email Template`

**Create Templates for Each Sequence:**

**Template 1: Welcome - Startup Funnel**
```
Subject: Your Numbers Are In 🎉

Hi {lead_name},

Based on what you told us, here's what we found for {quiz_state}:

💰 Revenue Potential: ${quiz_revenue_potential:,.0f}/year
📍 Business Type: {quiz_business_type}
👶 Capacity: {quiz_capacity} children

This isn't just a number—it's your opportunity.

The next step? Understanding exactly how to get there.

[Reply to this email with your biggest question about starting your daycare.]

Talk soon,
Childcare Business Plan Team
```

**Template 2: Welcome - Growth Funnel**
```
Subject: Let's grow that business 📈

Hi {lead_name},

You're already running a daycare—which means you know the challenges.

The question isn't IF you can grow, but HOW.

Based on your situation in {quiz_state}, we've seen owners like you:
- Fill empty spots within 60 days
- Increase revenue by 40% without adding capacity
- Finally systemize operations

Let's figure out what that looks like for you.

[Reply with your #1 growth challenge right now]

Cheers,
Childcare Business Plan Team
```

### 4.4 Set Up Email Automation

Navigate to: `CRM > Settings > Lead Sources > Website Calculator`

**Create Workflow:**
1. Trigger: Lead created with source = "Website Calculator"
2. Action: Send welcome email based on `funnel_type`
3. Delay: 2 days
4. Action: Send follow-up email (value-add content)
5. Delay: 3 days
6. Action: Send case study email
7. Delay: 2 days
8. Action: Send offer email

---

## Phase 5: Customer Portal Setup

### 5.1 Enable Website Feature

Navigate to: `Setup > System Settings > Website`

- Enable: Yes
- Home Page: `/portal`

### 5.2 Create Portal User Role

Navigate to: `Setup > Users and Permissions > Role`

**Create Role: "Portal Customer"**
- Permissions:
  - Lead: Read (own records only)
  - Customer: Read (own records only)
  - Sales Order: Read (own records only)
  - LMS (if using): Full access to enrolled courses

### 5.3 Enable Portal Pages

Navigate to: `Setup > Website > Web Page`

**Create Pages:**
- `/portal` - Dashboard
- `/portal/profile` - User profile
- `/portal/orders` - Order history
- `/portal/courses` - LMS courses (if applicable)

### 5.4 Configure Portal Subdomain (Optional)

If you want the portal on a subdomain like `members.childcarebusinessplan.com`:

```nginx
# In your NGINX configuration
server {
    listen 443 ssl;
    server_name members.childcarebusinessplan.com;
    
    # Proxy to Frappe
    location / {
        proxy_pass http://backend:8000;
        # ... proxy settings
    }
}
```

---

## Phase 6: Stripe Integration with ERPNext

### 6.1 Install Payments App

```bash
docker compose exec backend bench get-app payments
docker compose exec backend bench --site portal.childcarebusinessplan.com install-app payments
```

### 6.2 Configure Stripe in Frappe

Navigate to: `Setup > Integrations > Stripe Settings`

- Stripe Publishable Key: (from Stripe Dashboard)
- Stripe Secret Key: (from Stripe Dashboard)
- Stripe Webhook Secret: (for webhook verification)

### 6.3 Sync Products

Navigate to: `Selling > Items`

Ensure your membership tiers are set up as items:
- Launchpad Tier (Monthly: $49, Yearly: $468)
- Director Tier (Monthly: $397, Yearly: $2,388)
- CEO Circle (Monthly: $1,497, Yearly: $11,976)

### 6.4 Webhook Configuration

In Stripe Dashboard, add webhook endpoint:
```
https://portal.childcarebusinessplan.com/api/method/payments.payment_gateways.doctype.stripe_settings.stripe_settings.handle_webhook
```

---

## Phase 7: MCP Configuration (For AI Agent Access)

### 7.1 Update ERPNext MCP Configuration

The ERPNext MCP server needs to be configured to point to your production server.

**Update `.gemini/settings.json`:**
```json
{
  "mcpServers": {
    "erpnext": {
      "command": "npx",
      "args": ["-y", "@arunmallya/erpnext-mcp"],
      "env": {
        "ERPNEXT_API_URL": "https://portal.childcarebusinessplan.com",
        "ERPNEXT_API_KEY": "your_api_key_here",
        "ERPNEXT_API_SECRET": "your_api_secret_here"
      }
    }
  }
}
```

### 7.2 Test MCP Connection

After updating, I can:
- Create/read/update leads
- Check customer data
- Run reports
- Manage the CRM directly through conversation

---

## 📅 Implementation Timeline

| Phase | Task | Estimated Time | Priority |
|-------|------|----------------|----------|
| 1 | Server Health Check | 30 min | 🔴 Critical |
| 2 | Lead DocType Setup | 1 hour | 🔴 Critical |
| 3.1-3.2 | API Keys & Endpoint | 1 hour | 🔴 Critical |
| 3.3-3.4 | Frontend Integration | 2 hours | 🔴 Critical |
| 4.1-4.2 | Email Configuration | 1 hour | 🟡 High |
| 4.3-4.4 | Email Templates & Automation | 2 hours | 🟡 High |
| 5 | Portal Setup | 2-3 hours | 🟢 Medium |
| 6 | Stripe Integration | 2 hours | 🟡 High |
| 7 | MCP Configuration | 30 min | 🟢 Medium |

**Total Estimated Time: 12-14 hours**

---

## 🔗 Quick Reference

### SSH Access
```bash
ssh -i production/server_key.pem ubuntu@150.136.42.8
```

### Docker Commands
```bash
cd /opt/ccbusinessplan

# Status
docker compose ps

# Logs
docker compose logs -f backend

# Console
docker compose exec backend bench --site portal.childcarebusinessplan.com console

# Backup
docker compose exec backend bench --site portal.childcarebusinessplan.com backup --with-files
```

### API Endpoints (After Setup)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/capture-lead` | POST | Capture email from frontend |
| `/api/resource/Lead` | GET/POST | Direct Frappe Lead API |
| `/api/create-checkout` | POST | Stripe checkout (existing) |

---

## ✅ Success Criteria

- [ ] Server is healthy and all containers running
- [ ] Lead DocType has custom fields for quiz data
- [ ] API endpoint captures leads from frontend
- [ ] Leads appear in Frappe CRM instantly
- [ ] Welcome email sends automatically
- [ ] MCP can interact with production CRM
- [ ] Portal login works for customers

---

## 🚨 Things to Watch Out For

1. **CORS Issues**: Ensure Frappe allows requests from your Astro domain
2. **API Rate Limits**: Frappe defaults may need adjustment for high traffic
3. **Email Deliverability**: Set up SPF, DKIM, DMARC for your domain
4. **SSL Certificates**: Ensure both sites use valid SSL
5. **Duplicate Leads**: Handle existing email addresses gracefully

---

*Created: 2026-01-20*
*Last Updated: 2026-01-20*
*Status: Ready for Implementation*

# Atlas Backend API Documentation

Base URL: `http://localhost:3000` (development)

## Authentication

All **Admin** endpoints require a `Bearer` JWT token in the `Authorization` header:
```
Authorization: Bearer <your_token>
```

Tokens are obtained from the `POST /api/auth/login` endpoint and expire based on the `JWT_EXPIRES_IN` setting (default: `1d`).

---

## 🔓 Public Endpoints (No Authentication Required)

### POST `/api/leads` — Submit Lead
Submit a new prospect lead from the Atlas website form. Cloudflare Turnstile bot-protection is enforced. After creation, AI qualification runs asynchronously (Gemini → Groq → Ollama fallback).

**Request Body:**
```json
{
  "full_name": "John Smith",
  "email": "john@example.com",
  "phone": "+61400000000",
  "company_name": "ABC Mortgage Brokers",
  "country": "Australia",
  "business_type": "Mortgage Broker",
  "industry": "Finance",
  "role": "Director",
  "website_url": "https://abcbrokers.com.au",
  "company_size": "1-10",
  "current_problem": "Manual client onboarding",
  "automation_interest": "AI assistant for workflow",
  "preferred_contact_method": "Email",
  "message": "We want to explore automation",
  "source_page": "/atlas",
  "utm_source": "linkedin",
  "utm_medium": "cpc",
  "utm_campaign": "q4-2026",
  "consent_status": true,
  "cf_turnstile_token": "<cloudflare_turnstile_token>"
}
```

**Response (`201`):**
```json
{
  "success": true,
  "lead_id": "uuid",
  "message": "Lead submitted successfully"
}
```

---

### POST `/api/auth/login` — Login
Returns a JWT token for accessing admin endpoints.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "Welcome123!"
}
```
**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "uuid", "email": "admin@example.com", "name": "Admin", "role": "SUPER_ADMIN" }
}
```

---

### POST `/api/auth/forgot-password` — Forgot Password
Sends a password reset email to the given address.

**Request Body:** `{ "email": "admin@example.com" }`

---

### POST `/api/auth/reset-password` — Reset Password
Validates the reset token and sets a new password.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "token": "<token_from_email_link>",
  "new_password": "NewSecurePassword123!"
}
```

---

### POST `/api/integrations/google/callback` — Google OAuth Callback
Handled automatically after Google OAuth redirect. Stores access/refresh tokens on the user account.

---

## 🔐 Admin Endpoints (JWT Required)

### POST `/api/auth/change-password`
Change the currently logged-in user's own password.

**Request Body:**
```json
{
  "current_password": "OldPassword123!",
  "new_password": "NewPassword456!"
}
```

---

### GET `/api/admin/dashboard`
Returns real-time CRM metrics.

**Response:**
```json
{
  "total_leads": 120,
  "new_leads_this_week": 14,
  "tier_a_leads": 6,
  "demo_requests": 4,
  "conversion_rate": 12.5,
  "leads_by_country": { "Australia": 80, "New Zealand": 22 },
  "pipeline_summary": { "New Lead": 70, "Qualified": 30 },
  "leads_by_source": { "linkedin": 50, "organic": 40 }
}
```

---

### GET `/api/admin/leads`
List all leads with optional filters.

| Query Param | Type | Description |
|---|---|---|
| `status` | string | e.g. `New Lead`, `Qualified`, `Demo Booked` |
| `tier` | string | `Tier A`, `Tier B`, `Tier C`, `Disqualified`, `Spam` |
| `country` | string | Filter by country |
| `search_keyword` | string | Searches across name, email, company |

---

### GET `/api/admin/leads/export`
Export filtered leads as a `.csv` file download. Admin action is recorded in the audit log.

*(Accepts the same query params as `GET /api/admin/leads`)*

---

### GET `/api/admin/leads/:id`
Get full details of a single lead, including internal notes and activity history.

---

### PATCH `/api/admin/leads/:id` *(Roles: SUPER_ADMIN, SALES)*
Update a lead's CRM status.

**Request Body:**
```json
{
  "status": "Qualified",
  "assigned_owner": "user-uuid",
  "next_follow_up_at": "2026-10-01T10:00:00.000Z"
}
```

---

### POST `/api/admin/leads/:id/notes` *(Roles: SUPER_ADMIN, SALES)*
Add an internal note to a lead.

**Request Body:** `{ "note": "Followed up on LinkedIn." }`

---

### DELETE `/api/admin/leads/:id` *(Role: SUPER_ADMIN only)*
Permanently delete a lead and all associated notes and activity logs. Cascades automatically. Action is recorded in the audit log.

---

### GET `/api/users/profile`
Get the current logged-in user's own profile.

---

### PATCH `/api/users/profile`
Update current user's own profile fields. Action is audit-logged.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "job_title": "Sales Manager"
}
```

---

### GET `/api/users`
List all team members (public fields: id, name, email, role, job_title, created_at).

---

### POST `/api/users/invite` *(Role: SUPER_ADMIN only)*
Create a new user with a default temporary password (`Welcome123!`). Action is audit-logged.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@company.com",
  "role": "SALES"
}
```

---

### PATCH `/api/users/:id/role` *(Role: SUPER_ADMIN only)*
Update another user's role. Action is audit-logged.

**Request Body:** `{ "role": "SALES" }`

**Available Roles:** `SUPER_ADMIN`, `SALES`, `Member`

---

### GET `/api/settings/ai-rules` *(Role: SUPER_ADMIN only)*
Get current AI feature toggle settings.

**Response:**
```json
{
  "is_ai_tiering_enabled": true,
  "is_spam_detection_enabled": true,
  "is_data_enrichment_enabled": false
}
```

---

### PATCH `/api/settings/ai-rules` *(Role: SUPER_ADMIN only)*
Toggle AI features on or off. Action is audit-logged.

**Request Body:**
```json
{
  "is_ai_tiering_enabled": true,
  "is_spam_detection_enabled": true,
  "is_data_enrichment_enabled": false
}
```

---

### PATCH `/api/settings/email-signature`
Update the current user's email signature (used in outgoing emails).

**Request Body:** `{ "signature": "Regards,\nJohn Doe\nSales Manager" }`

---

### GET `/api/integrations/google/auth`
Initiates Google OAuth flow. Redirects to Google's consent screen for Gmail and Calendar permissions.

---

### POST `/api/integrations/google/disconnect`
Revokes Google OAuth tokens for the current user.

---

### GET `/api/admin/tasks`
List CRM tasks. Filterable by `status` (`pending` or `completed`).

---

### POST `/api/admin/tasks`
Create a new task.

**Request Body:**
```json
{
  "title": "Follow up with John Smith",
  "due_at": "2026-10-05T09:00:00.000Z",
  "type": "call",
  "priority": "high",
  "lead_name": "John Smith"
}
```
**Types:** `task`, `call`, `email`, `meeting`
**Priorities:** `low`, `medium`, `high`

---

### PATCH `/api/admin/tasks/:id`
Update a task (all fields optional).

**Request Body:**
```json
{
  "title": "Updated title",
  "status": "completed"
}
```

---

### DELETE `/api/admin/tasks/:id`
Delete a task.

---

## 🔗 Webhook Endpoints (External Services)

### POST `/api/integrations/calendly/webhook`
Receives Calendly webhook events when a prospect books or cancels a demo.
- On `invitee.created`: Finds lead by email, updates status to `"Demo Booked"`, logs activity.
- On `invitee.canceled`: Updates status to `"Demo Canceled"`, logs activity.
- *Note: HMAC signature verification is planned but not yet implemented.*

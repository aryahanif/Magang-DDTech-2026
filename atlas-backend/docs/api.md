# Atlas Backend API Documentation

All API responses follow a standard JSON structure. Endpoints prefixed with `/api/admin` require a valid JWT token passed in the `Authorization` header as a Bearer token.

---

## 1. Public Endpoints

### `POST /api/leads`
Submit a new lead from the Atlas website form.

**Request Body:**
```json
{
  "full_name": "John Smith",
  "email": "john@example.com",
  "phone": "+61 412 345 678",
  "company_name": "ABC Mortgage Brokers",
  "country": "Australia",
  "business_type": "Mortgage Broker",
  "current_problem": "Manual client onboarding and document collection",
  "automation_interest": "AI assistant for broker workflow",
  "message": "We want to explore automation",
  "source_page": "/atlas",
  "utm_source": "linkedin"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "lead_id": "uuid-string",
  "message": "Lead submitted successfully"
}
```

---

## 2. Authentication

### `POST /api/auth/login`
Authenticate an admin user and retrieve a JWT token.

**Request Body:**
```json
{
  "email": "admin@atlas.ddtech.com",
  "password": "your_password"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1Ni...",
  "user": {
    "id": "uuid-string",
    "email": "admin@atlas.ddtech.com",
    "name": "Administrator",
    "role": "Super Admin"
  }
}
```

---

## 3. Admin CRM Endpoints
*(Requires `Authorization: Bearer <token>`)*

### `GET /api/admin/leads`
Fetch all leads. Supports query parameters for filtering.

**Query Parameters:**
- `status` (string)
- `tier` (string) - e.g., "Tier A"
- `country` (string)
- `search_keyword` (string) - Searches by name or company

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "full_name": "John Smith",
      "lead_tier": "Tier A",
      "status": "New Lead",
      "created_at": "2026-08-30T10:00:00.000Z"
    }
  ]
}
```

### `PATCH /api/admin/leads/:id`
Update a lead's pipeline status or assign an owner. This action is automatically recorded in the Activity Logs.

**Request Body (Partial):**
```json
{
  "status": "Demo Scheduled",
  "assigned_owner": "admin_uuid",
  "next_follow_up_at": "2026-09-05T10:00:00.000Z"
}
```

### `POST /api/admin/leads/:id/notes`
Add an internal note to a lead profile.

**Request Body:**
```json
{
  "note": "Called the prospect today. They are very interested in the AI qualification feature."
}
```

### `GET /api/admin/dashboard`
Retrieve high-level pipeline metrics for the dashboard widgets.

**Response (200 OK):**
```json
{
  "total_leads": 120,
  "new_leads_this_week": 14,
  "tier_a_leads": 6,
  "conversion_rate": 12.5
}
```

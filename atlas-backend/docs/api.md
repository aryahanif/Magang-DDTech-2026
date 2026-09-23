# Atlas Backend API Documentation

## Public Endpoints

### 1. Submit Lead
- **Method:** `POST /api/leads`
- **Purpose:** Receive lead submission from the Atlas website.
- **Request Body:**
  ```json
  {
    "full_name": "John Smith",
    "email": "john@example.com",
    "phone": "+61...",
    "company_name": "ABC Mortgage Brokers",
    "country": "Australia",
    "business_type": "Mortgage Broker",
    "current_problem": "Manual client onboarding",
    "automation_interest": "AI assistant for broker workflow",
    "message": "We want to explore automation",
    "source_page": "/atlas",
    "utm_source": "linkedin"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "lead_id": "uuid",
    "message": "Lead submitted successfully"
  }
  ```

---

## Admin Endpoints (Require Authentication)

*Note: All endpoints below require a valid JWT token in the `Authorization: Bearer <token>` header.*

### 2. Get All Leads
- **Method:** `GET /api/admin/leads`
- **Filters (Query Params):** `status`, `tier`, `country`, `source`, `search`
- **Description:** Returns a list of leads for the CRM view.

### 3. Get Lead Detail
- **Method:** `GET /api/admin/leads/:id`
- **Description:** Returns full lead details, including AI qualification summary and activity logs.

### 4. Update Lead Status
- **Method:** `PATCH /api/admin/leads/:id`
- **Request Body:**
  ```json
  {
    "status": "Qualified",
    "assigned_owner": "user-uuid"
  }
  ```

### 5. Add Internal Note to Lead
- **Method:** `POST /api/admin/leads/:id/notes`
- **Request Body:**
  ```json
  {
    "note": "Followed up on LinkedIn. Waiting for reply."
  }
  ```

### 6. Admin Dashboard Metrics
- **Method:** `GET /api/admin/dashboard`
- **Response:**
  ```json
  {
    "total_leads": 120,
    "new_leads_this_week": 14,
    "tier_a_leads": 6,
    "demo_requests": 4,
    "conversion_rate": 12.5,
    "leads_by_country": {
      "Australia": 80,
      "New Zealand": 22
    }
  }
  ```

### 7. Export Leads
- **Method:** `GET /api/admin/leads/export`
- **Description:** Returns a CSV file of leads matching the applied query filters.

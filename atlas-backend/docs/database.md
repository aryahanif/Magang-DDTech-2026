# Database Schema Documentation

Atlas uses **PostgreSQL** with **Prisma ORM** (via `@prisma/adapter-pg`).

You can inspect the schema visually by running:
```bash
npx prisma studio
```

---

## Models & Fields

### 1. `Lead` (table: `leads`)
The core table storing every prospect that submits a form on the Atlas website.

| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| full_name | String? | Prospect's full name |
| email | String | Email (required) |
| phone | String? | Phone number |
| company_name | String? | Company name |
| country | String? | Country (used for scoring) |
| business_type | String? | e.g. "Mortgage Broker", "Finance Broker" (used for scoring) |
| industry | String? | Industry sector |
| role | String? | Prospect's job role |
| website_url | String? | Company website |
| company_size | String? | e.g. "1-10", "11-50" |
| current_problem | String? | Pain point description |
| automation_interest | String? | What they want automated |
| preferred_contact_method | String? | e.g. "Email", "Phone" |
| message | String? | Free-text message |
| source_page | String? | Which page they submitted from |
| utm_source | String? | Marketing attribution |
| utm_medium | String? | Marketing attribution |
| utm_campaign | String? | Marketing attribution |
| consent_status | Boolean? | GDPR consent checkbox |
| consent_at | DateTime? | When consent was given |
| lead_score | Int? | Rule-based score (1–5) based on country + business type + intent |
| lead_tier | String? | AI-assigned: `Tier A`, `Tier B`, `Tier C`, `Disqualified`, `Spam` |
| fit_status | String? | AI-assigned: `Good Fit`, `Potential`, `Unlikely` |
| qualification_summary | String? | AI-generated summary |
| recommended_next_action | String? | AI-generated next action |
| urgency_level | String? | AI-assigned: `High`, `Medium`, `Low` |
| status | String? | CRM status, default: `New Lead` |
| assigned_owner | String? | ID of assigned team member (User) |
| next_follow_up_at | DateTime? | Scheduled follow-up time |
| created_at | DateTime | Auto-set on creation |
| updated_at | DateTime | Auto-updated |

**Relations:** Has many `LeadNote`, has many `LeadActivityLog`.

---

### 2. `LeadNote` (table: `lead_notes`)
Internal notes written by the DDTech team about a specific lead.

| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| lead_id | UUID | FK → Lead (`onDelete: Cascade`) |
| note | String? | The note content |
| created_by | String? | Name or ID of the user who wrote the note |
| created_at | DateTime | Auto-set on creation |

---

### 3. `LeadActivityLog` (table: `lead_activity_logs`)
An immutable audit trail for every lifecycle event of a lead.

| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| lead_id | UUID | FK → Lead (`onDelete: Cascade`) |
| activity_type | String? | e.g. `STATUS_UPDATE`, `DEMO_SCHEDULED`, `DEMO_CANCELED`, `DUPLICATE_FLAGGED`, `OWNER_ASSIGNED` |
| description | String? | Human-readable description of the event |
| metadata | Json? | Additional structured data |
| created_at | DateTime | Auto-set on creation |

---

### 4. `User` (table: `users`)
DDTech team members who can log in to the admin dashboard.

| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| name | String? | Display name |
| email | String? | Unique email address |
| role | String? | `SUPER_ADMIN`, `SALES`, or `Member` |
| job_title | String? | e.g. "Sales Manager" |
| password_hash | String? | bcrypt-hashed password |
| reset_password_token | String? | SHA-256 hashed reset token |
| reset_password_expires | DateTime? | Token expiry (1 hour) |
| google_access_token | String? | Google OAuth access token |
| google_refresh_token | String? | Google OAuth refresh token |
| email_signature | String? | User's personal email signature |
| created_at | DateTime | Auto-set on creation |

**Relations:** Has many `AdminActivityLog`.

---

### 5. `Task` (table: `tasks`)
CRM follow-up tasks created by the team against leads.

| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| title | String | Task title (required) |
| due_at | DateTime | Due date/time (required) |
| type | String | `task`, `call`, `email`, or `meeting` |
| priority | String | `low`, `medium`, or `high` |
| status | String | `pending` or `completed` |
| lead_name | String? | Name of the associated lead |
| created_by | String? | UUID of the user who created it |
| created_at | DateTime | Auto-set on creation |
| updated_at | DateTime | Auto-updated |

---

### 6. `SystemSetting` (table: `system_settings`)
Singleton configuration table for AI feature toggles. Managed by SUPER_ADMIN via the settings dashboard.

| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| is_ai_tiering_enabled | Boolean | Enable/disable AI lead tiering (default: `true`) |
| is_spam_detection_enabled | Boolean | Enable/disable spam detection (default: `true`) |
| is_data_enrichment_enabled | Boolean | Enable/disable data enrichment (default: `false`) |
| updated_at | DateTime | Auto-updated |

---

### 7. `AdminActivityLog` (table: `admin_activity_logs`)
A centralized audit log recording significant admin actions across the system.

| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| admin_user_id | UUID | FK → User (`onDelete: Cascade`) |
| action | String | e.g. `LOGIN`, `EXPORT_LEADS`, `DELETE_LEAD`, `INVITE_USER`, `UPDATE_SETTINGS`, `UPDATE_PROFILE`, `UPDATE_USER_ROLE` |
| resource | String? | The affected area e.g. `Auth`, `Leads`, `Users`, `SystemSettings` |
| details | String? | Human-readable description |
| metadata | Json? | Additional structured context |
| created_at | DateTime | Auto-set on creation |

---

## Entity Relationship Diagram

```
User ──────────── AdminActivityLog
  │
  └─── (assigned_owner on Lead, not a FK relation)

Lead ──────────── LeadNote
  │
  └────────────── LeadActivityLog

Task (standalone, lead_name is a plain string, not a FK)

SystemSetting (singleton, no FK relations)
```

# Database Schema Documentation

Atlas uses PostgreSQL and Prisma ORM.

## Entity Relationship Summary

The schema is built around the `Lead` model.

### 1. `Lead`
The core table storing captured prospects from the website form.
- Contains scoring (`lead_score`, `lead_tier`) assigned by the rule-based engine and AI qualification module.
- Tracks CRM state (`status`, `assigned_owner`).

### 2. `LeadNote`
Stores internal comments and notes made by the DDTech team regarding a specific `Lead`.
- Relation: `Lead` (1) to `LeadNote` (many).

### 3. `LeadActivityLog`
An audit trail mapping the lifecycle of a `Lead`. Automatically created when a lead is qualified, updated, or emailed.
- Relation: `Lead` (1) to `LeadActivityLog` (many).

### 4. `User`
Stores DDTech team members (Admins, Sales, Viewers) who can access the dashboard.
- Includes role-based access fields (`role`).
- Authenticated via JWT (`password_hash`).

### 5. `AdminActivityLog`
A system-wide audit log to track significant actions by administrators (Login, Export CSV, User Invite, Settings modifications).
- Relation: `User` (1) to `AdminActivityLog` (many).

## Generating ERD Diagram

If you need a visual representation of the schema, you can use the open-source `prisma-erd-generator` or view it dynamically using Prisma Studio:
```bash
npx prisma studio
```

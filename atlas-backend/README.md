# Atlas Backend MVP

Atlas is DDTech's AI Workforce Platform. This backend system is designed to capture website visitors and ANZ mortgage broker prospects, transforming them into highly qualified sales conversations.

## 📌 Project Overview
This repository contains the Node.js (NestJS) backend for the Atlas CRM MVP. 

**Key Features:**
- **Lead Capture:** API to receive submissions from the Atlas website.
- **AI-Assisted Qualification:** Hybrid rule-based & AI (Gemini) lead qualification engine.
- **CRM Pipeline:** Lead management, status updates, and internal notes.
- **Admin Dashboard:** Pipeline metrics and conversions.
- **Email Notifications:** Instant alerts for the DDTech sales team via Resend.

## 📂 Documentation Structure
To keep this README clean, detailed documentation is split into separate files:
- [API Documentation](docs/api.md) - Details on all public and protected API endpoints.
- [Deployment & Setup Guide](docs/deployment.md) - Step-by-step instructions to run the server locally or in production.

## 🔐 Environment Variables
To run this project, you must configure a `.env` file in the root directory. 

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (e.g., `postgresql://user:pass@localhost:5432/atlas_db`) |
| `JWT_SECRET` | Secret key used to sign and verify Admin authentication tokens |
| `JWT_EXPIRES_IN` | Token validity duration (e.g., `1d` for 1 day) |
| `GEMINI_API_KEY` | Google Gemini API key for the AI Qualification Engine |
| `RESEND_API_KEY` | Resend API key for sending email notifications |
| `EMAIL_FROM` | The sender address for notifications (e.g., `onboarding@resend.dev`) |
| `SALES_EMAIL_TO` | The inbox address that receives new lead alerts |

*(Note: Never commit your real `.env` file to the repository. Use `.env.example` as a template).*

## 👨‍💻 Admin User Setup
The MVP includes a secure login system. To generate the first Super Admin account, you must run the database seeder:
```bash
npx prisma db seed
```
**Default Credentials:**
- **Email:** `admin@atlas.ddtech.com`
- **Password:** `rahasia_negara_123`

## 💾 Backup and Restore Procedure
Since we are using PostgreSQL, standard `pg_dump` commands apply.
**Backup:**
```bash
pg_dump -U postgres -h localhost -p 5433 -F c -d atlas_db -f atlas_backup.dump
```
**Restore:**
```bash
pg_restore -U postgres -h localhost -p 5433 -d atlas_db -1 atlas_backup.dump
```

## ⚠️ Known Limitations (MVP Scope)
- **Single-Tenant Only:** Currently built for DDTech internal use. Multi-tenant architecture for clients is not yet implemented.
- **Manual Deletion:** Data privacy deletion requests must be handled manually via Prisma Studio or SQL queries.
- **File Uploads:** The current intake API does not support file attachments (e.g., PDF uploads).

## 🚀 Future Roadmap
Once the MVP proves commercial traction, planned features include:
1. Customer/Client workspaces
2. Integration marketplace (HubSpot, Pipedrive, Salesforce)
3. Advanced analytics per client
4. Billing and subscriptions
5. Broker-specific automation modules

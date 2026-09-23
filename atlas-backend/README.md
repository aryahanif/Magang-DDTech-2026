# Atlas Backend MVP

This is the backend for Atlas, DDTech's AI Workforce Platform. Built with **NestJS**, **Prisma**, and **PostgreSQL**.

## 🚀 Environment Setup

1. Copy `.env.example` to `.env` and fill in all required values:
   ```bash
   cp .env.example .env
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Apply the database schema:
   ```bash
   npx prisma db push
   ```
4. Start the development server:
   ```bash
   npm run start:dev
   ```
   The API will be available at `http://localhost:3000`.

## 👤 Admin User Setup Guide

When running for the first time, you need to create the initial Super Admin account.

1. Ensure `.env` is configured (especially `DATABASE_URL`).
2. Run the seed script:
   ```bash
   npm run seed
   ```
3. The seeder will create an initial Super Admin user. Log in at the frontend with those credentials and immediately change the password via `POST /api/auth/change-password`.

## 💾 Backup and Restore Procedure

The application includes a backup script based on `pg_dump`.

**Prerequisites:**
- Install [PostgreSQL for Windows](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads) and ensure the `bin/` folder (containing `pg_dump.exe`) is added to your System PATH.
- Alternatively, if using Docker, use `docker exec` to run `pg_dump` inside the container.

**Run Backup:**
```bash
npm run backup
```
The backup file is saved to the `backups/` directory with a timestamp. This folder is excluded from Git via `.gitignore`.

**Restore from Backup:**
```bash
psql "postgresql://user:password@localhost:5432/atlas_db" -f backups/atlas-db-backup-YYYY-MM-DD.sql
```

## ⚠️ Known Limitations

- **Calendly Webhook HMAC verification not implemented:** The webhook endpoint at `/api/integrations/calendly/webhook` accepts all requests without signature verification. This is a security risk in production.
- **No Multi-tenant Architecture:** Designed for DDTech's single-tenant internal use as an MVP.
- **AI Rate Limits:** On the Gemini Free Tier, the SDK silently retries on `503` errors, which can cause background qualification tasks to hang for up to 5 minutes. Groq fallback mitigates this.
- **No File Storage:** The system does not process or store file uploads (e.g., to S3).
- **Hardcoded AI Prompts:** Lead qualification prompts are embedded in code, not configurable from the dashboard.
- **Admin Module is Empty:** `src/modules/admin/admin.module.ts` is a shell with no functionality.

## 🗺️ Future Improvement List (Roadmap)

- Implement Calendly webhook HMAC signature verification.
- Multi-tenant architecture and per-client workspaces.
- AI prompt management via the settings dashboard.
- Billing and Stripe subscription integration.
- Per-client analytics and enhanced reporting.
- Integration marketplace (HubSpot, Pipedrive, Zoho, Airtable, etc.).
- Client-facing API access with API keys.

## 📚 Documentation

- **[API Documentation](./docs/api.md)** — All HTTP endpoints, request/response shapes
- **[Database Schema](./docs/database.md)** — All Prisma models and their fields
- **[Deployment Guide](./docs/deployment.md)** — How to deploy to production

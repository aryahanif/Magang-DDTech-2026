# Atlas Backend MVP

This is the backend for Atlas, DDTech's AI Workforce Platform. Built with NestJS, Prisma, and PostgreSQL.

## 🚀 Environment Setup

1. Copy `.env.example` to `.env` and fill in the required values.
   ```bash
   cp .env.example .env
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the database and run migrations:
   ```bash
   npx prisma db push
   ```

## 🛠️ Admin User Setup Guide

When you run the application for the first time, a default Super Admin account is needed to manage the system.

1. Ensure the `.env` file has the `ADMIN_EMAIL` configured.
2. Run the seed script:
   ```bash
   npm run seed
   ```
3. The script will create an admin user with the configured email and a default password (`Welcome123!`).

## 💾 Backup and Restore Procedure

The application includes an automated script for backing up the PostgreSQL database using `pg_dump`.

**Prerequisites:** Ensure PostgreSQL tools (specifically `pg_dump`) are installed and added to your System PATH.

**Run Backup:**
```bash
npm run backup
```
The backup will be stored as an SQL file in the `backups/` directory (e.g., `atlas-db-backup-YYYY-MM-DD.sql`).

**Restore:**
To restore a backup, use the `psql` command line tool:
```bash
psql "postgresql://user:password@localhost:5432/atlas_db" -f backups/your-backup-file.sql
```

## ⚠️ Known Limitations

- **No Multi-tenant Architecture**: The system is designed for DDTech's internal use as an MVP.
- **Single External AI Provider**: AI integrations currently rely heavily on third-party APIs (Gemini/Groq). Rate limits on the Free Tier may delay lead qualification.
- **No Native File Storage**: The system does not currently process or store file uploads natively (e.g., S3).
- **Hardcoded Prompts**: AI prompts for lead qualification are embedded in the application code, not manageable via the dashboard.

## 🗺️ Future Improvement List (Roadmap)

- Multi-tenant architecture and Customer workspaces.
- AI assistant configuration and prompt management via the dashboard.
- Billing, subscription, and Stripe integration.
- Analytics per client and dashboard enhancements.
- Broker-specific automation modules.
- Integration marketplace (HubSpot, Pipedrive, Zoho, Airtable, etc.).
- API access for clients.

## 📚 Documentation
- **[API Documentation](./docs/api.md)**
- **[Database Schema](./docs/database.md)**
- **[Deployment Guide](./docs/deployment.md)**

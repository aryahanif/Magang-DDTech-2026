# Deployment & Setup Guide

This guide covers the necessary steps to set up the Atlas Backend locally for development, and considerations for deploying to production.

## 🛠 Local Development Setup

### Prerequisites
1. Node.js (v18 or higher recommended)
2. Docker & Docker Compose (for the local PostgreSQL database)
3. Git

### Step-by-Step Installation

1. **Install Dependencies**
   Navigate to the backend directory and run:
   ```bash
   npm install
   ```

2. **Start the Database**
   The project includes a `docker-compose.yml` file pre-configured for PostgreSQL.
   ```bash
   docker-compose up -d
   ```
   *(This starts the database on port `5433` to avoid conflicts).*

3. **Configure Environment Variables**
   Create a `.env` file in the root directory. Ensure all required keys (`DATABASE_URL`, `JWT_SECRET`, `GEMINI_API_KEY`, etc.) are filled correctly.

4. **Synchronize Database Schema**
   Push the Prisma schema to the database:
   ```bash
   npx prisma db push
   ```

5. **Seed the Database (First-time only)**
   Create the initial Super Admin account:
   ```bash
   npx prisma db seed
   ```

6. **Start the NestJS Server**
   ```bash
   npm run start:dev
   ```
   The API will now be available at `http://localhost:3000`.

## 🌐 Production Deployment Considerations

When moving to a production environment (such as AWS, Render, Railway, or VPS), ensure the following:

- **Environment Configuration:** Never commit `.env` files. Use your hosting provider's Secrets/Environment Variables manager.
- **Database Migrations:** Instead of `db push`, use Prisma migrations for production:
  ```bash
  npx prisma migrate deploy
  ```
- **Build Step:** Always build the NestJS application before starting:
  ```bash
  npm run build
  npm run start:prod
  ```
- **HTTPS & SSL:** Ensure the API is sitting behind a reverse proxy (e.g., Nginx, Caddy, or a Load Balancer) that terminates SSL/HTTPS. The `POST /api/leads` endpoint must be secure.
- **Node Environment:** Set `NODE_ENV=production` to enable caching and disable debugging logs.

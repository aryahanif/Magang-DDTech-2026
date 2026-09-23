# Deployment Guide

The Atlas backend can be deployed easily on modern PaaS platforms (AWS Elastic Beanstalk, Render, Railway, or Heroku) or on a traditional VPS.

## Standard PaaS Deployment (Render, Railway, Heroku)

1. **Connect Repository:** Connect your GitHub repository to the hosting provider.
2. **Set Build Command:**
   ```bash
   npm install && npx prisma generate && npm run build
   ```
3. **Set Start Command:**
   ```bash
   npm run start:prod
   ```
4. **Environment Variables:** Define all variables from `.env.example` in the hosting provider's dashboard.
   *Ensure `NODE_ENV=production` is set so the HTTPS enforcement middleware applies correctly.*

## Database Migrations in Production

When deploying a new schema change, you should run database migrations before the app starts:

```bash
npx prisma db push
# OR
npx prisma migrate deploy
```
*(In PaaS like Render, you can specify this in the "Pre-deploy Command" setting).*

## HTTPS Enforcement

The backend is configured to trust the `x-forwarded-proto` header in production. As long as your hosting provider uses a reverse proxy or load balancer (which handles SSL termination), the backend will automatically redirect HTTP traffic to HTTPS.

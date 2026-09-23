# Atlas Frontend MVP 🚀

Welcome to the **Atlas Frontend**, the user interface for DDTech's AI Workforce Platform. This frontend application is responsible for capturing public leads via high-converting intake forms and providing a secure, comprehensive CRM Dashboard for internal administrators to manage the sales pipeline.

## 📌 Key Features

### Public-Facing (Lead Generation)
- **Dynamic Intake Forms:** Beautiful, responsive forms for Waitlist, Assessment, and Contact Sales.
- **Robust Validation:** Real-time form validation powered by Vee-Validate and Zod.
- **Anti-Bot Protection:** Integrated with Cloudflare Turnstile to prevent spam and malicious bot submissions.
- **Dark/Light Mode:** Seamless theme switching supported natively across all public views.

### Internal Admin (CRM Dashboard)
- **Secure Authentication:** JWT-based route guarding.
- **Kanban Pipeline:** Interactive drag-and-drop board (`PipelineView.vue`) for visual lead stage tracking.
- **Data Tables:** Comprehensive leads table (`LeadsView.vue`) with sorting, filtering, and pagination.
- **Lead Detail Management:** In-depth view (`LeadDetailView.vue`) displaying AI qualification results, activity logs, system notes, and task scheduling.
- **Real-Time Notifications:** In-app notification bell with local-storage read state persistence.

---

## 🛠 Tech Stack

- **Framework:** Vue 3 (Composition API)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (v4) + Headless UI components
- **Icons:** Lucide-Vue-Next
- **State Management & Routing:** Vue Router
- **Form Handling:** Vee-Validate + Zod schema validation
- **HTTP Client:** Axios / native Fetch via custom API utilities

---

## 🔐 Environment Variables

Create a `.env` (or `.env.local` for local development) at the root of the `atlas-frontend` directory. 

| Variable | Required | Description | Example |
|---|---|---|---|
| `VITE_API_URL` | Yes | The base URL pointing to the NestJS backend API. | `http://localhost:3000` |
| `VITE_TURNSTILE_SITE_KEY` | Yes | Cloudflare Turnstile Site Key for form protection. | `1x00000000000000000000AA` |

> **Warning:** Never commit your actual `.env` file containing production keys to version control.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 1. Installation
Clone the repository and install the dependencies:
```sh
cd atlas-frontend
npm install
```

### 2. Development Server
Start the Vite development server with Hot-Module Replacement (HMR):
```sh
npm run dev
```
The application will typically be available at `http://localhost:5173`.

### 3. Production Build
Type-check and compile the application for production deployment:
```sh
npm run build
```
The optimized static files will be generated in the `dist/` directory.

---

## 📂 Folder Structure

```text
atlas-frontend/
├── public/                 # Static assets (favicons, manifest)
├── src/
│   ├── assets/             # CSS files (Tailwind imports) and static images
│   ├── components/         # Reusable Vue components (Forms, Navbar, Modals)
│   ├── composables/        # Shared Vue composables (e.g., useToast)
│   ├── router/             # Vue Router configuration and Route Guards
│   ├── services/           # External API configurations (Axios config)
│   ├── utils/              # Helper functions and utilities
│   ├── views/              # Page-level components
│   │   ├── auth/           # Login & Password Reset views
│   │   ├── admin/          # CRM Dashboard, Leads, and Pipeline views
│   │   └── public/         # Assessment, Waitlist, and Contact views
│   ├── App.vue             # Root component
│   └── main.ts             # Application entry point
├── .env.example            # Template for environment variables
├── index.html              # HTML entry point
├── package.json            # Project dependencies and scripts
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite bundler configuration
```

---

## 💻 Recommended IDE Setup

For the best developer experience, we recommend:
- **Editor:** [Visual Studio Code](https://code.visualstudio.com/)
- **Extensions:**
  - [Vue - Official (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (Ensure Vetur is disabled if installed).
  - [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
  - [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

---

## 🚢 Deployment Guide

The `dist/` folder created by `npm run build` contains static files that can be deployed to any static host.

### Vercel / Netlify
1. Connect your repository.
2. Set the Build Command to `npm run build`.
3. Set the Output Directory to `dist`.
4. Ensure you add `VITE_API_URL` and `VITE_TURNSTILE_SITE_KEY` in the hosting provider's Environment Variables settings.

### Nginx / Apache (VPS)
If hosting manually, ensure your web server is configured to handle Single Page Application (SPA) routing by redirecting all 404 traffic to `index.html`.

**Nginx Example:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/atlas-frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

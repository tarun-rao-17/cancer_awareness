# Deploying to Vercel

This project is prepared for Vercel static hosting with API routes.

Quick steps:

1. Install dependencies and build locally:

```powershell
cd C:\Users\2004r\Desktop\intern\reactproj
npm install
npm run build
```

2. Deploy to Vercel (recommended via Vercel CLI):

```powershell
npm i -g vercel
vercel login
vercel --prod
```

Notes:
- API functions live under `/api/*.js` (e.g. `/api/send-message`, `/api/track`). These are serverless functions and will appear in Vercel logs.
- Do NOT rely on writing to local disk in production; the example functions simply `console.log(...)` the payloads. For real operation, wire the functions to SendGrid, a DB, or a third-party service and store credentials as Vercel Environment Variables.
- The local `server/api.js` is kept for local development convenience only and is excluded from deployment via `.vercelignore`.

Environment variables you might add in Vercel dashboard:
- `SENDGRID_API_KEY` — if you add SendGrid mail sending.

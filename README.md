# Cancer Awareness (React + Vite)

A lightweight React app (Vite) with an aesthetic UI: star background, glassmorphism hero/cards, an inspirational quote slider, and a contact form wired to serverless endpoints.

Prerequisites
- Node.js >= 20.19
- npm

Quick start
1. Install
   npm install
2. Dev
   npm run dev
3. Build / Preview
   npm run build
   npm run preview

API (serverless)
- POST /api/send-message — contact form (expects { name, email, message })
- POST /api/track — lightweight analytics (expects { event, details })

Notes
- Quotes are served from public/quotes.json.
- For production email/storage, configure a provider (SendGrid, Supabase, etc.) via environment variables.
- Deploy: push to Git and import to Netlify.

- 
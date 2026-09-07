# Riverbend Public School — Management Website

A full school management website: a public school site, a Google-Forms-style
form builder with WhatsApp sharing and CSV export, and an AI question-paper
generator powered by Gemini — all backed by Supabase.

## Stack

- React 18 + React Router — frontend
- Tailwind CSS — styling
- Supabase — Postgres database, Auth, Storage
- Supabase Edge Functions (Deno) — secure server-side Gemini calls
- pdfjs-dist — in-browser syllabus PDF text extraction
- jsPDF / html2canvas — paper PDF export
- PapaParse — CSV export of form responses

## 1. Install dependencies

```bash
npm install
```

## 2. Set up Supabase

1. Create a project at https://supabase.com.
2. In the SQL editor, run `supabase/schema.sql`. This creates every table,
   enables Row Level Security, and creates the four storage buckets
   (`school-assets`, `gallery`, `syllabus-files`, `form-uploads`).
3. Under **Authentication → Users**, create your first admin user (email +
   password). The schema's trigger automatically gives every new user the
   `admin` role — this is the only role in this app, so only create accounts
   for people who should have admin access.
4. Copy `.env.example` to `.env` and fill in:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
   Both values are from **Project Settings → API** and are safe to ship in
   frontend code — they only grant what your RLS policies allow.

## 3. Deploy the Gemini Edge Functions

The Gemini API key must never reach the browser, so all AI calls go through
two Supabase Edge Functions.

```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase secrets set GEMINI_API_KEY=your-gemini-api-key
supabase functions deploy generate-paper
supabase functions deploy modify-paper
```

## 4. Run locally

```bash
npm run dev
```

Visit `http://localhost:5173`. The public site, `/forms`, and any published
form are open to everyone. `/admin` requires the admin login you created in
step 2.

## 5. Build for production

```bash
npm run build
```

Deploy the `dist/` folder to any static host (Vercel, Netlify, Cloudflare
Pages, etc). The Supabase project (database + Edge Functions) is your
backend — no separate Node server is needed.

## Project structure

```
src/
  components/     shared UI (Header, Footer, ProtectedRoute, Toast, ...)
  pages/          public + admin/ pages, wired up by React Router
  layouts/        PublicLayout, AdminLayout
  features/
    forms/        form builder, field catalogue, public form renderer
    paperGenerator/  AI chat + paper preview components
  lib/            supabaseClient, geminiService, pdfText, csv helpers
  services/       typed data-access functions per table
supabase/
  schema.sql              tables, RLS policies, storage buckets
  functions/
    generate-paper/       Edge Function — Gemini paper generation
    modify-paper/         Edge Function — Gemini paper editing via chat
```

## Security notes

- The Gemini API key and the Supabase **service-role** key are never used in
  frontend code — only the public anon key is, and RLS policies restrict
  what it can do (e.g. only authenticated users can read `generated_papers`
  or write to `forms`/`notices`/`gallery`; anyone can submit a response to a
  published form or a contact message).
- `syllabus-files` and `form-uploads` storage buckets are private; only
  admins can list or download their contents.
- WhatsApp sharing opens `wa.me` with a pre-filled message for the admin to
  send manually — the app does not send WhatsApp messages on its own behalf,
  since that requires the separate WhatsApp Business API.

## What's stubbed vs. real

Everything in this repo is real, working code against the Supabase schema
above — there's no mock data layer. The one piece you must supply yourself
is a Gemini API key (Google AI Studio) set as an Edge Function secret; the
app has no way to generate one for you.

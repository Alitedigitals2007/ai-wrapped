# AI Wrapped 🪄

**"Discover how AI sees you."**

A premium, mobile-first web app that turns a person's AI conversations into a
Spotify Wrapped–style experience — animated full-screen cards, skill scores,
personality analysis, career matches, badges, predictions, and a shareable
PNG. No accounts required for users; a password-protected admin dashboard
shows every submission.

## Features

- **Landing page** — hero, how it works, features, FAQ, footer (SEO-friendly, light + dark, animated)
- **5-step Generate flow** — username → pick AI → confirm popup → copy engineered prompt → paste AI's response → animated "Building your Wrapped…" loading
- **12-card Wrapped viewer** — swipe on mobile, buttons + keyboard on desktop, each card can be downloaded or shared individually with captions
- **Share card** — Download PNG (html-to-image), native Share / copy link, Generate Again
- **Compare by code** — every Wrapped gets a unique 6-character code on its share card; enter two codes on `/compare` to battle two Wraps head-to-head (scores + key cards side by side)
- **Analysis engine** — structured JSON with personality, 8 scores, language habits, interests, productivity, career matches, strengths, fun facts, achievements, predictions
  - Primary: **Groq** (OpenAI-compatible API, free tier, `https://api.groq.com/openai/v1`)
  - Fallback: built-in deterministic analyzer — works with **zero API keys**
- **Admin dashboard** — secure login, table with search, AI filter, date filter, sort by score, CSV export, delete, and a details page showing every extracted answer + original prompt/response

## Tech Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Framer Motion · PostgreSQL (Neon) · Prisma · Zustand · React Hook Form + Zod · html-to-image · jose (admin sessions)

## Getting Started

### 1. Install

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in:

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | ✅ | Your Neon PostgreSQL connection string |
| `ADMIN_PASSWORD` | ✅ | Password for the admin dashboard |
| `SESSION_SECRET` | ✅ | Long random string used to sign admin sessions |
| `GROQ_API_KEY` | ⬜ | Enables real AI analysis (free key at https://console.groq.com/keys). If empty, a local analyzer is used instead |
| `GROQ_MODEL` | ⬜ | Defaults to `llama-3.3-70b-versatile` (valid: `llama-3.3-70b-versatile`, `llama-3.1-8b-instant`, `openai/gpt-oss-120b`) |
| `NEXT_PUBLIC_APP_URL` | ⬜ | Base URL used for share links |

### 3. Create the database tables

```bash
npm run db:push
```

### 4. Run it

```bash
npm run dev
```

Open http://localhost:3000. Admin dashboard: http://localhost:3000/admin/login (password from `ADMIN_PASSWORD`).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run db:push` | Apply the Prisma schema to the database |
| `npm run db:studio` | Open Prisma Studio |

## Deploying to Vercel

1. Push this repo to GitHub and import it in Vercel.
2. In Vercel → Project → Settings → Environment Variables, add **Production** (and Preview if wanted) values for:
   - `DATABASE_URL` — your Neon connection string (add `&pgbouncer=true` for serverless)
   - `GROQ_API_KEY` — **required for real AI analysis** (get one free at https://console.groq.com/keys)
   - `GROQ_MODEL` — default `llama-3.3-70b-versatile`
   - `ADMIN_PASSWORD` — admin dashboard password
   - `SESSION_SECRET` — long random string
   - `NEXT_PUBLIC_APP_URL` — your Vercel app URL, e.g. `https://ai-wrapped.vercel.app`
3. `npm install` on Vercel runs `prisma generate` automatically (`postinstall`).
4. After first deploy, run `npm run db:push` locally (or `prisma migrate deploy` via a build step) to create tables.
5. **Important:** never copy your real values into `.env.example` — that file is committed and must only contain placeholders.

> Note: the first page-load is optimized for <3s; the Wrapped page is
> server-rendered on demand and cards animate client-side.

## Security & Secrets

- `.env` is gitignored (via `.env*`) — **never commit it**. It contains your
  `DATABASE_URL`, `GROQ_API_KEY`, `ADMIN_PASSWORD`, and `SESSION_SECRET`.
- Only `.env.example` (safe placeholders) is tracked in the repo.
- Never paste real API keys, passwords, or database URLs in issues, pull
  requests, or this README.
- If a secret is ever exposed in git history, rotate it immediately.

## Project Structure

```
src/
  app/                    # Pages & API routes (App Router)
    page.tsx              # Landing page
    generate/             # Wrapped generation wizard
    wrapped/[id]/         # The animated Wrapped experience
    admin/                # Dashboard, details, login
    api/submissions/      # Create / list / get / delete submissions
    api/admin/            # Login / logout
  components/
    landing/              # Landing page sections
    generate/             # Wizard steps
    wrapped/              # Wrapped cards + viewer
  lib/
    analysis/             # Engineered prompt, Groq client, fallback analyzer, types
    prisma.ts             # Prisma client singleton
    session.ts            # Admin session (jose)
  store/wizard.ts         # Zustand wizard state
prisma/schema.prisma      # Submission model
```

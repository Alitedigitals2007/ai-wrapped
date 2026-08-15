# Aura 🧠

**"Know yourself. Share it."**

A premium, mobile-first web app that reveals personality in two ways — and
makes it shareable, comparable, and fun:

1. **Personality Test** — answer ~40 scenario-based questions (situations,
   decisions, values, conflicts, self-perception) and get a beautiful,
   AI-written personality report across **15 dimensions** (0–100), with a
   public shareable link, PNG cards, and head-to-head compare by code.
2. **AI Wrapped** — the original feature that turns a person's AI conversations
   into a Spotify Wrapped–style experience (animated cards, skill scores,
   career matches, badges, PNG share).

No accounts required for users; a password-protected admin dashboard shows
every submission and every personality test.

## Features

### Personality Test (new)
- **35 scenario MCQs + 6 optional written prompts** across Social Energy,
  Decision Making, Pressure & Failure, Relationships & Trust, Values,
  Conflict, Life Preferences, and Self-Perception
- **15 dimension scores** — Extraversion, Openness, Conscientiousness,
  Agreeableness, Emotional Stability, Assertiveness, Risk Tolerance,
  Independence, Empathy, Resilience, Ambition, Adaptability, Trust,
  Conflict Directness, Self-Awareness
- **AI-written report** — archetype, tagline, narrative summary, strengths,
  growth areas, blind spot, social/decision/conflict styles, career directions,
  fun fact (Groq via OpenAI-compatible API, with a built-in fallback)
- **Shareable report** at `/report/[code]` — public URL + 6-character code,
  download/share each card as PNG
- **Compare** — battle two reports (or a report vs. an AI wrap) head-to-head
  by code on `/compare`
- **Admin section** — same dashboard, new "Personality Tests" tab: search,
  date filter, sort by average dimension score, CSV export, delete, and a
  details page showing every answer + full report

### AI Wrapped
- **Landing page** — hero, how it works, features, FAQ, footer (SEO-friendly, light + dark, animated)
- **5-step Generate flow** — username → pick AI → confirm popup → copy engineered prompt → paste AI's response → animated "Building your Wrapped…" loading
- **12-card Wrapped viewer** — swipe on mobile, buttons + keyboard on desktop, each card can be downloaded or shared individually with captions
- **Compare by code** — every Wrapped gets a unique 6-character code; enter two codes on `/compare` to battle two Wraps head-to-head
- **Analysis engine** — structured JSON with personality, 8 scores, language habits, interests, productivity, career matches, strengths, fun facts, achievements, predictions
  - Primary: **Groq** (OpenAI-compatible API, free tier, `https://api.groq.com/openai/v1`)
  - Fallback: built-in deterministic analyzer — works with **zero API keys**

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
   - `NEXT_PUBLIC_APP_URL` — your Vercel app URL, e.g. `https://aura.vercel.app`
3. `npm install` on Vercel runs `prisma generate` automatically (`postinstall`).
4. After first deploy, run `npm run db:push` locally (or `prisma migrate deploy` via a build step) to create tables.
5. **Important:** never copy your real values into `.env.example` — that file is committed and must only contain placeholders.

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
    personality/          # Scenario-based personality test flow
    report/[code]/        # Public shareable personality report
    generate/             # AI Wrapped generation wizard
    wrapped/[id]/         # The animated Wrapped experience
    compare/              # Head-to-head compare by code (wraps + reports)
    admin/                # Dashboard, details, login (wraps + tests tabs)
    api/assessments/      # Personality test create / list / get / delete
    api/submissions/      # AI Wrapped create / list / get / delete
    api/lookup/           # Code lookup for compare (wraps + reports)
    api/admin/            # Login / logout
  components/
    landing/              # Landing page sections
    generate/             # Wizard steps
    personality/          # Test client + report viewer
    wrapped/              # Wrapped cards + viewer
  lib/
    personality/          # Question bank, scoring, LLM report, types
    analysis/             # Engineered prompt, Groq client, fallback analyzer, types
    brand.ts              # App name / tagline constants
    prisma.ts             # Prisma client singleton
    session.ts            # Admin session (jose)
  store/wizard.ts         # Zustand wizard state
prisma/schema.prisma      # Submission + Assessment models
```

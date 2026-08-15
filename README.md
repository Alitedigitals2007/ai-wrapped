# Aura 🧠

**"Know yourself. Share it."**

Aura is a free, no-account web app where you learn about yourself — and have fun with friends. Three ways to play:

---

### 1. Personality Test  →  `/personality`
Answer ~15 short scenario questions (what you'd do in real situations). Get a beautiful, AI-written personality report with **15 dimension scores** (extraversion, risk tolerance, empathy, ambition…), an archetype, strengths, blind spots, and a shareable link + PNG cards. No signup — just enter a name.

### 2. "Who Knows Me Best?" Quiz  →  `/quiz`
**Create a quiz about yourself.** Write your own questions (or pick a ready-made pack: Couple, Best Friend, Family, Squad, Work Buddy), mark the answers true about you, get a **6-character code**. Send the code to friends. They guess your answers → instant score + fun verdict ("You know Alite scary well 👑") → live leaderboard. Highest score wins.

### 3. Daily Question  →  `/daily`
One new question every day. Pick your answer → instant personality read + share. Come back tomorrow for a fresh one. Takes 10 seconds.

### 4. AI Wrapped  →  `/generate`
Paste your AI chat history and get a Spotify Wrapped–style animated story: personality, skill scores, career matches, predictions, and 12 shareable cards.

---

## What makes it different
- **No accounts, no email** — just a name. Your data lives in a shareable link.
- **Works instantly** — personality test ~3 min, quiz ~1 min, daily ~10 sec.
- **Mobile-first, beautiful** — dark/light mode, animated cards, PNG downloads.
- **Compare anything** — battle two personality reports or two AI Wraps head-to-head by code.

---

## Quick links
| Feature | URL |
|---|---|
| Personality Test | `/personality` |
| Create a Quiz | `/quiz` |
| Play a Quiz Pack | `/quiz/pack` |
| Daily Question | `/daily` |
| AI Wrapped | `/generate` |
| Compare by Code | `/compare` |
| Admin Dashboard | `/admin/login` |

---

## Tech (for developers)
Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Prisma (PostgreSQL/Neon) · Framer Motion · Groq (free LLM) with local fallback.

### Run locally
```bash
npm install
cp .env.example .env   # fill in DATABASE_URL, ADMIN_PASSWORD, SESSION_SECRET
npm run db:push        # creates tables (use CI=true if it hangs)
npm run dev            # http://localhost:3000
```

### Env vars
| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | ✅ | Neon PostgreSQL connection string |
| `ADMIN_PASSWORD` | ✅ | Admin dashboard login |
| `SESSION_SECRET` | ✅ | Random string for admin sessions |
| `GROQ_API_KEY` | Optional | Real AI reports (free at console.groq.com). Empty = local fallback. |
| `GROQ_MODEL` | Optional | Default: `llama-3.3-70b-versatile` |
| `NEXT_PUBLIC_APP_URL` | Optional | Base URL for share links |

---

## Deploy to Vercel
1. Push to GitHub → import in Vercel.
2. Add env vars (Production): `DATABASE_URL`, `GROQ_API_KEY`, `ADMIN_PASSWORD`, `SESSION_SECRET`, `NEXT_PUBLIC_APP_URL`.
3. Deploy. Run `npm run db:push` once after first deploy to create tables.

---

## Security
- `.env` is **gitignored** — never commit it. Only `.env.example` is tracked.
- Admin uses signed cookies (`secure: true` in production).
- No user emails or passwords stored.
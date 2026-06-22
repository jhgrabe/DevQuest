# DevQuest

> A full-stack coding game that teaches developer skills by making you actually use them.

Players sign up, browse a quest board of coding challenges by topic and difficulty, and write real code in the app. Each submission runs live in a sandbox (Judge0 CE) against hidden test cases and returns pass/fail. On a fail, an AI hint (Google Gemini) explains what went wrong in plain English. Passing quests awards XP and advances the player from Novice to Master. Quests are seeded from the bootcamp curriculum, so the game content *is* the learning content.

---

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | Vite + React | React Router DOM for routing, Axios for all data HTTP |
| Auth + data | Supabase | Auth (incl. email confirmation) + Postgres + Row-Level Security |
| Server-side | Supabase Edge Functions (Deno/TS) | Holds secrets — Judge0, Gemini, Stripe |
| Hosting | Vercel (frontend) + Supabase (functions) | |

**No separate backend service.** The rubric names Supabase as the backend. Edge Functions exist only to keep secrets off the client — they are not a separate deploy target you manage.

The full technical reasoning lives in [ARCHITECTURE.md](./ARCHITECTURE.md). The build order lives in [ROADMAP.md](./ROADMAP.md). Standing rules for Claude Code live in [CLAUDE.md](./CLAUDE.md). Current status lives in [progress.md](./progress.md).

---

## How requirements map to what we're building

| Rubric requirement | Where it's satisfied |
|---|---|
| Register / Login / Logout / Confirmation | `supabase-js` auth + email confirmation + `/confirm` route |
| 1 CRUD resource (not a profile) | **Submissions** — Axios → Supabase REST, RLS-scoped |
| Dynamic UI | Quest board filtering, live pass/fail result, hint rendering, XP/rank updates |
| Error handling (HTTP + UI) | Edge Functions return real status codes; UI surfaces every error path |
| Vite + React + React Router DOM + Axios | The frontend stack |
| Supabase backend | Auth + Postgres + RLS + Edge Functions |

**Enrichment on top of the rubric:**
- Judge0 CE — live sandboxed code execution on every submission
- Google Gemini — plain-English hint on every failed submission
- XP + rank progression (Novice → Master)
- Stripe — pay-what-you-want donation button (stretch, Friday)

---

## Directory structure

```
devquest/
├── README.md
├── ARCHITECTURE.md
├── ROADMAP.md
├── progress.md
├── CLAUDE.md
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
├── vercel.json                    # SPA rewrite — required for React Router deep links
│
├── design/
│   └── stitch/                    # Google Stitch screenshots — drop exports here
│                                    naming: <page>-<state>.png
│                                    e.g. quest-board-default.png
│                                         quest-detail-failed.png
│                                         profile-master.png
│
├── src/
│   ├── main.jsx
│   ├── App.jsx                    # React Router route definitions
│   ├── lib/
│   │   ├── supabase.js            # supabase-js client — AUTH SESSION ONLY
│   │   └── api.js                 # Axios instance — ALL data HTTP (CRUD + functions)
│   ├── state/                     # auth context + app state — SEPARATE from rendering
│   ├── components/                # presentational UI only — no business logic
│   ├── pages/
│   │   ├── Register.jsx
│   │   ├── Login.jsx
│   │   ├── Confirm.jsx
│   │   ├── QuestBoard.jsx
│   │   ├── QuestDetail.jsx
│   │   ├── Profile.jsx
│   │   └── ThankYou.jsx
│   └── data/                      # rank thresholds, topic metadata — config not logic
│
└── supabase/
    ├── config.toml
    ├── migrations/                # SQL: tables + RLS policies
    │   ├── 001_quests.sql
    │   ├── 002_submissions.sql
    │   └── 003_profiles.sql
    └── functions/
        ├── _shared/
        │   ├── cors.ts            # CORS headers helper
        │   └── auth.ts            # JWT verification helper
        ├── execute/
        │   └── index.ts           # Judge0 submit+poll → grade → store result → XP
        ├── hint/
        │   └── index.ts           # Gemini hint on failed submission
        └── donate/
            └── index.ts           # Stripe Checkout session (stretch)
```

---

## Local setup

**Prerequisites:** Node 18+, Supabase CLI, a Supabase project, Google AI Studio key, Stripe test-mode account (stretch).

```bash
# frontend
npm install
cp .env.example .env     # fill in VITE_ vars
npm run dev              # http://localhost:5173

# supabase (from repo root)
supabase link            # link to your cloud project
supabase db push         # run migrations
supabase functions serve # run Edge Functions locally
```

---

## Environment variables

### `.env` (frontend — Vite only exposes `VITE_`-prefixed vars to the browser)
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=    # safe on the client; RLS enforces data access
```

### Edge Function secrets (set via CLI — never in the client)
```bash
supabase secrets set JUDGE0_BASE_URL=https://ce.judge0.com
supabase secrets set GEMINI_API_KEY=...
supabase secrets set GEMINI_MODEL=...         # see note below
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set FRONTEND_URL=https://...  # CORS + Stripe redirects
```

> `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are auto-injected
> into Edge Functions — do not set them manually, and do not prefix custom secrets with
> the reserved `SUPABASE_` prefix.

> **Gemini model note.** Google cut free-tier quotas through late 2025/April 2026. The
> recommended free model is now **Gemini 3 Flash**. Pin it via `GEMINI_MODEL` and verify
> the current model + real rate limit in Google AI Studio before relying on it. The free
> tier may use prompts for model training — acceptable here, but worth knowing.

> **Judge0 note.** The public `ce.judge0.com` instance needs no auth but is rate-limited
> with no SLA. It is asynchronous: POST returns a token, then poll until finished. Always
> call it from the `execute` function, never the browser.

---

## vercel.json (required)
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```
Without this, React Router deep links return 404 in production.
# Progress log — DevQuest

> Updated at the end of every working session. Newest entry on top.
> Claude Code: read the top entry to find the current phase before doing anything.

---

## Current status

- **Phase:** 4 — The engine (next)
- **Day:** Tuesday
- **Next action:** build `execute/index.ts` — verify JWT → load test_cases → Judge0 async submit + poll → grade → update submission row → award XP on first pass. Test with curl before wiring frontend.
- **Blockers:** none.

---

## 2026-06-22 — Phase 2: Auth

**Goal this session:** full auth lifecycle — Register, Login, Logout, email confirmation, AuthContext, protected route guard.

**Done:**
- `src/state/AuthContext.jsx` — AuthProvider with register/login/logout; tracks user + session; `onAuthStateChange` subscription
- `src/components/ProtectedRoute.jsx` — redirects unauthenticated users to /login; shows nothing while session loads
- `src/App.jsx` — wrapped in AuthProvider; protected routes for /, /quest/:id, /profile
- `src/pages/Login.jsx` — email/password form, inline error, navigate to / on success
- `src/pages/Register.jsx` — username/email/password form, success state shows "check your email"
- `src/pages/Confirm.jsx` — waits for supabase-js to parse hash fragment via onAuthStateChange, redirects to / on success, shows error if link expired
- `src/pages/QuestBoard.jsx` — minimal logout button wired to useAuth().logout (enables end-to-end cycle test)
- Smoke test: dev server serves HTML, no compile errors

**Decisions made:**
- Register passes `username` in `options.data` so the Phase 1 profile trigger picks it up from `raw_user_meta_data`
- `emailRedirectTo` is `window.location.origin + '/confirm'` — works for both localhost and Vercel without hardcoding
- ProtectedRoute returns null while loading (not a spinner) — avoids flash of redirect on refresh
- Confirm page relies on supabase-js auto-parsing the `#access_token` hash; no manual URL parsing needed

**Gotchas hit:**
- `handle_new_user()` trigger failed with "Database error saving new user" (500) — root cause: `security definer` functions in Supabase require `set search_path = ''` and explicit `public.` schema prefix in INSERT statements. Fixed in migration 004.

**Open / next:**
- Supabase dashboard: allowlist `http://localhost:5173/confirm` in Auth → URL Configuration before testing email confirmation
- Phase 4: `execute/index.ts` (Judge0 engine) — prove via curl before wiring frontend

**Phase status:** complete → moving to Phase 4

---

## 2026-06-22 — Phase 0: Rails

**Goal this session:** full skeleton running — Vite + React + Router, Axios, supabase-js, supabase/ init, vercel.json.

**Done:**
- `package.json`, `vite.config.js`, `index.html` written manually (avoided Vite CLI interactive prompts)
- `npm install` — all deps installed (react, react-dom, react-router-dom, axios, @supabase/supabase-js)
- `src/lib/supabase.js` — createClient from VITE_ env vars
- `src/lib/api.js` — Axios instance with `apikey` header + request interceptor for `Authorization: Bearer <token>`
- `src/App.jsx` — Routes for all 7 pages
- `src/pages/` — 7 placeholder components (QuestBoard, Login, Register, Confirm, QuestDetail, Profile, ThankYou)
- `src/state/`, `src/components/`, `src/data/` — directories created with .gitkeep
- `src/data/ranks.js` — RANKS config + getRank() helper (Novice/Apprentice/Adept/Master at 0/500/1500/3500 XP)
- `vercel.json` — SPA rewrite rule committed
- `.gitignore` — .env excluded, node_modules/ and dist/ excluded
- `supabase init` + `supabase link --project-ref fdqkqkmeocvqjeebbrbb`
- `supabase/functions/_shared/` — directory scaffolded
- `.env` — VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY populated
- Smoke test: `npm run dev` returns HTTP 200, all routes reachable

**Decisions made:**
- Both Python (Judge0 ID 71) and JavaScript (Judge0 ID 63) supported — per-quest `language_id`, no schema change needed
- `profiles` table will include `username text unique not null` (Phase 1 migration)
- `quests` table will include `estimated_minutes int` (Phase 1 migration); streak skipped
- `submissions` table will include `updated_at timestamptz` (Phase 1 migration)
- Rank thresholds: Novice 0 / Apprentice 500 / Adept 1500 / Master 3500
- Profile auto-create: SQL trigger on auth.users INSERT (Phase 1 migration)
- Submissions RLS: explicit DELETE permission required (Phase 1 migration)
- Hints: automatic on every failed submission
- XP dedup: query for existing passed row before incrementing (in execute function)
- Quest seeding: inline in SQL migration

**Gotchas hit:**
- Supabase CLI not in PATH — installed globally to ~/.npm-global/bin via npm config set prefix
- `npm install -g supabase` needed user-writable prefix; sudo not available in Claude Code shell

**Open / next:**
- Phase 1: migrations for quests, submissions, profiles + RLS + seed data
- `_shared/cors.ts` and `_shared/auth.ts` scaffolded (empty helpers, importable)

**Phase status:** complete → moving to Phase 1

---

## 2026-06-22 — Phase 1: Data layer

**Goal this session:** three migrations live on remote Supabase, RLS active, quests seeded.

**Done:**
- Migration 001: `quests` table with all fields including `estimated_minutes`; RLS policy (authenticated read); 3 seeded quests — 2 Python (Array Reversal, FizzBuzz), 1 JavaScript (Sum of Array)
- Migration 002: `submissions` table with `updated_at`; two RLS policies (manage own + explicit DELETE); `update_updated_at()` trigger keeps `updated_at` current
- Migration 003: `profiles` table with `username text unique not null` and `xp`; RLS (self-read); `handle_new_user()` trigger auto-creates profile on `auth.users` INSERT; username defaults to `raw_user_meta_data->>'username'` or email prefix
- `supabase db push` — all three migrations applied to remote
- Verified: quests endpoint returns HTTP 200; RLS correctly blocks unauthenticated reads (returns [] not an error)
- `_shared/cors.ts` — CORS headers from `FRONTEND_URL` env; handles OPTIONS preflight
- `_shared/auth.ts` — `requireAuth()` helper; verifies JWT, returns `{ user, supabase }` or throws 401 Response

**Decisions made:**
- Profile trigger uses `coalesce(raw_user_meta_data->>'username', split_part(email, '@', 1))` so Register can pass username in metadata, or it falls back to email prefix
- Two separate RLS policies on submissions: one for SELECT/INSERT/UPDATE, one explicitly for DELETE (Postgres requires this separation)
- `update_updated_at()` function is reusable if other tables need it later

**Gotchas hit:**
- `supabase db push` emits a pg-delta cert warning — this is a Supabase CLI bug, not a migration failure; "Finished supabase db push" confirms success
- Anon REST query returns [] (not an error) when RLS blocks it — this is correct behavior; table existence confirmed via HTTP 200

**Open / next:**
- Phase 2: AuthContext, Register/Login/Logout pages, protected route guard, email confirmation route

**Phase status:** complete → moving to Phase 2

---

## Week schedule

| Day | Phase(s) | Target |
|---|---|---|
| Mon | 0 + 1 | Skeleton running, tables seeded, Stitch screenshots in |
| Tue | 2 + start 4 | Full auth lifecycle + Judge0 engine proven via curl |
| Wed | 3 + finish 4 | Submissions CRUD live, wired to execution + XP |
| Thu | 5 + 6 | Gemini hints + full dynamic UI, all error states |
| Fri | 7 + deploy | Deploy, rubric checklist, Stripe if time allows |

Rubric is locked by end of Thursday. Friday is buffer and deploy.

---

## How to log a session

Copy this block to the top of this file and fill it in at the end of every session:

```
## YYYY-MM-DD — Phase N: <name>

**Goal this session:** <one line>
**Done:**
- <bullet list of what was actually built>
**Decisions made:**
- <anything chosen and why — so future sessions don't re-litigate>
**Gotchas hit:**
- <anything that cost unexpected time, for future reference>
**Open / next:**
- <what is unfinished or next>
**Phase status:** in progress | complete → moving to Phase N+1
```

---

## Pre-build decisions log

**2026-06-22 — Architecture: Supabase-native, no separate backend**
The rubric names Supabase as the backend and requires no separate service. Auth and Submissions CRUD run client-side against Supabase + RLS. A FastAPI or Express service would sit outside the named stack. FastAPI is noted as a possible v2 portfolio addition.

**2026-06-22 — Server-side: three Edge Functions only**
`execute` (Judge0 + grading + XP), `hint` (Gemini), `donate` (Stripe). These exist solely to hide secrets and test cases from the client — they are enrichment, not rubric requirements.

**2026-06-22 — HTTP split: `supabase-js` for auth session, Axios for all data HTTP**
`supabase-js` uses `fetch` internally and does not satisfy the Axios rubric requirement. One configured Axios instance in `lib/api.js` handles all CRUD and function calls. Every request carries `apikey` + `Authorization: Bearer <token>`.

**2026-06-22 — CRUD resource: Submissions (not a profile)**
A submission with status `pending` is a complete CRUD resource. Execution wires the result into the same row — it does not change the resource's shape. This means CRUD can ship Wednesday even if execution isn't done.

**2026-06-22 — Gemini model: env/secret-driven**
Never hardcode a model string. Use the `GEMINI_MODEL` secret. Current recommended free model is Gemini 3 Flash (verify in AI Studio — quotas shifted in late 2025 / April 2026). Free tier may use prompts for training — acceptable for this project.

**2026-06-22 — Judge0: async, public instance, backend-only**
Public `ce.judge0.com`, no auth, async POST + poll pattern. RapidAPI free Basic plan or self-host as fallback if the public instance is unreliable. Never call Judge0 from the browser.

**2026-06-22 — Stripe: pay-what-you-want donation, test mode, Friday stretch**
No paywall. Checkout Session with customer-set amount. No webhook, no stored record in v1. Only after the game is deployed and the rubric is green.

**2026-06-22 — Engine built Tuesday, not after CRUD**
Judge0 is the riskiest unknown. Prove it Tuesday afternoon (behind auth) so Wednesday's CRUD wiring isn't blocked by an unproven engine. If Tuesday's engine work bleeds into Wednesday, decouple: ship `pending` submissions first, wire execution after.
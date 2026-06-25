# Progress log — DevQuest

> Updated at the end of every working session. Newest entry on top.
> Claude Code: read the top entry to find the current phase before doing anything.

---

## Current status

- **Phase:** 7 — Deploy + Stripe ✓ COMPLETE + bug fixes applied 2026-06-25
- **Date:** 2026-06-25
- **Next action:** (1) Add STRIPE_SECRET_KEY secret to enable donate button; (2) verify Supabase Auth → URL Configuration has https://devquest-two.vercel.app/** allowlisted for email confirmation redirects.
- **Blockers:** Stripe not yet live (STRIPE_SECRET_KEY not set). Supabase auth redirect URL may need production domain added.

---

## 2026-06-25 — Bug fixes + deployment repair

**Goal this session:** Verify rubric, fix broken Vercel deploy, hunt bugs.

**Done:**
- Root cause of broken Vercel deploy found: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` were never set as Vercel env vars — build embedded empty strings. Added both and redeployed.
- `supabase/functions/_shared/auth.ts` — 401 responses from `requireAuth` were missing CORS headers; browser got a CORS failure instead of seeing the 401 status. Fixed by importing `getCorsHeaders` and spreading into all thrown 401 headers. Redeployed all three functions.
- `QuestDetail.jsx` / `Profile.jsx` / `QuestBoard.jsx` — on 401 now navigate to `/login` (redirect) instead of showing inline error, satisfying the rubric 401→redirect requirement.
- `Confirm.jsx` — applied cyber-terminal design to loading and error states (was plain unstyled HTML).
- `QuestBoard.jsx` difficulty filter — committed the existing `.toLowerCase()` fix that made filter tabs work with lowercase DB values.
- Footer year corrected: 2024 → 2026 across QuestBoard, QuestDetail, Profile.

**Rubric status:** All 4 requirements confirmed green:
1. Auth (register/login/logout/email confirm + protected routes) ✓
2. Submissions CRUD via Axios with RLS ✓
3. Dynamic UI (filters, live results, XP bar, history) ✓
4. Error handling with real HTTP codes + UI states ✓

**Open / next:**
- `supabase secrets set STRIPE_SECRET_KEY=sk_test_...` to enable donation button
- Supabase Auth → URL Configuration: confirm https://devquest-two.vercel.app/** is in Redirect URLs for production email confirmation

**Phase status:** complete

---

## 2026-06-24 — Phase 7: Deploy + Stripe

**Goal this session:** Vercel deploy, FRONTEND_URL update, Stripe donate feature.

**Done:**
- `supabase functions deploy execute` + `hint` — both redeployed to remote
- `FRONTEND_URL` secret updated to `https://devquest-two.vercel.app`
- Vercel first deploy — project created as `schema-solutions/devquest`, aliased to `https://devquest-two.vercel.app`
- `supabase/functions/donate/index.ts` — verify JWT → Stripe Checkout Session (amount_cents from client, STRIPE_SECRET_KEY server-side, success → /thankyou, cancel → /profile)
- `src/state/donate.js` — `createDonationSession(amountCents)` via Axios
- `src/pages/Profile.jsx` — Support DevQuest card: amount input, Donate via Stripe button, inline error states
- `src/pages/ThankYou.jsx` — styled confirmation page
- `supabase functions deploy donate` — deployed to remote
- Build passes clean

**Decisions made:**
- Donate form lives on Profile page (not Nav) — natural location, less clutter in header
- Amount input is free-entry (dollars), converted to cents before POST
- Minimum $1.00 enforced both client-side and in the Edge Function (≥ 100 cents)
- No Stripe publishable key needed client-side — the session URL comes back from the function

**Gotchas hit:**
- Extra `</div>` from edit insertion broke JSX structure; fixed before commit

**Open / next:**
- Manual: set `STRIPE_SECRET_KEY` via `supabase secrets set STRIPE_SECRET_KEY=sk_test_...`
- Manual: add `https://devquest-two.vercel.app/**` to Supabase → Auth → URL Configuration → Redirect URLs
- Manual: promote Vercel preview to production (`vercel --prod` or via Vercel dashboard)
- Manual: test full game loop on production URL

**Phase status:** complete → project shipped

---

## 2026-06-23 — Phase 5 + 6: Gemini hints + full dynamic UI

**Goal this session:** `hint/index.ts` edge function + full Cyber-Terminal UI across all pages.

**Done:**
- `supabase/functions/hint/index.ts` — verify JWT → load quest title+description → Gemini API (model from `GEMINI_MODEL` secret, key from `GEMINI_API_KEY`) → store hint on submission row → return `{ hint }`; deployed to remote
- `src/state/submissions.js` — added `getHint(submissionId, questId, sourceCode, stderr)` via Axios to `/functions/v1/hint`
- `src/state/profile.js` — `getProfile(userId)` and `getAllSubmissions(userId)` with quest title join
- `src/index.css` — full Cyber-Terminal design system: CSS variables (dark palette, electric teal primary), chips, buttons, forms, cards, editor, exec output, hint panel, XP bar, rank ladder, history table
- `index.html` → `src/main.jsx` wires up CSS import (Google Fonts for Inter + JetBrains Mono)
- `src/components/Nav.jsx` — sticky nav: DEVQUEST logo + terminal icon, Quests/Profile links with active underline, Logout button
- `src/pages/QuestBoard.jsx` — full redesign: topic + difficulty filter tabs, quest cards with Q-XXX mono ID, status dot, topic + difficulty chips, XP label, hover effects
- `src/pages/QuestDetail.jsx` — full redesign: hero header with Q-ID + difficulty chip + XP + time, Objective card, styled code editor (monospace textarea, lang badge, reset toolbar), full-width submit button, Execution Output section (idle/pass/fail states, per-test pass/fail rows), AI Analysis card auto-populated on failure (loading → hint text), History list with attempt #, status dot, time, resubmit + delete actions
- `src/pages/Profile.jsx` — full implementation: avatar, username, rank badge, XP progress bar with glow, stats grid (attempted/passed), rank ladder (current highlighted + locked), recent submissions table with quest title + status dot + time
- `src/pages/Login.jsx` — terminal aesthetic: SYSTEM_LOGIN title, monospace field labels, EXECUTE_LOGIN button
- `src/pages/Register.jsx` — Init Profile aesthetic: USER_ID / SYS_COMMS_LINK / AUTH_KEY labels, success state with email confirmation message

**Decisions made:**
- Hint call is async and non-blocking: execute runs first, hint fires immediately after on failure, hint failure does not surface as an error (graceful degradation)
- `questShortId()` helper: deterministic 3-digit display ID from UUID hash (Q-NNN format, range 100-999)
- Profile `getAllSubmissions` uses Supabase REST embedded resource join (`quests(id,title)`) — no extra API call
- `updateSubmission` clears hint field implicitly via status reset to pending; new hint fetched after re-execute

**Gotchas hit:**
- `GEMINI_API_KEY` and `GEMINI_MODEL` not yet set as Supabase secrets — hints will return 502 until set

**Open / next:**
- Set Gemini secrets: `supabase secrets set GEMINI_API_KEY=<key> GEMINI_MODEL=gemini-2.0-flash`
- Phase 7: deploy all functions, set all prod secrets, Vercel deploy, rubric checklist
- Stripe donation (stretch): `donate/index.ts` + ThankYou page

**Phase status:** complete → moving to Phase 7

---

## 2026-06-23 — Phase 3: Submissions CRUD + execute wiring

**Goal this session:** all four CRUD operations via Axios, QuestBoard loads quests from DB, QuestDetail wired to execute.

**Done:**
- `src/state/quests.js` — `getQuests()`, `getQuest(id)` via Axios; excludes `test_cases` column
- `src/state/submissions.js` — `createSubmission`, `getSubmissions`, `updateSubmission`, `deleteSubmission`, `executeSubmission` all via Axios instance
- `QuestBoard.jsx` — fetches quest list, shows loading/error/empty states, links to `/quest/:id`
- `QuestDetail.jsx` — quest description + textarea editor + submit flow: create pending → execute → show pass/fail per test; resubmit (patch existing row) and delete from history; 401/502 error paths surfaced with retry button

**Decisions made:**
- Update operation: "Resubmit" loads old code into editor + patches that row's source_code/status before re-running execute — demonstrates PATCH clearly
- All 4 CRUD ops go through the Axios instance in `lib/api.js`; `supabase-js` touches nothing here
- `test_cases` excluded from quest select query — never reaches the browser

**Open / next:**
- Phase 5: `hint/index.ts` (Gemini) — auto-hint on every failed submission
- Phase 6: full UI polish using design/stitch screenshots

**Phase status:** complete → moving to Phase 5

---

## 2026-06-23 — Phase 4: The engine

**Goal this session:** build and prove `execute/index.ts` via curl before wiring frontend.

**Done:**
- `supabase/functions/execute/index.ts` — verify JWT → service-role load of quest test_cases → Judge0 async submit + poll → grade all test cases → update submission row → award XP on first pass (dedup check)
- Deployed to remote: `supabase functions deploy execute`
- Set remote secrets: `JUDGE0_BASE_URL=https://ce.judge0.com`, `FRONTEND_URL=http://localhost:5173`
- curl test 1: correct solution → `{"passed":true,"xp_awarded":100}`, submission row status=passed, profile xp=100 ✓
- curl test 2: second correct pass on same quest → `{"xp_awarded":0}` — no double-award ✓
- curl test 3: wrong solution → `{"passed":false,"xp_awarded":0}`, two of three test cases failed ✓

**Decisions made:**
- Service role client used for all DB writes (test_cases load, submission update, profile XP) — never the user-scoped client for privileged data
- Compilation error (statusId=6) short-circuits remaining test cases to avoid pointless Judge0 calls
- XP dedup: count prior `passed` rows for same user+quest, excluding current submission_id
- stdout stored as "Test N: <output>" per test case for readable history
- Test user `testcurl@devquest.test` (id: f0a93073) created in remote project for future curl tests

**Gotchas hit:**
- `supabase functions serve` requires `supabase start` (local Docker) — not available; deployed to remote and tested against deployed URL instead

**Open / next:**
- Phase 3: Submissions CRUD via Axios (create/read/update/delete) — all four operations, RLS-scoped
- Phase 4 wiring: QuestDetail calls execute, shows pass/fail result, hints on failure (Phase 5 later)

**Phase status:** complete → moving to Phase 3 (CRUD) + execute wiring

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

## Actual schedule (vs plan)

| Date | Phase(s) | Status |
|---|---|---|
| Mon 2026-06-22 | 0 + 1 + 2 | ✓ Skeleton, data layer, full auth lifecycle |
| Tue 2026-06-23 | 4 + 3 + 5 + 6 | ✓ Judge0 engine, CRUD, Gemini hints, full UI |
| Tue 2026-06-23 | 7 | → Deploy + Stripe (stretch) |

Phases 0–6 completed in 2 days instead of the planned 4. Rubric requirements all met.

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
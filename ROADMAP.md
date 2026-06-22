# Roadmap — DevQuest v1 build order

The order is deliberate: **rubric before enrichment, engine before UI, config before logic, one vertical slice before breadth.** The rubric is locked by end of Thursday. Friday is buffer, deploy, and stretch. Each phase has a "done when" — don't move on until it's met.

**Framing:** Phases 0–3 + 6 satisfy the rubric. The game enrichment (Judge0, Gemini, Stripe) slots into the same structure without changing it.

---

## Week at a glance

| Day | Phase(s) | Goal |
|---|---|---|
| Mon | 0 + 1 | Skeleton running, tables seeded, Stitch screenshots in |
| Tue | 2 + start 4 | Full auth lifecycle + Judge0 engine proven in isolation |
| Wed | 3 + finish 4 | Submissions CRUD live via Axios, wired to execution + XP |
| Thu | 5 + 6 | Gemini hints + full dynamic UI, all error states |
| Fri | 7 + deploy | Deploy, rubric checklist, Stripe if time allows |

---

## Phase 0 — Rails
**Goal:** a clean, runnable skeleton with nothing in it yet.

- Vite + React app with React Router, placeholder routes for every page
- Axios instance scaffolded in `src/lib/api.js` (no calls yet)
- `supabase-js` client in `src/lib/supabase.js`
- `supabase/` initialized — `config.toml`, empty `migrations/`, `functions/_shared/`
- Supabase project created; `VITE_` vars in `.env`
- Google Stitch screenshots placed in `design/stitch/`
- `vercel.json` with SPA rewrite committed

**Done when:** both `npm run dev` and `supabase functions serve` run without errors; routes navigate between placeholder pages.

---

## Phase 1 — Data layer
**Goal:** the database is seeded before any logic touches it.

- Migrations: `quests`, `submissions`, `profiles` tables
- RLS policies (submissions scoped to `auth.uid()`; profiles self-read)
- Seed 2–3 quests with real `test_cases` in the migration or a seed script
- `functions/_shared/cors.ts` and `functions/_shared/auth.ts` scaffolded

**Done when:** a seeded quest queries back in the Supabase dashboard; RLS blocks reading another user's submissions; `_shared` helpers exist and are importable.

---

## Phase 2 — Auth (rubric requirement #1)
**Goal:** the full auth lifecycle.

- Register, login, logout via `supabase-js`
- Enable email confirmation in Supabase dashboard; handle the `/confirm` redirect route
- Protected route guard — redirects logged-out users to login
- Auth state in context (`src/state/AuthContext.jsx`)

**Done when:** register → confirm email → login → logout all work end to end; navigating to a protected route while logged out redirects to login.

> Gotcha: allowlist the confirmation redirect URL for both `localhost:5173` and your Vercel
> domain in Supabase → Auth → URL Configuration. In local dev, confirmation emails land in
> Supabase Inbucket, not a real inbox.

---

## Phase 3 — Submissions CRUD (rubric requirement #2)
**Goal:** the one CRUD resource, through Axios, RLS-scoped.

- Axios instance in `lib/api.js` configured with `apikey` + `Authorization: Bearer <token>` headers
- Create a submission (status: `pending`) on code attempt
- Read submission history per quest
- Update a submission (resubmit revised code)
- Delete a submission (clear from history)

**Done when:** all four operations work for the logged-in user; another user's rows are invisible. Status is `pending` — execution wires in on Phase 4. A pending submission is a complete CRUD resource.

> Gotcha: Axios needs BOTH `apikey: <anon key>` AND `Authorization: Bearer <access token>`.
> Missing the bearer token causes RLS to treat the caller as anonymous and silently return
> nothing — not an error. Test with a real session.

---

## Phase 4 — The engine: `execute` function
**Goal:** prove the core game loop — this is the heart of DevQuest.

- `execute/index.ts`: verify JWT → load `test_cases` → Judge0 submit + poll → grade → update submission row → award XP on first pass
- Test with `supabase functions serve` + curl before wiring the frontend

**Done when:** correct code returns `passed` and the submission row updates; wrong code returns `failed`; XP increments on a first pass; a second pass on the same quest does not double-award. No frontend required — verify with curl.

> Build Tuesday afternoon. The goal is that by Wednesday morning you know execution works,
> so CRUD + execution wire together in the same day rather than in sequence.

---

## Phase 5 — Hints: `hint` function
**Goal:** the Gemini layer, on top of the working loop.

- `hint/index.ts`: verify JWT → code + stderr + quest description → Gemini → hint stored on submission row → returned to client
- Prompt must explain what went wrong and how to think about fixing it — **never output the solution**
- Model from `GEMINI_MODEL` secret — never hardcoded

**Done when:** a failed submission yields a plain-English hint; the hint is stored on the submission row and visible in history.

---

## Phase 6 — Dynamic UI + error handling (rubric requirements #3 and #4)
**Goal:** build the full interface on the proven backend, using `design/stitch/` screenshots as the visual reference.

**Keep state in `state/` and presentation in `components/` — never mixed.**

- QuestBoard: list quests, filter by topic and difficulty
- QuestDetail: code editor, submit button → calls `execute` → shows pass/fail result + hint on failure → submission history (read/update/delete)
- Profile: rank, XP bar, full submission history
- Loading, empty, and error states on every data-fetching component
- Auth error surfaces inline (form validation + 401 handling)
- Upstream failure (Judge0/Gemini) surfaces a retry path, not a blank screen

**Done when:** a player can sign in, browse quests, write and submit code, see pass/fail + hint, watch XP/rank update, and manage their submission history — and every error path shows something sensible.

---

## Phase 7 — Deploy + Stripe (stretch)
**Goal:** ship it, then add the donation button if time allows.

**Deploy first:**
- `supabase functions deploy` for all three functions
- Set production secrets via `supabase secrets set`
- Deploy frontend to Vercel; confirm `vercel.json` SPA rewrite is active
- Allowlist the production URL in Supabase auth settings
- Run the full rubric checklist against the deployed app

**Stripe (only if deployed and green):**
- `donate/index.ts`: Stripe Checkout Session with customer-set amount → return URL
- "Support DevQuest" button → redirect → ThankYou page
- Test mode; no webhook; no stored record

**Done when:** the deployed app runs the full game loop against production services. Stripe is a bonus.

---

## Guardrails
- Don't start Phase 6 (UI) before Phase 4 (engine) is proven via curl.
- Don't add the hint before pass/fail works.
- Don't touch Stripe until the game is deployed and the rubric is green.
- The CRUD resource ships Wednesday whether execution works or not — decouple if needed.
- If a phase reveals the plan is wrong, update this file and `progress.md` before pivoting.
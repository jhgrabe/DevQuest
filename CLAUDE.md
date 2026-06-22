# CLAUDE.md — working rules for DevQuest

Standing brief for Claude Code. Read this file at the start of every session, before writing any code.

---

## What we're building

DevQuest: a full-stack coding game. Players write real code against hidden test cases (Judge0 CE), get AI hints on failure (Google Gemini), and earn XP toward ranks. The stack is Vite + React + React Router DOM + Axios on the frontend; Supabase for auth, Postgres, and RLS; three Supabase Edge Functions (Deno/TS) for the secret-bearing server-side calls. There is no separate backend service. See ARCHITECTURE.md.

---

## Session start ritual

Do this at the top of every session, in order:

1. Read this file
2. Read `progress.md` → find the current phase and the last decision
3. Read the current phase in `ROADMAP.md` and its "done when"
4. If the phase involves UI (Phase 6), read `design/DESIGN.md` and open the relevant mockups
5. State out loud which phase you're working on and what done looks like
6. Then, and only then, write code

---

## The working agreement

I am the architect. You are the contractor.

- **Build only the current phase.** Do not scaffold the whole app at once. Do not jump ahead "to save time."
- **Propose before you sprawl.** If a task touches more than the current phase, stop and ask.
- **End every session by updating `progress.md`.** Format is in that file.

---

## Rubric — the floor (protect it always)

The graded requirements are:
1. Auth: register, login, logout, email confirmation
2. One CRUD resource that is NOT a user profile — this is **Submissions**
3. Dynamic UI
4. Error handling with real HTTP responses and UI states

Stack: Vite + React + React Router DOM + Axios + Supabase.

Phases 0–3 and 6 satisfy the rubric. Phases 4, 5, and 7 (Judge0, Gemini, Stripe) are enrichment. If enrichment blocks the rubric, enrichment waits.

---

## Non-negotiable rules

### Secrets and cheating
- No secret ever reaches the browser. `GEMINI_API_KEY`, `STRIPE_SECRET_KEY`, and the Supabase service-role key live in Edge Function secrets only.
- The frontend never requests the `test_cases` column. Grading happens inside `execute` — always.
- XP is awarded inside `execute` only. Never trust the client for progression state.

### The HTTP split — this is rubric-critical
- **`supabase-js`** handles the auth session only: register, login, logout, token refresh. It uses `fetch` internally and does NOT satisfy the Axios requirement.
- **Axios** (one configured instance in `src/lib/api.js`) handles ALL data HTTP: the Submissions CRUD via Supabase REST, and calls to the Edge Functions. Every Axios request must carry both:
  - `apikey: <VITE_SUPABASE_ANON_KEY>`
  - `Authorization: Bearer <session access token from supabase-js>`

Missing the bearer token causes RLS to treat the caller as anonymous and silently return nothing — not an error. Always test with a real authenticated session.

### Separation of concerns
- Frontend: state logic lives in `src/state/`; presentation lives in `src/components/`. A component owns no business logic. A state module renders nothing.
- Edge Functions: handlers are thin. Shared helpers (CORS, JWT check) live in `functions/_shared/` and are imported — never duplicated.
- Config and data (quest seeds, rank thresholds, topic metadata) live in `data/` directories. Never inline them in logic.

### Build discipline
- Engine before UI: the `execute` function must return pass/fail via curl before the quest UI is built.
- One vertical slice before breadth.
- Config before logic: tables seeded before services touch them.
- The Submissions CRUD ships Wednesday whether execution works or not. Decouple if needed — a `pending` submission is a valid CRUD resource.

---

## API specifics

### Judge0 CE
- Always async: POST `/submissions` → `{ token }`, then poll `GET /submissions/{token}` until `status.id >= 3`
- Do not use `?wait=true`
- Call only from `execute/index.ts`, never from the client
- `JUDGE0_BASE_URL` from secrets — do not hardcode the URL

### Gemini
- Model from the `GEMINI_MODEL` secret — never hardcode a model string in code, ever
- Hints explain the error and how to think about fixing it — they must never output the solution
- Prompt structure: player's code + stderr/diff + quest description → plain-English hint

### Stripe
- Checkout Session created in `donate/index.ts`; `STRIPE_SECRET_KEY` never leaves the function
- v1: no webhook, no stored donation record — do not add either unless explicitly asked
- Test mode (`sk_test_...`) for the demo

### Supabase secrets
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are **auto-injected** into Edge Functions
- Do not set them manually
- Do not prefix any custom secret with `SUPABASE_` (reserved prefix)

---

## Error handling — this is graded

Every function must return real HTTP status codes. The UI must surface a state for each:

| Code | Meaning | UI |
|---|---|---|
| 401 | Missing or invalid JWT | Redirect to login |
| 400 | Bad input | Inline form error |
| 422 | Compile/runtime error (Judge0) | Show stderr in editor |
| 502 | Upstream failure (Judge0/Gemini) | "Judge is busy — retry" with retry button |
| 200 | Graded result (pass or fail is a 200) | Pass/fail UI + hint if failed |

Do not return 200 for everything. Do not show blank screens or unhandled promise rejections.

---

## Anti-patterns — refuse these

- Adding a separate Express, FastAPI, or other backend service (not in the stack)
- Using `supabase-js` for data HTTP and calling it "Axios" — it is not
- Scaffolding the whole project with stubs for every file at once
- Business logic inside a presentational component
- Hardcoding test cases, quest seeds, rank thresholds, or a Gemini model string in logic
- Sending any secret key or `test_cases` data to the frontend
- Building beyond the current phase because it "seems useful"
- Responding to a 401 with empty data instead of redirecting

---

## When unsure

Ask first, or default to the smaller change. YAGNI beats cleverness.
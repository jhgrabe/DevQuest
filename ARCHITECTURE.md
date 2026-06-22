# Architecture

## The one principle

The browser never holds a secret and never sees a test case. Everything the rubric grades is safe to do client-side against Supabase with Row-Level Security. The only things that cannot be client-side are the three calls carrying a secret or a hidden answer — Judge0, Gemini, Stripe — and those live in Edge Functions.

## Two tiers, on purpose

**Tier 1 — rubric core (client + Supabase directly).** Auth and the Submissions CRUD happen between the browser and Supabase via `supabase-js` (auth session) and Axios (data HTTP). RLS makes this safe. This alone satisfies every graded requirement.

**Tier 2 — game enrichment (Edge Functions).** Code execution, hints, and donations carry a secret or a test case, so they run server-side. These are *additive* — the rubric is met without them, but the game isn't.

## Data flow

```
                  ┌──────────────────────────────────┐
                  │             Browser               │
                  │  React / Vite / React Router DOM  │
                  │                                   │
                  │  supabase-js → auth session only  │
                  │  Axios → all data HTTP             │
                  └──────┬──────────────────┬──────────┘
                         │                  │
           auth + CRUD   │                  │  secret-bearing calls
         (REST + RLS)    │                  │  (execute / hint / donate)
                         ▼                  ▼
           ┌──────────────────┐   ┌──────────────────────────┐
           │  Supabase        │   │  Supabase Edge Functions  │
           │  Postgres + Auth │   │  (Deno / TypeScript)      │
           │  + RLS           │   │  execute · hint · donate  │
           └──────────────────┘   └────┬──────────┬──────┬───┘
                                       ▼          ▼      ▼
                                   Judge0      Gemini  Stripe
```

## The HTTP split — rubric-critical

The rubric requires **Axios**. `supabase-js` uses `fetch` internally and does not satisfy the requirement. The split is:

| Library | Role | Why |
|---|---|---|
| `supabase-js` | Auth session only — register, login, logout, token refresh | It owns the session; nothing else |
| **Axios** | All data HTTP — Submissions CRUD (Supabase REST) + Edge Function calls | This is what the rubric grades |

A single configured Axios instance in `src/lib/api.js` carries `apikey: <anon key>` and `Authorization: Bearer <session access token>` on every request. The token comes from the `supabase-js` session.

## Data model

**`quests`**
```sql
id           uuid primary key default gen_random_uuid()
title        text not null
description  text
topic        text          -- functions | arrays | api_calls | data_modeling | ...
difficulty   text          -- novice | apprentice | adept | master
language_id  int           -- Judge0 language ID (71 = Python 3, 63 = JavaScript)
starter_code text
test_cases   jsonb         -- [{ "stdin": "...", "expected_stdout": "..." }, ...]
xp_reward    int default 100
created_at   timestamptz default now()
```
The client selects everything **except** `test_cases`. The `execute` function reads `test_cases` server-side only — it never travels to the browser.

**`submissions`** — the single CRUD resource
```sql
id           uuid primary key default gen_random_uuid()
user_id      uuid references auth.users not null
quest_id     uuid references quests not null
source_code  text not null
language_id  int not null
status       text default 'pending'  -- pending | passed | failed | error
stdout       text
stderr       text
hint         text                    -- populated on failure by the hint function
created_at   timestamptz default now()
```
- **Create** — every code attempt inserts a row (status starts as `pending`)
- **Read** — player reads their attempt history per quest
- **Update** — player resubmits revised code; `execute` updates status/stdout/stderr
- **Delete** — player clears an attempt from history

> A submission with status `pending` is a complete CRUD resource. Execution wires result
> into the same row — it does not change the shape of the resource.

**`profiles`**
```sql
user_id  uuid primary key references auth.users
xp       int default 0
```
XP is updated by the `execute` function on a player's first passing submission for a quest. Rank (Novice → Apprentice → Adept → Master) is derived from XP in `src/data/ranks.js` — display config, not DB state.

## Row-Level Security

```sql
-- submissions: users see and modify only their own rows
alter table submissions enable row level security;
create policy "own submissions" on submissions
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- quests: readable by any authenticated user; test_cases never sent to client
alter table quests enable row level security;
create policy "quests readable" on quests
  for select using (auth.role() = 'authenticated');

-- profiles: self-read only; writes via service role in execute function
alter table profiles enable row level security;
create policy "own profile" on profiles
  using (user_id = auth.uid());
```

## Edge Functions

Each function is a thin Deno handler. CORS headers and JWT verification live in `functions/_shared/` and are imported by every function.

### `execute` — the engine
1. Verify caller JWT (401 if missing/invalid)
2. Read quest `test_cases` from Postgres (service role — never exposed to client)
3. POST code to Judge0 → receive token
4. Poll `GET /submissions/{token}` until `status.id >= 3`
5. Grade: compare stdout to expected for each test case → `passed` / `failed` / `error`
6. Update the submission row with status, stdout, stderr
7. On first `passed` for this quest: increment `profiles.xp` by `quests.xp_reward`
8. Return `{ status, stdout, stderr, passed }` to the client

### `hint` — Gemini on failure
1. Verify JWT
2. Receive: `source_code`, `stderr`, `quest description`
3. Build prompt: explain what went wrong and how to think about fixing it — **not the answer**
4. Call Gemini (`GEMINI_MODEL` from secrets — never hardcoded)
5. Store hint text on the submission row
6. Return hint to client

### `donate` — Stripe Checkout (stretch)
1. Receive customer-set amount
2. Create Stripe Checkout Session (server-side — `STRIPE_SECRET_KEY` never leaves the function)
3. Return the session URL for client redirect
4. No webhook, no stored record in v1

## API integration details

### Judge0 CE
- Public `ce.judge0.com` — no auth required, rate-limited, no SLA
- **Always async:** `POST /submissions` → `{ token }`, then poll `GET /submissions/{token}` until `status.id >= 3`. Do not use `?wait=true`
- Polling is I/O, not CPU — does not hit the Edge Function's 2s CPU limit; the 150s response window is ample
- Fallback if public instance is unreliable: RapidAPI free Basic plan or self-host

### Google Gemini
- Model from `GEMINI_MODEL` secret — never hardcode a model string anywhere in code
- Hints explain the error and how to think about fixing it; they never output the solution
- Free tier (Gemini 3 Flash): ~1,500 req/day, 10-15 RPM — sufficient for a bootcamp project
- Free tier may use prompts for training — acceptable here, documented as known limitation

### Stripe
- Checkout Session created server-side in the `donate` function
- Test mode (`sk_test_...`) for the demo; real account needed to take real money
- No webhook and no stored donation record in v1

## Error handling (graded requirement)

Functions return real HTTP status codes — the UI must surface each:

| Code | Condition | UI response |
|---|---|---|
| 401 | Missing or invalid JWT | Redirect to login |
| 400 | Bad request (missing fields) | Inline form error |
| 422 | Compile/runtime error from Judge0 | Show stderr in the editor |
| 502 | Upstream failure (Judge0 / Gemini down) | "Judge is busy — try again" with retry |
| 200 | Graded result (pass or fail is a 200) | Pass/fail state + hint if failed |

## Deployment

- **Frontend → Vercel.** Requires `vercel.json` with an SPA rewrite — without it, React Router deep links 404 in production.
- **Edge Functions → Supabase** via `supabase functions deploy`.
- CORS in `_shared/cors.ts` allows `FRONTEND_URL` only in production.

## Known constraints and gotchas

1. Email confirmation redirect URL must be allowlisted in Supabase auth settings for both localhost and the Vercel domain. In local dev, confirmation emails go to Supabase's Inbucket, not a real inbox.
2. Axios requires both `apikey` and `Authorization: Bearer <token>` headers. Missing the bearer token causes RLS to treat the request as anonymous — it silently returns nothing rather than erroring, which is easy to miss.
3. Gemini free-tier quotas have been reduced and may change without notice. Verify your real project limit in AI Studio before relying on it.
4. Judge0 public instance has no uptime guarantee. Design loading/polling states — the first submission after a cold Edge Function start can feel slow.
5. `SUPABASE_URL/ANON_KEY/SERVICE_ROLE_KEY` are auto-injected into Edge Functions. Do not set them manually and do not prefix custom secrets with `SUPABASE_`.
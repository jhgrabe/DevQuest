# User Journey — DevQuest

This document walks through the complete experience of a DevQuest player, from landing on the app for the first time through earning their first rank promotion.

---

## 1. Registration

A new user arrives at the app and is immediately redirected to `/login`. From there they navigate to `/register` and fill in:

- **Username** — displayed on their profile and rank ladder
- **Email** — used for authentication and confirmation
- **Password** — minimum length enforced client-side

On submit, Supabase creates the account and sends a confirmation email. The app displays a success state instructing the user to check their inbox. Clicking the link in the email routes them through `/confirm`, which the app handles automatically and redirects them to the Quest Board.

A profile row is created automatically via a Postgres trigger the moment the user account is inserted — no manual profile setup required.

---

## 2. Quest Board

After confirming their email and logging in, the player lands on the Quest Board at `/`. They see all available quests as cards, each showing:

- A short quest ID (e.g. Q-247)
- Quest title and description preview
- Topic chip (Arrays, Strings, Functions)
- Difficulty chip, color-coded by tier:
  - 🟢 **Novice** — green
  - 🟡 **Apprentice** — yellow
  - 🟠 **Adept** — orange
  - 🔴 **Master** — red
- XP reward (100 / 150 / 200 / 300)
- Completion status dot

The player can filter by **topic** or **difficulty** using the tab row at the top. Completed quests show a checkmark so the player always knows what's left.

---

## 3. Attempting a Quest

The player clicks a quest card and lands on the Quest Detail page at `/quest/:id`. The page shows:

- **Objective** — a plain-English description of the problem
- **Preamble** (read-only) — boilerplate that handles stdin reading, shown above the editor so the player understands the input format
- **Code editor** — pre-loaded with a starter function stub; the player fills in the logic
- **Language badge** — Python or JavaScript, matching the quest

The player writes their solution and clicks **Submit**.

---

## 4. Code Execution

On submit, the app:

1. Creates a `submission` row in the database (status: `pending`) via Axios
2. POSTs to the `execute` Edge Function, passing the quest ID, submission ID, and source code
3. The Edge Function combines the preamble with the player's code and sends it to **Judge0 CE** (a sandboxed code runner) — asynchronously, polling until a result is ready
4. Each test case is graded: the actual output is compared to the expected output
5. The submission row is updated to `passed` or `failed`
6. The result is returned to the client and rendered in the **Execution Output** section

The player sees each test case as a pass (green) or fail (red) row, with actual vs. expected output displayed on failure.

---

## 5. AI Hint on Failure

If any test case fails, the app immediately and automatically calls the `hint` Edge Function in the background. The function:

1. Takes the player's code, the error output (stderr), and the quest description
2. Sends a structured prompt to **Google Gemini** asking for a plain-English hint
3. The hint explains *what went wrong conceptually* and *how to think about fixing it* — it never gives away the answer
4. The hint is stored on the submission row and displayed in the **AI Analysis** card

The player reads the hint, adjusts their approach, and clicks **Resubmit** to try again. Resubmitting patches the existing submission row (Update operation) rather than creating a new one, keeping the history clean.

---

## 6. Passing a Quest

When all test cases pass:

- The Execution Output section turns green
- The `execute` function checks whether this is the player's **first passing submission** for this quest
- If it is, their XP is incremented by the quest's reward (100–300 XP depending on difficulty)
- XP is awarded server-side only — the client never controls progression state
- An XP toast notification appears in the UI

The quest card on the board updates to show a checkmark.

---

## 7. Submission History

Below the editor, the player can see every attempt they've made on the current quest:

- Attempt number, status dot, and timestamp
- **Resubmit** — loads the previous code back into the editor and re-runs execution (PATCH operation)
- **Delete** — removes the attempt from history (DELETE operation)

This gives the player full control over their submission history and demonstrates all four CRUD operations.

---

## 8. Profile & Rank Progression

The player navigates to `/profile` to see:

- **Avatar and username**
- **Current rank** with a color-coded badge
- **XP progress bar** showing progress toward the next rank
- **Stats** — quests attempted and quests passed
- **Rank Ladder** — all four tiers with XP thresholds, current rank highlighted, locked tiers shown with a lock icon
- **Recent submissions** — full history across all quests, with quest title, status, and timestamp

### Rank thresholds

| Rank | XP Required |
|---|---|
| Novice | 0 |
| Apprentice | 500 |
| Adept | 1,500 |
| Master | 3,500 |

Rank is derived from XP on the client using a config file — it is not stored in the database, so it never gets out of sync.

---

## 9. Supporting the Project (Stripe)

At the bottom of the profile page, a **Support DevQuest** card lets the player make a voluntary donation:

1. The player enters an amount (minimum $1.00)
2. The app POSTs to the `donate` Edge Function, which creates a **Stripe Checkout Session** server-side — the Stripe secret key never reaches the browser
3. The player is redirected to Stripe's hosted checkout page
4. On success, they land on the `/thankyou` page with a confirmation message and a link back to the Quest Board

---

## 10. Logout

The player clicks **Logout** in the nav. The session is cleared via `supabase-js` and they are redirected to `/login`. Navigating to any protected route while logged out redirects back to `/login` automatically.

---

## Error States

Every failure path in the app surfaces a clear UI state:

| Scenario | What the player sees |
|---|---|
| Not logged in | Redirect to `/login` |
| Invalid credentials | Inline form error |
| Code compile error | 422 → stderr shown in execution output |
| Judge0 unavailable | 502 → "Judge is busy — please retry" with retry button |
| Hint service unavailable | Non-blocking — "Hint service unavailable — resubmit to try again" |
| Session expired | 401 → "Session expired — please log in again" |
| Quests fail to load | Error alert with message |

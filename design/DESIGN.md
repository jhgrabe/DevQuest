# Design assets

This file is the index for everything in `design/`. Claude Code reads it during Phase 6 (UI build) to find the right reference for each component and state. When building any page or component, check here first, then open the relevant file.

---

## How assets are organized

```
design/
├── DESIGN.md          ← this file
├── wireframes/        ← lo-fi layout sketches, flow diagrams
├── stitch/            ← Google Stitch hi-fi mockups (source of truth for UI)
└── schema/            ← database schema diagrams and ERDs
```

Naming convention: `<page>-<state>.png`
- Pages: `quest-board`, `quest-detail`, `profile`, `auth-register`, `auth-login`, `auth-confirm`
- States: `default`, `idle`, `passed`, `failed`, `filtered`, `empty`, `error`, `loading`

---

## Wireframes

| File | Shows |
|---|---|
| `wireframes/auth-flow.png` | Register → confirm → login flow |
| `wireframes/quest-board.png` | Quest board layout, filter controls |
| `wireframes/quest-detail.png` | Editor, submit button, result area, hint area, history |
| `wireframes/profile.png` | XP bar, rank display, submission history list |

---

## Stitch mockups (hi-fi — use these when building components)

| File | Page | State | Notes |
|---|---|---|---|
| `stitch/devquest-register.png` | Register | default | |
| `stitch/devquest-login.png` | Login | default | |
| `stitch/devquest-quests.png` | QuestBoard | default | All quests, no filter |
| `stitch/devquest-questsfiltered.png` | QuestBoard | filtered | Topic/difficulty filter active |
| `stitch/devquest-questdetail.png` | QuestDetail | idle | Editor loaded, not yet submitted |
| `stitch/devquest-questpassed.png` | QuestDetail | passed | Pass result, XP awarded |
| `stitch/devquest-questfailed.png` | QuestDetail | failed | Fail result + Gemini hint visible |
| `stitch/devquest-profile.png` | Profile | novice rank | XP bar, submission history |

> Add rows here as you drop in new screenshots. If a screenshot exists but isn't in this
> table, Claude Code won't know to use it.

---

## Schema diagrams

| File | Shows |
|---|---|
| `schema/devquest-erd.png` | Full ERD: quests, submissions, profiles, auth.users |

> The authoritative schema is in `supabase/migrations/`. These diagrams are visual
> references only — if they conflict with the migrations, the migrations win.

---

## Instructions for Claude Code

When building any UI component or page:
1. Check this file for the relevant mockup
2. Open the file and use it as the visual specification
3. Match layout, spacing, and states shown — do not invent UI that isn't in the mockup
4. If a state exists in the app but has no mockup, flag it and use best judgment

When building the schema or migrations:
1. Check `schema/` for the ERD
2. Cross-reference with ARCHITECTURE.md data model
3. The migration SQL is the source of truth
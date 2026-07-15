# Design Hygiene Log

Running log of **prototype artifacts that turned out not to be product
requirements**: pieces of UI that the original design exploration
included but, on review, were never fully defined, weren't essential,
or contradicted the product intent.

The goal is to catch these **before** implementation so they don't
become churn — every artifact in the prototype that hits an
implementation task becomes code, tests, and review cycles for
something nobody wanted.

## How this list grows

- When Mariany (or anyone) spots an element in `design/` (HTML
  prototype) that feels under-specified or non-essential, add an entry
  below.
- Each entry has: **Where**, **What was there**, **Decision**, **Fix
  applied** (or **Open**), **Date**.
- Resolved entries stay in the log as a record of "we deliberately
  removed this and the reasons".

## Resolved

### H1 · Inconsistent step indicator + "Skip" across onboarding (Screens 02-05) — 2026-06-19

> ⚠️ **Superseded in part by H3 (2026-06-27):** a 5th screen (Community
> Pact) was inserted into the flow, so the final numbering moved from
> "Step X of 4" to "Step X of 5". The decisions to remove "Skip" and
> add back navigation remain valid.

**Where:** Screens 02 (Choose City), 03 (AI Camera), 04
(Gamification), 05 (Your Neighborhood) — both in `design/src/screens/`
and the task specs under `docs/tasks/`.

**What was there:**

- Screen 02 had "Step 2 of 5" but no "Skip".
- Screens 03, 04, 05 had a "Skip" button (top-right) but no step indicator.
- The "5" in "Step 2 of 5" had no clear referent — there were only
  4 actionable steps in the flow.
- "Skip" let the user exit onboarding from any of the tutorial steps,
  which contradicts the product intent of "understanding the app on
  first launch is essential".

**Decision:** Make the four onboarding screens (02, 03, 04, 05)
**fully consistent**:

- Add `Step X of 4` to every screen. Numbering: 02=1/4, 03=2/4,
  04=3/4, 05=4/4. (Splash is not a step — it doesn't ask for any
  action.)
- **Remove "Skip" everywhere.** The user must complete all 4 steps.
- Add a back button on 03, 04, 05 (and disable it on 02 since there's
  no previous step). The user can revisit a step but not skip ahead.
- Screen 05 still has a **"Allow later"** link — but that's
  permission-deferral, not onboarding-skip. The user did see all 4
  steps and the flow is marked complete.

**Fix applied:**

- `design/src/screens/02-city-select.js` → "Step 1 of 4"
- `design/src/screens/03-onboarding-camera.js` → back + "Step 2 of 4" (removed Skip)
- `design/src/screens/04-onboarding-gamification.js` → back + "Step 3 of 4" (removed Skip)
- `design/src/screens/05-onboarding-neighborhood.js` → back + "Step 4 of 4" (removed Skip)
- Task specs updated to match: `02-city-select/01`, `03-onboarding-camera/01`, `03-onboarding-camera/02-onboarding-step-machine.md`, `03-onboarding-camera/_README.md`, `04-onboarding-gamification/01`, `05-onboarding-neighborhood/01`, `05-onboarding-neighborhood/02-location-permission.md`, `05-onboarding-neighborhood/_README.md`.
- State machine no longer exposes `skip()`; only `next()` and `back()`. Analytics event `onboarding.skipped` removed; `onboarding.step_back` added in its place.
- `StepIndicator` molecule (already in design system) consumed by all 4 screens with `{ step, total: 4 }`.

---

### H3 · Insertion of the "Community Pact" screen (04b) into onboarding — 2026-06-27

**Where:** new file `design/src/screens/04b-onboarding-community-pact.js` + new folder `docs/tasks/04b-onboarding-community-pact/` (with `_README.md` + 4 sub-tasks).

**What was new:** Onboarding previously had 4 steps (Choose City → AI
Camera → Gamification → Your Neighborhood). It was missing a screen
that explicitly established the **community pact**: moderation of
false reports and offensive content, consequences (XP / suspension),
identity via Gov.br, LGPD, and the non-partisan character (we
represent the Brazilian people, not political parties).

**Decision:** Add a 5th screen between Gamification (04) and Your
Neighborhood (05). Named **04b** in the filename (rather than
renumbering the 25+ screens that follow just to accommodate the
insertion). In the flow, it becomes **Step 4 of 5**.

**Fix applied:**

- Prototype: created `04b-onboarding-community-pact.js` with a header
  (back + Step 4 of 5), a hero that rotates copy by age bracket
  (`<18`, `+18`, `+30`, `+60` — Gov.br selects it in production, the
  demo rotates every 10s), 5 cards (🇧🇷 Non-partisan community → 🚨
  false reports → ⚖️ consequences → 🔐 identity → 🛡️ LGPD), a sticky
  footer with a terms-acceptance checkbox gating the CTA, and a modal
  bottom sheet with a draft of the platform's terms (9 clauses).
- `screens/index.js` registry updated: `onbPact` inserted between
  `onbGame` and `onbHood`.
- Step indicators on the other 4 onboarding screens bumped from "of 4"
  to "of 5" (`02/01`, `03/01`, `04/01`, `05/01`).
- State machine (`03/02-onboarding-step-machine.md`) updated: 5 steps,
  new step key `community_pact` between `gamification` and
  `neighborhood`, all Given/When/Then and DoD adjusted accordingly.
- READMEs for 03 and 05 updated (Step X of 5 + the new order including
  Community Pact).
- 04/01 and 05/01: internal Next/Back references adjusted to point to
  Community Pact.
- New docs under `docs/tasks/04b-onboarding-community-pact/`:
  `_README.md` + `01-render-community-pact-ui.md` +
  `02-age-tailored-message-rotator.md` + `03-terms-modal.md` +
  `04-accept-terms-gate.md`.
- Master `docs/tasks/README.md` updated: 04b added to the folder tree +
  coverage updated to "31 screens".

**Reuse applied:** the terms modal is a candidate to become
`TermsModal` in `packages/design_system/src/organisms/` once screen 28
(Citizen Profile / Settings) also needs it (re-displaying terms for
new versions, or showing a historical version). Decision logged in
`open-questions.md` as a pending item: "promote `TermsModal` to the
design system when the second consumer arrives".

---

### H2 · Two parallel prototypes (monolithic + modular) — 2026-06-19

**Where:** `design/index.html` (monolithic, 4015 lines, all screens
inline) vs `design/prototype.html` + `design/src/screens/*.js`
(modular, ES modules, 29 screens).

**What was there:** Two prototypes coexisted in the `design/` folder
with the same content duplicated. Edits made to the modular
`src/screens/*.js` files didn't show up when visiting
`http://localhost:5173/`, because the Python server serves
`index.html` (the monolithic one) by default. Mariany ran
`python3 -m http.server` in the `design/` folder and saw the legacy
prototype, without the recent changes (Step X/4 + removal of "Skip").

**Decision:** Keep only the **modular** prototype as the single source
of truth. Reuse principle: never duplicate a component or
documentation.

**Fix applied:**

- `git rm design/index.html` (removes the monolithic version — git
  preserves it in history).
- `git mv design/prototype.html design/index.html` (renames the
  modular version so it's served by default).
- Restarting `python3 -m http.server` makes `localhost:5173/` load the
  modular version.
- The 65 specs under `docs/tasks/*` that reference `design/index.html`
  keep working — the filename stayed the same.

---

## Open

(nothing yet — add new findings as bullets below; promote to a
numbered entry above when resolved.)

- _Add new prototype-vs-product gaps here..._

---

## Triaging convention

Use the same shape as `open-questions.md`:

- **Where** — which prototype file(s) + which task spec(s).
- **What was there** — the artifact as it stood.
- **Decision** — the call you made.
- **Fix applied** — the concrete edits, with paths.
- **Date** — when it was settled.

This log is meant to be reviewed alongside `open-questions.md`
(unresolved uncertainties) and the task catalog. It's the **artifact
removal log**, distinct from product roadmap and from open product
questions.

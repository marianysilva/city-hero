# SCREEN 03 · Onboarding · AI Camera

> **Group:** 01 · Entry & Onboarding
> **Prototype screen:** `design/index.html` (search for `title: 'Onboarding · Câmera IA'`)
> **Position in navigation:** Step 2 of 5 onboarding steps (after City Select)

## Overview

The second onboarding step (and the first of the three tutorial
screens). It introduces the product's most distinctive capability —
the AI camera — through a visual demo: a stylized scene with a
pothole, AR-like detection brackets, and a label "BURACO · 94%". The
copy makes the promise: "Aponte. A IA reconhece." The user understands
that reporting will not be a long form.

The screen is part of the 5-step onboarding flow (City Select → AI
Camera → Gamification → Community Pact → Neighborhood). This is also where the
**onboarding state machine** is established (next / back / persistence)
that the next two tutorial screens reuse.

## Features (3 tasks)

| # | Task | Effort | Depends on |
|---|------|--------|-----------|
| 01 | [Render UI · illustration, copy, pagination, buttons](./01-render-onboarding-camera-ui.md) | S | `00-foundation/02-design-tokens.md` |
| 02 | [Onboarding step machine and progress persistence](./02-onboarding-step-machine.md) | S | task 01, `00-foundation/05-api-client.md` |
| 03 | [Reduced-motion and accessibility variant of the illustration](./03-reduced-motion-illustration.md) | S | task 01 |

## Suggested implementation order

```
01 (UI) ──┬─→ 02 (state machine — shared by all 3 onboarding steps)
          └─→ 03 (a11y / reduced motion)
```

## Product notes

- The illustration must convey "AI knows what it sees" without being too literal. Bounding-box-style brackets do most of the work.
- **No "Pular" / Skip path.** Understanding the app on first launch is essential — all 5 onboarding steps must be completed sequentially. The user can go back but not skip ahead.
- The order of the 5 onboarding steps is fixed: City Select → Camera AI → Gamification → Community Pact → Neighborhood.
- Onboarding progress is **per-user** (server-stored when authenticated; local when not).

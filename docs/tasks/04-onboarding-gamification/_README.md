# SCREEN 04 · Onboarding · Gamification

> **Group:** 01 · Entry & Onboarding\
> **Prototype screen:** `design/index.html` (search for `title: 'Onboarding · Gamificação'`)\
> **Position in navigation:** Step 3 of 5 onboarding steps (second of the three tutorial screens,
> after AI Camera)

## Overview

The third onboarding step (the second of the three tutorial screens). It introduces the gamification
loop — XP, levels (Citizen → Watchman → Guardian), and badges — with an animated badge that shines
and a progress bar that hints at the loop the user will live in.

The promise: "Reportar é trabalhar pela cidade — e a gente reconhece."

## Features (2 tasks)

| #   | Task                                                                                                           | Effort | Depends on                                                             |
| --- | -------------------------------------------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------- |
| 01  | [Render UI · badge illustration, levels, copy, pagination, buttons](./01-render-onboarding-gamification-ui.md) | S      | `00-foundation/02-design-tokens.md`                                    |
| 02  | [Reduced-motion variant of the illustration](./02-reduced-motion-illustration.md)                              | S      | task 01, shared `useReducedMotion` hook from `03-onboarding-camera/03` |

## Suggested implementation order

```
01 (UI) ──→ 02 (a11y / reduced motion)
```

Both tasks plug into the shared state machine defined in
`03-onboarding-camera/02-onboarding-step-machine.md` for navigation and progress persistence. No
state-machine task lives here — that work was done at step 1.

## Product notes

- Badge animation must convey "earnable but reachable" (not flashy / pay-to-win).
- The level naming (Cidadão → Vigilante → Guardião) is part of the brand voice — it's heroic without
  being self-important.
- The XP progress bar shows a small fill (e.g., 20%) to imply early progress is reachable; avoid
  showing 0% (demotivating) or 100% (no journey left).

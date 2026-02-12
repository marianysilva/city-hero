# SCREEN 14 · Detail · Ticket (resolved)

> **Group:** 02 · App Core
> **Prototype screen:** `design/index.html` (search for `title: 'Detalhe do Ticket'`)
> **Position in navigation:** Reached when a previously-open report (SCREEN 13) is resolved by the prefecture, or directly from My Reports / feed / share links for already-resolved reports

## Overview

The **trust-closing** screen — the report has been resolved and the
prefecture posted a "depois" photo. The hero shows an interactive
**before/after slider** the user can drag to see the change, the
timeline includes the full path including SLA escalations, and the
moderated comments section is the same as SCREEN 13 (reused).

The bottom CTAs differ from SCREEN 13: instead of Apoiar (the problem
is gone, so support is moot), the primary action is **"⭐ Avaliar +15
XP"** — tapping it opens the NPS feedback screen (SCREEN 15) where the
user rates the resolution.

This screen is the proof-of-impact moment. Done right, it converts a
user into a long-term advocate.

## Features (6 tasks)

| # | Task | Effort | Depends on |
|---|------|--------|-----------|
| 01 | [Render UI base · same shell as SCREEN 13 + closed-state styling](./01-render-detail-ticket-ui-base.md) | S | `13-detail-in-progress/01-render-detail-ui-base.md` |
| 02 | [Before/after slider hero · interactive drag handle](./02-before-after-slider.md) | M | task 01 |
| 03 | [Summary card variant · "Atendido em N dias"](./03-summary-card.md) | S | task 01, `13-detail-in-progress/03-summary-card.md` |
| 04 | [Timeline variant · closed states + SLA escalation entries](./04-timeline-resolved.md) | S | task 01, `13-detail-in-progress/04-timeline.md` |
| 05 | [Bottom CTAs · Compartilhar + Avaliar → NPS](./05-avaliar-cta.md) | M | task 01, `07-civic-feed/07-compartilhar-action.md` |
| 06 | [Overflow menu variant · resolved-specific options](./06-overflow-menu.md) | S | task 01, `13-detail-in-progress/07-overflow-menu.md` |

> **Reuse note**: Moderated Comments (the tag system from SCREEN 13 task
> 05) is fully reused on this screen — same component, same data shape,
> same backend endpoints. No new task here.

## Suggested implementation order

```
01 (UI shell) ──┬─→ 02 (slider) ────┐
                ├─→ 03 (summary) ───┤
                ├─→ 04 (timeline) ──┼─→ Reuse comments from SCREEN 13
                ├─→ 05 (Avaliar)  ──┤
                └─→ 06 (menu) ──────┘
```

## Product notes

- **The slider is the visual proof**: a static "before/after" image
  works, but the interactive drag is what makes the user understand the
  prefecture's work viscerally. Worth the extra effort.
- **"Avaliar" is the bifurcation to NPS**: tapping it routes to
  SCREEN 15 (NPS Feedback), which collects rating, tags, and optional
  comment. The XP reward (+15) is granted on **NPS submission**, not on
  tap.
- **Timeline includes escalations**: if the SLA was breached and the
  ticket was reescalated (per `features.md` § 7 SLA escalation), the
  timeline shows those entries with amber pills.
- **"Atendido em N dias"** replaces "SLA restante" — what mattered
  before submission is now history; what matters now is the resolution
  time, framed positively.
- **Resolved reports never disappear**: they live in the feed and on
  the map as proof of impact (with a "✓ RESOLVIDO" green chip).

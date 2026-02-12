# SCREEN 15 · NPS Feedback

> **Group:** 02 · App Core
> **Prototype screen:** `design/index.html` (search for `title: 'NPS · Feedback'`)
> **Position in navigation:** Reached when the user taps "⭐ Avaliar" on SCREEN 14 Detail · Ticket, or auto-presented after a resolution notification

## Overview

The post-resolution feedback survey. A celebration hero (mini before/
after slider + "Resolvido em N dias · Seu buraco virou asfalto ✨"),
a friendly **5-face rating scale** (more human than 0–10 on mobile),
a tag grid of pre-defined reasons (positive: ⚡ Rápido, 🔧 Bem feito,
💬 Comunicação clara; negative: ⏳ Demorou, 🧱 Solução provisória, 😕
Voltou a quebrar), and an optional free-text comment. The submission
grants **+15 XP** and feeds the prefecture's **Citizen Sentiment
Analysis** dashboard (per `features.md` § 4).

The screen is intentionally gentle — "Agora não" is right there at the
top, no dark patterns. But the celebration framing makes most users
want to engage.

## Features (6 tasks)

| # | Task | Effort | Depends on |
|---|------|--------|-----------|
| 01 | [Render UI base · gradient bg, header, sticky CTA, footer message](./01-render-nps-ui-base.md) | S | `00-foundation/02-design-tokens.md` |
| 02 | [Celebration hero · mini before/after + resolution context](./02-celebration-hero.md) | S | task 01, `14-detail-ticket/02-before-after-slider.md` |
| 03 | [5-face rating scale · interactive selection](./03-rating-scale.md) | S | task 01 |
| 04 | [Reason tag grid · positive + negative reasons](./04-reason-tags.md) | S | task 01 |
| 05 | [Optional comment input · with cap](./05-comment-input.md) | S | task 01 |
| 06 | [Submit · NPS API + XP grant + navigation](./06-submit-nps.md) | M | tasks 02-05, `00-foundation/05`, `00-foundation/09` |

## Suggested implementation order

```
01 (UI) ──┬─→ 02 (hero) ──┐
          ├─→ 03 (rating) ┤
          ├─→ 04 (tags) ──┼─→ 06 (submit)
          └─→ 05 (comment)┘
```

## Product notes

- **Defaults to "Bom" (4/5)**: not because we're biased — because the
  default reduces friction and keeps the median user from dropping
  off. Users can still pick 1 or 2.
- **Tags adapt to the rating**: choosing 1-2 ("Péssimo"/"Ruim") swaps
  the positive tags out of the visible row (the user can still scroll
  to see all). Choosing 5 ("Excelente") highlights positive tags.
- **The footer message is honest**: "Seu feedback vira dado público
  no painel da cidade." We don't pretend the data is private — it
  feeds the prefecture's scorecard.
- **"Agora não"** is intentionally friendly — pressuring users to
  submit a survey is a quick way to destroy trust. Easy out, no
  questions asked.
- **+15 XP is granted on submit**, not on screen mount. This is the
  cooperation reward, not just for tapping Avaliar.

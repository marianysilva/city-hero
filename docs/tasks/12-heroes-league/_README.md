# SCREEN 12 · Heroes League (post-submit, viral)

> **Group:** 02 · App Core\
> **Prototype screen:** `design/index.html` (search for `title: 'Liga de Heróis'`)\
> **Position in navigation:** Routed from SCREEN 10 Confirmação when the user picked "Identificada"

## Overview

The **viral, growth-loop** post-submit screen for **identified reports**. It does three things at
once:

1. **Celebrates** the submission (XP + medal banner with confetti).
2. **Explains the value of sharing with data** ("reportes com apoio resolvem em 3 dias vs 7" — a
   real prefecture stat that should be sourced before launch).
3. **Offers the right channels** for Brazilian context (WhatsApp primary, Stories, X/Threads, copy
   link, more) plus an **editable suggested message** and a **shareable preview card** that previews
   exactly what neighbors will see when they receive the link.

The achievement teaser **"Formador de Liga"** gives a clear goal (3 friends install the app),
turning the screen into a CAC engine — every shared link is a potential install.

## Features (8 tasks)

| #   | Task                                                                                                | Effort | Depends on                                         |
| --- | --------------------------------------------------------------------------------------------------- | ------ | -------------------------------------------------- |
| 01  | [Render UI base · hero + scroll + bottom bar](./01-render-league-ui-base.md)                        | S      | `00-foundation/02-design-tokens.md`                |
| 02  | [Success hero · checkmark + XP/medal celebration + confetti](./02-success-hero.md)                  | M      | task 01                                            |
| 03  | [Pivot copy section · "Todo herói tem sua liga" + data anchor](./03-pivot-copy.md)                  | S      | task 01                                            |
| 04  | [Shareable preview card · link preview mockup](./04-shareable-preview-card.md)                      | M      | task 01, `07-civic-feed/07-compartilhar-action.md` |
| 05  | [Share channel buttons · WhatsApp, Stories, X, Copy, More](./05-share-channels.md)                  | M      | task 01, `00-foundation/12-deep-link-handler.md`   |
| 06  | [Editable message template · suggested message + edit modal](./06-message-template.md)              | S      | task 01                                            |
| 07  | [Achievement teaser · "Formador de Liga" with referral progress](./07-formador-liga-achievement.md) | M      | task 01, `00-foundation/06-auth-system.md`         |
| 08  | [Bottom bar · "Pular" + "Compartilhar & formar liga"](./08-bottom-bar.md)                           | S      | task 01                                            |

## Suggested implementation order

```
01 (UI) ──┬─→ 02 (hero) ─────────────┐
          ├─→ 03 (pivot copy) ───────┤
          ├─→ 04 (preview card) ─────┼─→ 08 (bottom bar)
          ├─→ 05 (channels) ─────────┤
          ├─→ 06 (message template) ─┤
          └─→ 07 (achievement) ──────┘
```

## Product notes

- **Data anchor must be real**: "3 dias vs 7" should be derived from actual prefecture data once
  available. Before launch, mark the stat with a footnote or source it from a credible study. Lying
  with data damages trust irreversibly.
- **WhatsApp is primary for BR**: prioritize the WhatsApp channel visually (large icon, leftmost
  position) — it's where 95%+ of Brazilian sharing happens.
- **Preview card simulates a real link preview**: shows the user the link is well-formatted and
  looks professional, not a raw URL.
- **The CTA "🚀 Compartilhar & formar liga"** ties the share action to the gamification goal —
  sharing earns XP and progress toward "Formador de Liga".
- **"Pular" is intentional, not buried**: users who don't want to share must have a clear escape.
  Hiding it would create dark-pattern vibes.

# SCREEN 11 · Anonymous Send (post-submit, private)

> **Group:** 02 · App Core\
> **Prototype screen:** `design/index.html` (search for `title: 'Envio Anônimo'`)\
> **Position in navigation:** Routed from SCREEN 10 Confirmação when the user picked "Anônima" in
> the identification toggle

## Overview

The private, shadow-aesthetic post-submit screen for **anonymous reports**. It celebrates the action
with the same XP/medal credit as the identified path (no penalty for anonymity), then makes the
privacy posture **honest and visible**:

- A preview of how the report appears in the public feed (🥷 "Herói Anônimo").
- What the user **keeps** (XP, updates, ownership, ranking).
- **Who sees** the user's real name (the prefecture, by LAI; the user themselves in My Reports;
  **nobody else**).
- An optional anonymous link share (no viral pressure — the link itself is anonymous).
- A reversibility hint ("Mudou de ideia? Dá pra tornar público em Meus Reportes a qualquer
  momento").

The screen uses violet/indigo gradients and a 🥷 motif to reinforce the "shadow hero" framing
without making anonymity feel suspicious.

## Features (7 tasks)

| #   | Task                                                                                              | Effort | Depends on                                       |
| --- | ------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------ |
| 01  | [Render UI base · hero + scroll + bottom CTA](./01-render-anonymous-ui-base.md)                   | S      | `00-foundation/02-design-tokens.md`              |
| 02  | [Celebration hero · 🥷 icon, protocol, XP/medal badge](./02-celebration-hero.md)                  | S      | task 01                                          |
| 03  | [Anonymous feed preview card](./03-feed-preview-card.md)                                          | S      | task 01, `07-civic-feed/03-feed-item-card.md`    |
| 04  | [Educational panels · "O que você mantém" + "Quem vê seu nome" (LAI)](./04-educational-panels.md) | S      | task 01                                          |
| 05  | [Anonymous share UX · link copy + WhatsApp (no viral pressure)](./05-anonymous-share.md)          | M      | task 01, `00-foundation/12-deep-link-handler.md` |
| 06  | [Reversibility · "Tornar público em Meus Reportes"](./06-reversibility.md)                        | M      | task 01, `00-foundation/06-auth-system.md`       |
| 07  | [Bottom CTA · "Acompanhar reporte" → Detalhe](./07-bottom-cta.md)                                 | S      | task 01                                          |

## Suggested implementation order

```
01 (UI) ──┬─→ 02 (hero) ──────────┐
          ├─→ 03 (preview) ───────┤
          ├─→ 04 (panels) ────────┼─→ 07 (CTA)
          ├─→ 05 (share) ─────────┤
          └─→ 06 (reversibility) ─┘
```

## Product notes

- **Tone is "shadow hero", never "ashamed"**: copy like "Você age como ninja. O problema foi
  exposto." celebrates the choice.
- **Honesty about LAI**: the prefecture sees the real name. Pretending otherwise would be a legal
  and trust risk.
- **No viral pressure**: there's no "share to amplify and bring friends" framing. The share UX
  exists (the user might still want to share their own anonymous post), but it's quieter.
- **Reversibility builds trust**: knowing you can flip to public later reduces the friction of
  trying anonymous.
- **Same XP as identified**: makes anonymity a real choice, not a worse one.

# SCREEN 13 · Detail · In Progress

> **Group:** 02 · App Core
> **Prototype screen:** `design/index.html` (search for `title: 'Detalhe · Em andamento'`)
> **Position in navigation:** Reachable from feed pins, push notifications, share links, My Reports, and the post-submit screens (Liga / Envio Anônimo)

## Overview

The detail view of an **open** ticket — the report has been submitted and is
working its way through the prefecture's pipeline (triagem → chamado aberto
→ resposta → agendado → execução → resolvido). The screen shows:

- A **hero photo** (single image, no before/after — that's SCREEN 14) with
  status chips overlay.
- A **summary card** with title, reporter, distance, and three key stats
  (apoios, comentários, SLA restante).
- A detailed **timeline** ("Trajeto do ticket") of every state transition
  with timestamps and prefecture context.
- A **moderated comments** section using the tag system from `features.md`
  § 1 (Moderated Comments) — taps add the user's voice without exposing
  the chat to toxicity.
- Persistent **CTAs** at the bottom: Apoiar (engagement) + Compartilhar
  (external pressure).
- An **overflow menu** (⋯) with secondary actions: Enriquecer, Reportar
  problema, Tornar público/anônimo (when owner).

This is where citizens spend most of their time after submitting — and
where the prefecture's responsiveness becomes visible.

## Features (7 tasks)

| # | Task | Effort | Depends on |
|---|------|--------|-----------|
| 01 | [Render UI base · layout, sticky CTA, slots](./01-render-detail-ui-base.md) | S | `00-foundation/02-design-tokens.md` |
| 02 | [Hero with status chips and SLA badge](./02-hero-status-chips.md) | S | task 01 |
| 03 | [Summary card · title, reporter, stats](./03-summary-card.md) | S | task 01 |
| 04 | [Timeline of ticket states](./04-timeline.md) | M | task 01 |
| 05 | [Moderated comments · tag-based engagement](./05-moderated-comments.md) | M | task 01, `07-civic-feed/06-apoiar-action.md` |
| 06 | [Bottom CTAs · Apoiar + Compartilhar](./06-bottom-ctas.md) | S | task 01, `07-civic-feed/06-apoiar-action.md`, `07-civic-feed/07-compartilhar-action.md` |
| 07 | [Overflow menu · Enriquecer + extras](./07-overflow-menu.md) | M | task 01, `07-civic-feed/08-enriquecer-action.md`, `11-anonymous-send/06-reversibility.md` |

## Suggested implementation order

```
01 (UI) ──┬─→ 02 (hero) ────┐
          ├─→ 03 (summary) ─┤
          ├─→ 04 (timeline) ┼─→ 06 (bottom CTAs)
          ├─→ 05 (comments) ┤
          └─→ 07 (menu) ────┘
```

## Product notes

- **Timeline is the trust device**: it shows the prefecture is actually
  doing something (not just receiving). Every transition with a timestamp
  and context. Out-of-spec states (delays, blocks) should be visible too.
- **Comments are tag-based, not free-text**: per `features.md` and the
  prototype, this avoids toxicity and aligns with the engagement design.
- **Owner vs visitor**: the menu adapts. The report's owner sees
  "Tornar público/anônimo"; visitors don't. Both see Enriquecer.
- **Anonymous reports show the anonymous variant**: the summary's
  "Reportado por…" line becomes "🥷 Herói Anônimo"; the rest behaves
  identically.
- **Real-time updates**: status transitions arrive via WebSocket (per
  `06-home-map/08`) and the timeline animates in the new entry.

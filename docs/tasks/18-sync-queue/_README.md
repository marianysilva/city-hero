# SCREEN 18 · Sync Queue

> **Group:** 02 · App Core\
> **Prototype screen:** `design/index.html` (search for `title: 'Fila de Sincronização'`)\
> **Position in navigation:** Reached from the pending-offline card on My Reports, the offline
> banner on Home, or a notification when sync state changes meaningfully

## Overview

The screen the user opens when they want to know "what's in the backlog?" Reports captured offline
are listed here with their state: **Aguardando** (queued, awaiting sync), **Enviando · 64%**
(mid-upload with progress), **Falhou** (final failure with a retry affordance). A top connectivity
banner (amber→rose) reinforces "Sem conexão · 3 reportes na fila — estão salvos no seu celular, vão
sozinhos quando o sinal voltar".

The screen's job is **anxiety relief** — citizens can capture in dead zones and check that nothing
was lost, that the system has their back, and that XP is reserved.

## Features (5 tasks)

| #   | Task                                                                          | Effort | Depends on                                   |
| --- | ----------------------------------------------------------------------------- | ------ | -------------------------------------------- |
| 01  | [Render UI base · layout, header, slots](./01-render-sync-ui-base.md)         | S      | `00-foundation/02-design-tokens.md`          |
| 02  | [Connectivity banner · gradient + current state](./02-connectivity-banner.md) | S      | task 01, `00-foundation/09-offline-queue.md` |
| 03  | [Manual sync trigger · button + state](./03-manual-sync-trigger.md)           | S      | task 01, `00-foundation/09-offline-queue.md` |
| 04  | [Queue item list + card · state variants](./04-queue-list-and-card.md)        | M      | task 01, `00-foundation/09-offline-queue.md` |
| 05  | [Item actions · retry, discard, details](./05-item-actions.md)                | M      | task 04                                      |

## Suggested implementation order

```
01 (UI) ──┬─→ 02 (banner) ──────────┐
          ├─→ 03 (manual sync) ─────┤
          ├─→ 04 (list + card) ─────┼─→ 05 (item actions)
          └─────────────────────────┘
```

## Product notes

- **XP is reserved on enqueue, not deferred to sync** (per `00-foundation/09-offline-queue.md`). The
  screen reinforces this in the failed-state messaging so users don't worry about losing the reward.
- **"Sincronizar" is disabled when offline**: showing it disabled rather than hidden teaches the
  user it exists but isn't available right now.
- **Failed items get explicit retry**: respect the user's agency. Automatic background retries
  happen too (per the foundation queue orchestrator), but a "Tentar de novo" button reinforces user
  control.
- **Discarding requires confirmation**: failed items might still succeed; we don't let the user lose
  work casually.
- **Anonymized photos shown as thumbnails**: per LGPD, only the anonymized variant is displayed in
  the queue UI as well.

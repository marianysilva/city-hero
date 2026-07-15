# SCREEN 19 · Notifications

> **Group:** 02 · App Core\
> **Prototype screen:** `design/index.html` (search for `title: 'Notificações'`)\
> **Position in navigation:** Reached from the More menu or from tapping a push notification badge

## Overview

The notification inbox. Notifications come from many sources: ticket state changes (✅ Resolved!),
XP gains (⚡ +80 XP), achievement progress (🌙 Vigia Noturno 3/5), social interactions (🔥 5 pessoas
apoiaram), prefecture announcements (🏛️ Nova obra perto de você), and enrichment events (📷 Alguém
adicionou foto).

Each notification has a colored icon (per category), a title, a short description, and a relative
time. Unread notifications get a subtle brand-tinted background + a dot indicator on the icon. The
list is **time-grouped** (Hoje, Ontem, Essa semana, Mais antigas) for scanability.

The header has a "Marcar lidas" action that clears all unread states. Filter chips at the top (Tudo,
Status, Conquistas, Comunidade) let the user narrow the view.

## Features (5 tasks)

| #   | Task                                                                                      | Effort | Depends on                                               |
| --- | ----------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------- |
| 01  | [Render UI base · header, filter chips, list slots](./01-render-notifications-ui-base.md) | S      | `00-foundation/02-design-tokens.md`                      |
| 02  | [Filter chips · Tudo, Status, Conquistas, Comunidade](./02-filter-chips.md)               | S      | task 01                                                  |
| 03  | [Time-grouped list · sections + virtualization](./03-time-grouped-list.md)                | M      | task 01, `00-foundation/05-api-client.md`                |
| 04  | [Notification card · icon, copy, tap routing per type](./04-notification-card.md)         | M      | task 03, `00-foundation/11-push-notification-handler.md` |
| 05  | [Mark-as-read · per item + "Marcar lidas" bulk](./05-mark-as-read.md)                     | S      | task 04                                                  |

## Suggested implementation order

```
01 (UI) ──┬─→ 02 (filters) ──┐
          ├─→ 03 (list) ─────┼─→ 04 (card) ──→ 05 (read state)
          └──────────────────┘
```

## Product notes

- **Colored icons reinforce the type at a glance**: emerald for resolution, yellow-gold for XP
  (deliberate — gold = reward), purple for achievements, rose for social, sky for prefecture, slate
  for enrichment, amber for level-up.
- **XP gain uses yellow-gold**: the color reinforces the reward loop.
- **Tap routing differs per type**: a status notification opens the ticket detail; an achievement
  opens the achievement detail; a prefecture announcement opens the official feed (SCREEN 21); etc.
- **"Marcar lidas" is single-shot**: tapping once clears all unread, no confirmation. The user can
  always tap a notification to "re-read" it.
- **Pull-to-refresh fetches new notifications**: the screen is mostly push-driven, so
  pull-to-refresh is a fallback for missed pushes.

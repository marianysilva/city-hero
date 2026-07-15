# SCREEN 21 · Prefecture News

> **Group:** 02 · App Core\
> **Prototype screen:** `design/index.html` (search for `title: 'Avisos da Prefeitura'`)\
> **Position in navigation:** From the More menu, the badge on Home, the discovery card, or push
> notifications

## Overview

The **official, moderated channel** of the prefecture — where the city posts announcements
categorized by topic: Alertas (emergencies), Saúde, Obras, Educação, Eventos, etc. Critical alerts
(Defesa Civil warnings, water shutdowns) are **pinned at the top** with strong visual emphasis. The
screen establishes the prefecture's authoritative voice while keeping the social citizen feed
separate (per `design/index.html` note: "não é feed cidadão, só a prefeitura posta").

The header has a 🏛️ icon + "Canal oficial · verificado" badge + the city's "Informa" name (e.g.,
"Pôrto Belo Informa"). Filter chips slice by category.

## Features (5 tasks)

| #   | Task                                                                            | Effort | Depends on                                |
| --- | ------------------------------------------------------------------------------- | ------ | ----------------------------------------- |
| 01  | [Render UI base · official header, layout, slots](./01-render-news-ui-base.md)  | S      | `00-foundation/02-design-tokens.md`       |
| 02  | [Category filter chips · sticky horizontal row](./02-category-chips.md)         | S      | task 01                                   |
| 03  | [Pinned alert card · gradient + emergency emphasis](./03-pinned-alert-card.md)  | M      | task 01                                   |
| 04  | [News list · paginated cards + categories](./04-news-list.md)                   | M      | task 01, `00-foundation/05-api-client.md` |
| 05  | [Detail bottom sheet · expanded announcement view](./05-detail-bottom-sheet.md) | M      | task 04                                   |

## Suggested implementation order

```
01 (UI) ──┬─→ 02 (chips) ──┐
          ├─→ 03 (pinned) ─┤
          └─→ 04 (list) ───┴─→ 05 (detail sheet)
```

## Product notes

- **Pinned alerts**: only Defesa Civil emergencies and similar get the prominent gradient treatment.
  Routine announcements use standard cards.
- **Verified badge**: the "Canal oficial · verificado" reinforces this is the prefecture's voice —
  important for combating misinformation.
- **Categories follow the prefecture's structure**: Alertas, Saúde, Obras, Educação, Eventos,
  Transparência. Some cities may add or rename; the catalog is configurable.
- **Notification preferences are intentionally not on this screen.** The product hasn't defined
  which notifications to send or how the preferences UX should work yet; revisit when the catalog is
  known. Per-user preferences (when designed) live under Mais → Configurações
  (`28-citizen-profile/06-settings-and-logout.md`).
- **Cross-links to Obras**: prefecture announcements about a specific public work link to SCREEN 27
  (Public Work Detail).
- **Web-fallback for shared announcements**: each announcement has a shareable universal link →
  preview card → web fallback.

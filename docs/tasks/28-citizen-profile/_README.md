# SCREEN 28 · Citizen Profile

> **Group:** 03 · Gamification
> **Prototype screen:** `design/index.html` (search for `title: 'Perfil Cidadão'`)
> **Position in navigation:** Root tab — Profile in the bottom nav

## Overview

The user's hub for **gamification** and self-identity. A gradient hero
with the user's avatar, name, level title ("Guardião do Bairro"), and
XP progress bar to the next level. Below: stats grid (reportes,
apoios, comentários, % cidade ajudada), recent medals carousel, recent
activity feed (level-ups, achievements, big supports), and quick links
to SCREEN 29 (Achievements) + SCREEN 30 (Ranking).

The screen is where users come for **identity validation** — they see
themselves as a hero, with concrete proof.

## Features (7 tasks)

| # | Task | Effort | Depends on |
|---|------|--------|-----------|
| 01 | [Render UI base · hero, scroll, slots, bottom nav](./01-render-profile-ui-base.md) | S | `00-foundation/02-design-tokens.md`, `00-foundation/03-bottom-nav-component.md` |
| 02 | [Profile hero · avatar, name, level, XP bar](./02-profile-hero.md) | M | task 01 |
| 03 | [Stats grid · reportes, apoios, comentários, impact](./03-stats-grid.md) | S | task 01, `00-foundation/05-api-client.md` |
| 04 | [Recent medals carousel + link to Achievements](./04-medals-carousel.md) | M | task 01 |
| 05 | [Recent activity feed](./05-activity-feed.md) | M | task 01 |
| 06 | [Settings + edit profile + logout](./06-settings-and-logout.md) | M | task 01, `00-foundation/06-auth-system.md` |
| 07 | [Profile switcher (dev only) · test persona swap](./07-profile-switcher.md) | S | task 06 |

## Suggested implementation order

```
01 (UI) ──┬─→ 02 (hero) ────┐
          ├─→ 03 (stats) ───┤
          ├─→ 04 (medals) ──┼─→ 06 (settings) ─→ 07 (dev switcher)
          └─→ 05 (activity)─┘
```

## Product notes

- **The level title carries identity weight**: "Cidadão", "Vigilante", "Guardião do Bairro", "Líder da Liga", "Herói da Cidade" — escalating significance.
- **XP bar shows the path to the next level**: motivation through visible progression.
- **Medals carousel previews ~3-5 most recent**: tapping any opens SCREEN 29 with that medal scrolled to.
- **Activity feed is shareable**: each entry has a small share affordance for personal achievement sharing.
- **Settings includes**: language, theme, privacy controls (anonymity default, opt-out of AI training), account management. **Notifications row is reserved but disabled** until the product defines the catalog.
- **Settings is the single entry point** for every user preference in the app. Other screens (feed, prefecture news) do **not** expose settings sheets.
- **Profile switcher (task 07)** is dev/staging-only — a quick way to swap personas (Citizen, Vigilant, Guardian, Prefecture Manager, Field Team) without going through real login flows, enabling end-to-end testing of role-specific features while there's no login system yet.

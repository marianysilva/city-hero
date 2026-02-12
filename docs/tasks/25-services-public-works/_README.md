# SCREEN 25 · Services & Public Works

> **Group:** 02 · App Core
> **Prototype screen:** `design/index.html` (search for `title: 'Serviços & Obras'`)
> **Position in navigation:** From the More menu

## Overview

A hub linking to the city's services and public works in one place. A
2-column grid of large cards covers: 🚧 Obras em Andamento (links to
SCREEN 26), 📋 Solicitar Serviço (request a city service like
ILUMINAÇÃO, PODA), 🩺 UBS Mais Próximas, 🎓 Escolas, 🚌 Transporte, 📞
Telefones Úteis, etc. Each card shows an emoji + label + short
subtitle. Tapping each navigates to the appropriate destination
(SCREEN 26 for public works; future screens for the rest).

The screen is a **discovery surface** — citizens find what they need
without searching menus.

## Features (4 tasks)

| # | Task | Effort | Depends on |
|---|------|--------|-----------|
| 01 | [Render UI base · header, grid, slots](./01-render-services-ui-base.md) | S | `00-foundation/02-design-tokens.md` |
| 02 | [Service cards grid · 6+ entries with deep links](./02-service-cards-grid.md) | M | task 01 |
| 03 | [Search overlay · find a service by keyword](./03-search-overlay.md) | S | task 01 |
| 04 | [Useful contacts footer · 198, 192, 199, etc.](./04-useful-contacts.md) | S | task 01 |

## Suggested implementation order

```
01 (UI) ──┬─→ 02 (grid) ──→ deep links
          ├─→ 03 (search)
          └─→ 04 (contacts)
```

## Product notes

- **Cards are configurable per city**: each city's service catalog differs.
- **Useful contacts** (emergency numbers, helplines) are always available — even offline.
- **Some cards link to external resources** (the prefecture's existing services portal); when possible, deep-link into specific sections.
- **Search is opt-in**: not every user wants the keyboard; the grid is browseable without typing.

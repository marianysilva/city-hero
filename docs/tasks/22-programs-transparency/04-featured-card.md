# Programs · Featured Bolsa Família card

> **Type:** Screen feature · UI + content
> **Screen:** SCREEN 22 · Programs & Transparency
> **Effort:** M (1-2 days)
> **Dependencies:** `22-programs-transparency/01-render-programs-ui-base.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `backend`, `screen`

## Context

A prominent gradient (sky → teal) hero card highlighting the **featured
program** of the city (Bolsa Família for the Pôrto Belo MVP). The card
includes: governance + theme pills ("FEDERAL · SOCIAL"), a "⭐ EM
DESTAQUE" pill, the program emoji + name + description, and a 3-cell
KPI grid (famílias, valor mensal, índice de pobreza vs comparável).
Tapping opens SCREEN 23 (Bolsa Família detail).

The "featured" mechanic is configurable per city — different cities
spotlight different programs.

## Acceptance Criteria

### Scenario · Default render

**Given** the city has a featured program
**When** the card renders
**Then** a sky→teal gradient card appears below the chips
**And** displays: governance + theme pill ("FEDERAL · SOCIAL"), "⭐ EM DESTAQUE" pill
**And** program emoji + name in extrabold + 1-2-line description
**And** a 3-cell KPI grid showing the program's key metrics

### Scenario · Tap the card

**Given** the card is rendered
**When** the user taps it
**Then** the app navigates to the program detail (SCREEN 23 for Bolsa Família)
**And** light haptic feedback fires

### Scenario · Hidden if filter doesn't match

**Given** the user picked a filter (e.g., "Saúde") that doesn't include the featured program
**When** the screen re-renders
**Then** the featured card is hidden
**And** the layout adjusts cleanly

### Scenario · Featured program changes per city

**Given** a different city has a different featured program
**When** the screen loads
**Then** the card pulls from the city's featured-program config
**And** the destination on tap is the appropriate detail screen

### Scenario · KPI freshness

**Given** the program data has a freshness timestamp
**When** the KPIs render
**Then** values are accurate to the source's last update
**And** a small footnote shows the source ("Fonte: Portal da Transparência · jan/2026")

### Scenario · No featured program

**Given** the city has no featured program configured
**When** the screen renders
**Then** the featured slot is hidden
**And** the layout proceeds to the grid

### Scenario · Localization

**Given** en-US
**When** the card renders
**Then** the program name and description are localized

### Scenario · Accessibility

**Given** SR is on
**When** the card is read
**Then** it's announced as a button with the program name, description, and key KPIs

## Frontend

```
apps/city-hero/src/screens/Programs/
├── components/
│   └── FeaturedProgramCard.tsx
└── hooks/
    └── useFeaturedProgram.ts
```

## Backend

| Method | Path                                    | Purpose                             |
| ------ | --------------------------------------- | ----------------------------------- |
| GET    | `/api/v1/cities/{id}/programs/featured` | Returns the city's featured program |

The endpoint returns the program's identifier + key metrics. The detail screen does its own deep fetch.

## Database

`cities.featured_program_id` field. The featured program is an entry in the `programs` table.

## Edge Cases

- **Featured program data unavailable**: card shows soft skeleton.
- **Multiple featured programs (future)**: only the first renders for MVP; others use the grid.

## Privacy / LGPD

Aggregated program data; no individual records.

## Analytics

| Event                        | When         | Props        |
| ---------------------------- | ------------ | ------------ |
| `programs.featured_rendered` | Card mounted | `program_id` |
| `programs.featured_pressed`  | User tapped  | `program_id` |

## Tests

- **Unit**: card renders; KPI grid; filter visibility.
- **Snapshot**: each program variant.
- **A11y**: card group announced as a button.

## Definition of Done

- [ ] FeaturedProgramCard component
- [ ] useFeaturedProgram hook
- [ ] Backend featured endpoint
- [ ] Per-city featured config
- [ ] Filter integration
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

- Cross-cutting: `docs/engineering/`
- Bolsa Família detail (destination): `docs/tasks/23-bolsa-familia-detail/`
- `CLAUDE.md`

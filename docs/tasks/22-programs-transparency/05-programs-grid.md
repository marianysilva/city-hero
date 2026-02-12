# Programs · Programs grid

> **Type:** Screen feature · UI + data
> **Screen:** SCREEN 22 · Programs & Transparency
> **Effort:** M (1-2 days)
> **Dependencies:** `22-programs-transparency/01-render-programs-ui-base.md`, `00-foundation/05-api-client.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `backend`, `screen`

## Context

A 2-column grid of compact program cards below the featured card. Each
card shows: program emoji + colored icon background, governance level
badge (FEDERAL/ESTADUAL/MUNICIPAL with distinct colors), program name,
key metric (e.g., "R$ 2,4M/ano" or "320 beneficiados"), and a short
subtitle.

Tapping a card opens its detail screen (Bolsa Família → SCREEN 23;
others share a similar generic detail UX).

## Acceptance Criteria

### Scenario · Default render

**Given** the city has programs in the catalog
**When** the grid renders
**Then** cards appear in a 2-column grid
**And** each card shows: colored icon square + level pill in the top-right (FEDERAL/ESTADUAL/MUNICIPAL), name in extrabold, prominent metric, short subtitle

### Scenario · Level color cues

**Given** programs have different governance levels
**When** rendered
**Then** the level pill color matches: FEDERAL→teal, ESTADUAL→indigo, MUNICIPAL→amber

### Scenario · Filter applied

**Given** the user picked a category filter
**When** the grid renders
**Then** only matching programs appear
**And** if no programs match, an empty state appears ("Nada em {category} agora")

### Scenario · Tap a program

**Given** the user taps a card
**When** the action runs
**Then** the app navigates to the program's detail (SCREEN 23 for Bolsa Família; a generic detail screen for others)

### Scenario · Metric formatting

**Given** monetary metrics
**When** rendered
**Then** R$ uses compact format ("R$ 2,4M" / "R$ 18,4K")
**And** counts use compact format ("1,2k beneficiários")

### Scenario · Pagination

**Given** many programs
**When** the user scrolls
**Then** the next page fetches via cursor pagination
**And** the grid extends naturally

### Scenario · Localization

**Given** en-US
**When** the grid renders
**Then** level labels translate (FEDERAL/STATE/CITY)
**And** currency formats per locale

### Scenario · Accessibility

**Given** SR is on
**When** cards are navigated
**Then** each is announced with name, level, metric, subtitle
**And** activating navigates to the detail

## Frontend

```
apps/mobile/src/screens/Programs/
├── components/
│   ├── ProgramsGrid.tsx
│   └── ProgramCard.tsx
└── hooks/
    └── usePrograms.ts
```

`usePrograms` is a `useInfiniteQuery` keyed on city + filter.

## Backend

| Method | Path                                                                  | Purpose                              |
|--------|-----------------------------------------------------------------------|---------------------------------------|
| GET    | `/api/v1/cities/{id}/programs?category=&cursor=&limit=`               | Paginated programs                  |

Multi-tenant scoping; sorts by featured-first then by name.

## Database

The `programs` table has fields: id, city_id, key (e.g., `bolsa_familia`), name_key, emoji, icon_bg_color, level (federal/state/municipal), category, primary_metric_label, primary_metric_value, subtitle_key, data_source.

## Edge Cases

- **Long names**: truncate.
- **Missing metric**: hidden with "—" placeholder.
- **Network error**: cached grid renders if available.

## Privacy / LGPD

Aggregate data.

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `programs.grid_loaded`             | First page rendered                        | `count`, `filter`                     |
| `programs.card_pressed`            | User tapped a card                         | `program_id`, `level`                |

## Tests

- **Unit**: card variants; level colors; tap navigates correctly.
- **Snapshot**: each variant.
- **A11y**: cards as buttons.

## Definition of Done

- [ ] ProgramsGrid + ProgramCard
- [ ] usePrograms hook with pagination
- [ ] Backend endpoint
- [ ] Localized labels
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

- Cross-cutting: `docs/engineering/`
- Featured card (above): `04-featured-card.md`
- Bolsa Família detail: `docs/tasks/23-bolsa-familia-detail/`
- `CLAUDE.md`

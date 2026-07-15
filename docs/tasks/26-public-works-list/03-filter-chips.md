# Public Works List · Filter chips

> **Type:** Screen feature · UI + state\
> **Screen:** SCREEN 26 · Public Works List\
> **Effort:** S (≤1 day)\
> **Dependencies:** `26-public-works-list/01-render-works-ui-base.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `frontend`, `screen`, `ux`

## Context

Horizontal scrollable chips for status (Todas, Em planejamento, Em execução, Concluídas parciais,
Suspensas) and category (Pavimentação, Saúde, Educação, Habitação, Infraestrutura). Tapping a chip
filters the map preview + the list.

## Acceptance Criteria

### Scenario · Default render

**Given** the user opens the screen\
**When** chips render\
**Then** "Todas" is active\
**And** the rest appear inactive

### Scenario · Tap a status

**Given** the user taps a status chip\
**When** the action runs\
**Then** the chip becomes active\
**And** the map + list refilter

### Scenario · Combined filters

**Given** the user wants both a status and a category\
**When** they tap a status, then a category\
**Then** both apply (AND semantics)\
**And** clearing one keeps the other

### Scenario · Counts

**Given** chips show counts\
**When** rendered\
**Then** each status chip shows its count badge\
**And** counts update on real-time changes

### Scenario · Localization

**Given** en-US\
**When** rendered\
**Then** labels translate

### Scenario · Accessibility

**Given** SR is on\
**When** chips are navigated\
**Then** each labeled with state and count

## Frontend

```
apps/city-hero/src/screens/PublicWorks/
└── hooks/
    └── useWorksFilters.ts
```

Renders the shared `FilterChipRow` from `@cityhero/design-system` (twice — one row for status, one
row for category). The screen owns the chip definitions and the `onChipPress` callback that filters
the data; no styling lives in this screen's components. See
`docs/engineering/component-inventory.md` (row `FilterChipRow`) and
`docs/engineering/design-system.md`.

### Chip lists this screen passes to `FilterChipRow`

Status row:

- `Todas` — initial `active: true`; `count` reflects all works in scope.
- `Em planejamento`, `Em execução`, `Concluídas parciais`, `Suspensas` — each `count` tied to the
  live status totals.

Category row:

- `Pavimentação`, `Saúde`, `Educação`, `Habitação`, `Infraestrutura` — multi-select; combined with
  the status row via AND semantics in `useWorksFilters`.

The screen's `onChipPress(id)` callback delegates to the store, which updates the active filter set
and triggers the map + list refetch.

## Backend

Filters apply server-side via the list endpoint (task 04).

## Database

`public_works.status` and `public_works.category` indexed.

## Edge Cases

- **Empty after filter**: empty state via task 05.

## Privacy / LGPD

Not applicable.

## Analytics

| Event                         | When        | Props         |
| ----------------------------- | ----------- | ------------- |
| `public_works.filter_changed` | Chip tapped | `kind: status | category`, `value` |

## Tests

- **Unit**: state transitions; counts; combined filters.
- **Integration**: filter triggers map + list refetch.
- **A11y**: chips labeled.

## Definition of Done

- [ ] Chip list definition + filter callback (no local chip component)
- [ ] `FilterChipRow` integration verified visually in Storybook
- [ ] useWorksFilters hook with combined filters
- [ ] Localized labels
- [ ] Telemetry event
- [ ] Tests passing

## Standards & References

- Cross-cutting: `docs/engineering/`
- Render UI base: `01-render-works-ui-base.md`
- Shared chip molecule: `docs/engineering/component-inventory.md` (row `FilterChipRow`)
- Design system overview: `docs/engineering/design-system.md`
- `CLAUDE.md`

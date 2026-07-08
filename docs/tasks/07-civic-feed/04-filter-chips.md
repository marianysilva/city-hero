# Civic Feed · Filter chips · radius + sort

> **Type:** Screen feature · UI + state
> **Screen:** SCREEN 07 · Civic Feed
> **Effort:** S (≤1 day)
> **Dependencies:** `07-civic-feed/01-render-feed-ui-base.md`, `07-civic-feed/02-feed-list-and-pagination.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ux`

## Context

The behavior of the filter chip row above the feed: changing the radius
(default 10km, narrower options 5/2/1km) and toggling the sort mode
(Novos vs Mais apoiados). Changes apply instantly, the list resets, and
selections persist across sessions per user preference.

## User Story

**As a** Citizen,
**I want** to control how wide my feed is and how it's sorted,
**In order to** focus on what's most relevant to me right now.

## Acceptance Criteria

### Scenario · Default state

**Given** the user just landed on the Feed tab
**When** chips render
**Then** the radius chip shows the user's saved default (e.g., "📍 10 km") with active styling
**And** the "Novos" sort chip is active
**And** "Mais apoiados" is inactive

### Scenario · Change radius

**Given** the user taps the radius chip
**When** the action runs
**Then** a small picker (bottom sheet or inline expansion) shows options: 1km, 2km, 5km, 10km
**And** picking a value updates the chip label
**And** the feed list refetches with the new radius (delegated to task 02)
**And** the choice persists in the user's profile

### Scenario · Change sort

**Given** the user taps "Mais apoiados"
**When** the action runs
**Then** "Mais apoiados" becomes active and "Novos" becomes inactive
**And** the feed list refetches with the new sort
**And** the user's saved sort default updates

### Scenario · Filter persistence

**Given** the user picked 2km + Mais apoiados
**When** they leave the Feed tab and return (or relaunch the app)
**Then** the chips reflect the same selections
**And** the list applies them on first render

### Scenario · Empty after filter narrows

**Given** the user narrowed the radius to 1km and got zero items
**When** the empty state renders (per task 02)
**Then** the empty-state suggests broadening the radius ("Tente um raio maior")
**And** tapping the suggestion expands the radius chip back to a wider value

### Scenario · City switch resets defaults

**Given** the user switched cities
**When** they return to the Feed tab in the new city
**Then** the radius and sort reset to the new city's defaults (or app-wide defaults if not configured per city)

### Scenario · Accessibility

**Given** screen reader is on
**When** the user navigates the chips
**Then** each chip is announced with its label and selection state
**And** tapping a chip announces the new state
**And** the radius picker is fully accessible

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/CivicFeed/
└── hooks/
    └── useFeedFilters.ts
```

The sort row ("Novos" / "Mais apoiados") renders the shared `FilterChipRow` from `@cityhero/design-system`. The screen owns the chip definitions and the `onChipPress` callback that switches the sort; no styling lives in this screen's components. See `docs/engineering/component-inventory.md` (row `FilterChipRow`) and `docs/engineering/design-system.md`.

The radius selector is a separate molecule, `RadiusPickerSheet` (also from the design system), triggered by the screen and bound to the same `useFeedFilters` store. It is intentionally not modeled as a `FilterChipRow` chip because its interaction is a bottom-sheet picker, not a toggle.

### Behavior

- `useFeedFilters` is a small store that holds the current radius and sort. It exposes setters and reads from the user profile on init.
- Sort row: the screen builds a 2-chip array and passes it to `FilterChipRow` with an `onChipPress(id)` callback that calls the store's sort setter.
- Setting a value via the chips:
  1. Updates local store (immediate).
  2. Refetches the feed list (task 02 reads from the same store).
  3. Persists to the user record via the profile patch endpoint (debounced).
- On city switch (per `02-city-select/05-select-and-activate-tenant.md`), the store resets and reloads from the user's defaults for the new city.

### Chip list this screen passes to `FilterChipRow` (sort row)

- `Novos` — initial `active: true` when sort is `recent`; switches sort to `recent`.
- `Mais apoiados` — initial `active: true` when sort is `most_supported`; switches sort to `most_supported`.
- The chips are mutually exclusive (the screen's callback ensures only one is active at a time before delegating to `FilterChipRow`'s render).

### Picker UX (radius)

The radius picker is a bottom sheet (`RadiusPickerSheet`) with four options (1, 2, 5, 10 km). Each option has a label and a small subtitle ("um quarteirão", "minha rua", "meu bairro", "minha região"). Tapping picks and dismisses. The picker is opened by the screen — not by `FilterChipRow` — when the user taps the radius trigger.

## Backend (FastAPI)

The feed endpoint (task 02) already accepts `radius_km` and `sort`. No new endpoint needed.

For persistence, the user record has fields:

| Column                 | Type    | Notes                              |
|------------------------|---------|-------------------------------------|
| `feed_radius_km`       | int     | Default 10                          |
| `feed_sort_default`    | varchar | Default `recent`                    |

These are updated via the existing `PATCH /api/v1/auth/me`.

## Database

The two columns above are added via Alembic migration with safe defaults.

## Edge Cases

- **Backend persistence fails**: the local change still applies; retry with backoff.
- **Picker open while user navigates away**: closes cleanly.
- **Future: per-city defaults**: the schema supports it (a separate `city_preferences` table); not in MVP.

## Privacy / LGPD

The radius and sort preferences are non-sensitive. Stored within the user record.

## Analytics

| Event                              | When                                       | Props                              |
|------------------------------------|--------------------------------------------|-------------------------------------|
| `feed.radius_changed`              | User picks a new radius                    | `from_km`, `to_km`                 |
| `feed.sort_changed`                | User toggles sort                          | `from`, `to`                       |
| `feed.broaden_radius_suggested`    | Empty state suggests broader               | `current_km`, `suggested_km`       |

## Tests

- **Unit**: store transitions; persistence is debounced; reset on city switch.
- **Integration**: changing chips refetches with the new params; defaults read from user on mount.
- **A11y**: chips and picker labeled.

## Definition of Done

- [ ] Sort chip list definition + filter callback (no local sort-chips component)
- [ ] `FilterChipRow` integration verified visually in Storybook
- [ ] Radius chip wired to `RadiusPickerSheet` + store
- [ ] Persistence to backend with debounce
- [ ] Backend fields and PATCH support
- [ ] Empty-state CTA to broaden
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Architecture: `docs/engineering/architecture-patterns.md`
- Coding: `docs/engineering/coding-standards.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references
- Bottom Sheet (`@gorhom/bottom-sheet`): https://gorhom.dev/react-native-bottom-sheet
- Zustand: https://github.com/pmndrs/zustand

### Project context
- Render UI base: `01-render-feed-ui-base.md`
- Feed list: `02-feed-list-and-pagination.md`
- City switch: `02-city-select/05-select-and-activate-tenant.md`
- Shared chip molecule: `docs/engineering/component-inventory.md` (row `FilterChipRow`)
- Design system overview: `docs/engineering/design-system.md`
- `CLAUDE.md`

# Home · Filter chips · Categories

> **Type:** Screen feature · UI + state
> **Screen:** SCREEN 06 · Home · Hyperlocal Map
> **Effort:** S (≤1 day)
> **Dependencies:** `06-home-map/01-render-home-ui-base.md`, `06-home-map/02-map-integration-with-pins.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ui`

## Context

A horizontal scrollable row of category chips below the top bar that lets
the user filter the map's pins by report category (Pothole, Trash,
Lighting, Sidewalk, etc.). The first chip ("Todos · 24") is a master
toggle showing the total count and resetting active filters. Each
category chip uses an emoji and changes its visual state when active.

## User Story

**As a** Citizen,
**I want** to filter the map by problem category,
**In order to** focus on what's relevant (e.g., I only care about lighting issues at night).

## Acceptance Criteria

### Scenario · Default render

**Given** the user lands on Home
**When** the chips row renders
**Then** the "Todos" chip is active (dark background, white text)
**And** category chips show in a horizontal scroll with emoji + label
**And** the row scrolls horizontally if it overflows

### Scenario · Tap a category chip

**Given** the user taps a category chip
**When** the action runs
**Then** the chip becomes active (color changes; check mark or badge appears)
**And** the map's pin filter updates to show only that category
**And** the "Todos" chip becomes inactive
**And** the count next to "Todos" still reflects the total in the current bbox

### Scenario · Multi-select

**Given** the user taps multiple category chips
**When** each is tapped
**Then** they all become active simultaneously
**And** the map shows pins that match any of the selected categories (OR semantics)

### Scenario · Tap "Todos"

**Given** one or more categories are active
**When** the user taps "Todos"
**Then** all category chips become inactive
**And** the map shows all pins (no filter applied)

### Scenario · Filter persistence

**Given** the user applied a filter
**When** they leave Home (e.g., switch tabs) and return
**Then** the filter remains applied within the same session
**And** is reset on app cold start (not persisted across launches by default)

### Scenario · Filter resets on city change

**Given** the user switched cities
**When** they return to Home in the new city
**Then** filters reset to "Todos"
**And** the chips show categories relevant to the new city (some might differ in availability)

### Scenario · Counts on chips (optional polish)

**Given** the bbox has 24 reports total: 10 potholes, 8 trash, 4 lighting, 2 sidewalk
**When** the chips render
**Then** "Todos" shows "24"
**And** if a chip-level count UI is enabled (config flag), each category chip can show its count too
**And** the count updates as the bbox changes

### Scenario · Accessibility

**Given** screen reader is on
**When** the user navigates the chips
**Then** each chip is announced with its label and selection state ("Pothole, not selected" / "Pothole, selected")
**And** activating a chip is announced as a state change

### Scenario · Keyboard / external input

**Given** the user has a Bluetooth keyboard or external nav
**When** they navigate to the chips
**Then** chips can be focused and activated with Enter / Space
**And** focus order is left-to-right

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/Home/
└── hooks/
    └── useReportFilters.ts
```

Renders the shared `FilterChipRow` from `@cityhero/design-system`. The screen owns the chip definitions and the `onChipPress` callback that filters the data; no styling lives in this screen's components. See `docs/engineering/component-inventory.md` (row `FilterChipRow`) and `docs/engineering/design-system.md`.

### Behavior

- `useReportFilters` is a small store (or a Zustand slice) that owns the active filter set. It exposes the current selection and toggle/clear actions.
- The screen builds the chip array (one master "Todos" chip + one chip per category) and passes it to `FilterChipRow` along with an `onChipPress(id)` callback that delegates to the store's toggle action.
- The reports query (task 02) reads the active filters from the store and includes them in the request.
- The store is reset on city change and on app cold start.

### Chip list this screen passes to `FilterChipRow`

- `Todos` — master chip; initial `active: true`; `count` reflects total reports in the current bbox; tapping clears every category.
- One chip per category (Pothole, Trash, Lighting, Sidewalk, etc.) — `icon` set to the category emoji, `active` reflects whether the category is in the active filter set, optional `count` shown when the chip-level count flag is on.
- Visual state (inactive / active / "Todos" master variant) is fully owned by `FilterChipRow`; this screen only flips the `active` flag on each chip.

### Interactions

- Tap toggles selection (handled in the screen's `onChipPress` callback that calls the store toggle action).
- Long-press could open a "filter info" tooltip in the future (not in MVP).
- Smooth horizontal scroll on overflow is provided by `FilterChipRow`.

## Backend

The reports endpoint (task 02) already accepts the `category` filter as a multi-value parameter. No new endpoint needed.

## Database

Not applicable directly. (Schema in task 02.)

## Edge Cases

- **All chips deselected manually**: same as "Todos" active — all categories shown. The UI keeps "Todos" active in this state.
- **Deep link arriving with a pre-set filter**: the deep-link handler can pre-populate the store; the UI reflects.
- **A category disappears in a future release**: the store ignores unknown chip keys; the UI doesn't render unsupported chips.

## Privacy / LGPD

Not applicable.

## Analytics

| Event                     | When                                  | Props                          |
| ------------------------- | ------------------------------------- | ------------------------------ |
| `home.filter_chip_tapped` | User taps a chip                      | `category`, `now_active: bool` |
| `home.filter_cleared`     | User taps "Todos" with active filters | `had_categories`               |

## Tests

- **Unit**: store toggle/clear/reset on city change; chip visual state per active flag.
- **Integration**: tapping a chip triggers the reports refetch with the right query.
- **A11y**: chips labeled and selection announced.

## Definition of Done

- [ ] Chip list definition + filter callback (no local chip component)
- [ ] `FilterChipRow` integration verified visually in Storybook
- [ ] `useReportFilters` store
- [ ] Integration with reports query
- [ ] Reset on city change
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Coding: `docs/engineering/coding-standards.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- Zustand: https://github.com/pmndrs/zustand

### Project context

- Map integration: `02-map-integration-with-pins.md`
- Render UI base: `01-render-home-ui-base.md`
- Shared chip molecule: `docs/engineering/component-inventory.md` (row `FilterChipRow`)
- Design system overview: `docs/engineering/design-system.md`
- `CLAUDE.md`

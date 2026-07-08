# Public Works List · Empty state + map/list toggle

> **Type:** Screen feature · UI + state
> **Screen:** SCREEN 26 · Public Works List
> **Effort:** S (≤1 day)
> **Dependencies:** `26-public-works-list/01-render-works-ui-base.md`, `26-public-works-list/04-works-list-and-card.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ux`

## Context

Two related behaviors:

- **Empty state**: when the active filters yield zero results, a friendly UI replaces the list with options to broaden the filter or check back later.
- **View toggle**: the user can switch between list mode (default) and full-screen map mode. The toggle is in the header (per task 01). When in map mode, the user sees only the foundation map with pins; tapping a pin opens a bottom sheet with the work's summary + a CTA to open the detail.

## Acceptance Criteria

### Scenario · Empty state · first-time

**Given** there are no active works in the city (rare for active cities)
**When** the empty state renders
**Then** a friendly message ("Nenhuma obra ativa agora.") + a CTA to check Avisos da Prefeitura for announcements

### Scenario · Empty state · filtered

**Given** the user filtered to a status/category with no results
**When** the empty state renders
**Then** a softer message ("Nada em {filter} agora.") + a "Ver todas" CTA

### Scenario · Map mode

**Given** the user toggled to map mode
**When** the view changes
**Then** the entire screen shows the foundation map with all matching pins
**And** the filter chips are still visible (sticky at top)
**And** the toggle button now reads "Lista" to switch back

### Scenario · Map pin tap (map mode)

**Given** the user taps a pin
**When** the action runs
**Then** a bottom sheet opens with the work's summary (title, status, dates, brief description) + an "Abrir detalhes" CTA
**And** the CTA navigates to SCREEN 27

### Scenario · List mode

**Given** the user toggles back to list
**When** the view changes
**Then** the previous scroll position is preserved
**And** the small map preview at the top of the list reappears

### Scenario · Localization

**Given** en-US
**When** rendered
**Then** copy translates

### Scenario · Accessibility

**Given** SR is on
**When** in either mode
**Then** the toggle and empty state are clearly announced

## Frontend

```
apps/city-hero/src/screens/PublicWorks/
├── components/
│   ├── WorksEmptyState.tsx
│   ├── FullScreenMapView.tsx
│   └── WorkSummarySheet.tsx
└── hooks/
    └── useViewMode.ts
```

## Backend

Reuses the works endpoint (task 04). No new endpoint.

## Database

No new schema.

## Edge Cases

- **Map mode on a very slow device**: lazy-load the map (initial spinner).
- **User toggled mid-load**: state cleanly transitions.

## Privacy / LGPD

Not applicable.

## Analytics

| Event                            | When                   | Props             |
| -------------------------------- | ---------------------- | ----------------- |
| `public_works.empty_state_shown` | Empty render           | `kind: first_time | filtered` |
| `public_works.view_toggled`      | User toggled           | `to: map          | list`     |
| `public_works.map_summary_shown` | Bottom sheet for a pin | `work_id`         |

## Tests

- **Unit**: empty state variants; toggle preserves state.
- **Integration**: map mode renders map; toggle back restores list.
- **A11y**: announcements verified.

## Definition of Done

- [ ] WorksEmptyState component with variants
- [ ] FullScreenMapView (using foundation map)
- [ ] WorkSummarySheet for pin tap
- [ ] useViewMode hook
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

- Cross-cutting: `docs/engineering/`
- Foundation map: `00-foundation/10-leaflet-map-wrapper.md`
- Detail: `docs/tasks/27-public-work-detail/`
- `CLAUDE.md`

# Citizen Profile · Stats grid

> **Type:** Screen feature · UI + data
> **Screen:** SCREEN 28 · Citizen Profile
> **Effort:** S (≤1 day)
> **Dependencies:** `28-citizen-profile/01-render-profile-ui-base.md`, `00-foundation/05-api-client.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `backend`, `screen`

## Context

A 4-cell stats grid below the hero: **Reportes** (count), **Apoios** (given), **Comentários** (tag marks), **% Cidade ajudada** (estimated impact %). Tapping any cell drills into a contextual view.

## Acceptance Criteria

### Scenario · Default render

**Given** stats are loaded
**When** the grid renders
**Then** 4 cells appear with large numbers + small labels
**And** each cell uses a thematic color (reportes brand, apoios rose, comentários sky, impact emerald)

### Scenario · Tap a cell

**Given** the user taps a cell
**When** the action runs
**Then** the corresponding drill-down opens:

- Reportes → My Reports filtered to mine (SCREEN 16)
- Apoios → a list of supported reports (future)
- Comentários → activity feed filtered to comments (future or task 05)
- % Cidade ajudada → an explainer of the methodology

### Scenario · "Cidade ajudada" methodology

**Given** the user wants to know how the % is computed
**When** they tap the cell or an info icon
**Then** a sheet explains the methodology (e.g., "reportes resolvidos / problemas totais reportados na cidade × seu peso")

### Scenario · Real-time updates

**Given** the user just earned new stats
**When** the WS pushes
**Then** the cells update with subtle animation

### Scenario · Localization

**Given** en-US
**When** rendered
**Then** labels translate

### Scenario · Accessibility

**Given** SR is on
**When** the grid is read
**Then** announced as a group with each cell's value and label

## Frontend

```
apps/city-hero/src/screens/CitizenProfile/
├── components/
│   ├── StatsGrid.tsx
│   └── ImpactExplainerSheet.tsx
└── hooks/
    └── useCitizenStats.ts
```

## Backend

| Method | Path                     | Purpose           |
| ------ | ------------------------ | ----------------- |
| GET    | `/api/v1/users/me/stats` | All citizen stats |

## Database

Computed from `reports`, `report_supports`, `report_tag_marks`. Indexes on `user_id` support quick aggregation.

## Edge Cases

- **New user with zeros**: shown honestly; doesn't hide.
- **Impact computation depends on city data**: shows "—" if not yet computable.

## Privacy / LGPD

Personal stats; not shared publicly without consent.

## Analytics

| Event                                     | When               | Props                         |
| ----------------------------------------- | ------------------ | ----------------------------- |
| `citizen_profile.stats_rendered`          | Mounted            | `reports`, `supports`, `tags` |
| `citizen_profile.stat_cell_pressed`       | User tapped a cell | `stat`                        |
| `citizen_profile.impact_explainer_opened` | Methodology view   | —                             |

## Tests

- **Unit**: render with zeros; tap navigates correctly; impact methodology sheet.
- **Snapshot**: states.
- **A11y**: group announcement.

## Definition of Done

- [ ] StatsGrid + ImpactExplainerSheet components
- [ ] useCitizenStats hook
- [ ] Backend stats endpoint
- [ ] Real-time updates
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

- Cross-cutting: `docs/engineering/`
- My Reports (drill-down): `docs/tasks/16-my-reports/`
- `CLAUDE.md`

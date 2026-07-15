# Manual Report · Category grid

> **Type:** Screen feature · UI + state\
> **Screen:** SCREEN 09 · Manual Report\
> **Effort:** S (≤1 day)\
> **Dependencies:** `09-manual-report/01-render-manual-ui-base.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `frontend`, `screen`, `ux`

## Context

A 3×3 grid of 9 category tiles covering the supported problem catalog: Buraco, Lixo, Iluminação,
Pichação, Semáforo, Árvore/Poda, Alagamento, Sinalização, Outro. Each tile has an emoji, a label,
and a color theme. Tapping one selects it; selected state shows a brand-color ring and a small check
badge in the corner.

The "Outro" tile opens a secondary list (noise pollution, abandoned animals, irregular construction,
sidewalk obstruction, etc. from `features.md` § 11) so the user can describe specific edge cases.

## User Story

**As a** Citizen choosing a category manually,\
**I want** a fast, visual grid,\
**In order to** pick without reading a long list.

## Acceptance Criteria

### Scenario · Default render

**Given** the screen renders\
**When** the grid mounts\
**Then** the 9 tiles render in a 3×3 grid\
**And** each tile has its emoji, label, and color theme\
**And** no tile is selected by default unless the user came from the camera with a low-confidence
detection (in which case that category may be pre-selected per task 05)

### Scenario · Pre-selection from low-confidence detection

**Given** the user arrived from the camera with a low-confidence pothole detection\
**When** the screen renders\
**Then** the "Buraco" tile is highlighted as the suggested category\
**And** a subtle "Sugerido pela IA" hint appears near the grid\
**And** the user can confirm or pick a different category

### Scenario · Tap a tile

**Given** the user taps a category tile\
**When** the action runs\
**Then** that tile becomes active (brand-color ring, brand-tinted background, check badge in the
corner)\
**And** the previously active tile (if any) becomes inactive\
**And** light haptic feedback fires\
**And** the screen-level "required state" updates to include the category

### Scenario · "Outro" tile expands

**Given** the user taps the "Outro" tile\
**When** the action runs\
**Then** a bottom sheet opens with a longer list of secondary categories\
**And** the user picks one (e.g., "Construção irregular")\
**And** the "Outro" tile's label updates to show the picked secondary category\
**And** the active state and check badge appear on the tile

### Scenario · Re-tap "Outro"

**Given** the "Outro" tile is active with a secondary choice\
**When** the user taps it again\
**Then** the secondary picker reopens, pre-selected to the current choice\
**And** the user can pick a different one or cancel (in which case the original stays)

### Scenario · Localized labels

**Given** the user's language is en-US\
**When** the grid renders\
**Then** labels are in English ("Pothole", "Trash", "Lighting", "Graffiti", "Traffic Light", "Tree /
Pruning", "Flooding", "Signage", "Other")

### Scenario · CTA gating

**Given** the user has not selected a category yet\
**When** they look at the CTA\
**Then** the "Continuar →" button is disabled\
**And** as soon as a category is selected, the CTA enables (assuming the other required fields —
location — are present per task 04)

### Scenario · Accessibility

**Given** screen reader is on\
**When** the user navigates the grid\
**Then** each tile is announced with its label and selection state ("Pothole, not selected" →
activation → "Pothole, selected")\
**And** the "Outro" secondary picker is fully accessible

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/ManualReport/
├── components/
│   ├── CategoryGrid.tsx
│   ├── CategoryTile.tsx
│   └── OtherCategorySheet.tsx
└── hooks/
    └── useReportCategory.ts
```

### Behavior

- `useReportCategory` holds the selected category (primary key + optional secondary key for "Outro")
  in screen state, exposed to the CTA gating and to task 06's submit logic.
- `CategoryGrid` renders the 9 tiles based on a static catalog (which can be hot-reloaded from a
  feature flag for future categories).
- `CategoryTile` is a presentational component with active/inactive variants and an optional check
  badge.
- `OtherCategorySheet` is a bottom sheet listing secondary categories.

### Catalog source

The 9 primary categories are defined in a single place (e.g., a TypeScript constant or a shared
package), and the secondary list for "Outro" is also defined alongside. This makes it easy to keep
mobile and backend in sync.

### Animation

- Tap-down scale animation (0.96 → 1) on each tile.
- The check badge appears with a small fade-in when the tile becomes active.

## Backend (FastAPI)

The backend stores categories using machine-readable keys (e.g., `pothole`, `trash`). The frontend's
catalog maps each key to a localized label and emoji. The submit endpoint (task 06 and the
report-creation flow in `docs/tasks/10-report-confirm/`) accepts a category key plus an optional
secondary key.

### Catalog endpoint (optional)

For future flexibility, an endpoint may expose the catalog so cities can configure variants:

| Method | Path                 | Purpose                              |
| ------ | -------------------- | ------------------------------------ |
| GET    | `/api/v1/categories` | List supported categories (per city) |

For MVP, the catalog is static on the client.

## Database

The `reports.category` column is a string (the category key). A separate `reports.category_other`
column holds the secondary key when applicable. Schema is owned by the report-creation tasks.

## Edge Cases

- **Categories evolve over time**: keys stay stable; labels evolve. Old reports keep their original
  keys.
- **City-specific categories** (future): a city without "Alagamento" risk could hide that tile; not
  in MVP.
- **Secondary picker has too many items**: the sheet allows scrolling; consider grouping if it
  grows.
- **User picks "Outro" but cancels the secondary picker**: the primary stays unselected (no category
  is technically chosen).

## Privacy / LGPD

Not applicable.

## Analytics

| Event                             | When                            | Props                                |
| --------------------------------- | ------------------------------- | ------------------------------------ |
| `manual_report.category_selected` | User picks a primary category   | `category`, `was_pre_selected: bool` |
| `manual_report.other_picked`      | User picks a secondary category | `secondary_key`                      |
| `manual_report.other_canceled`    | User opens "Outro" then cancels | —                                    |

## Tests

- **Unit**: tiles render; selection toggles correctly; "Outro" secondary picker flow; pre-selection
  from AI hint.
- **A11y**: tiles labeled and announced.
- **Visual regression**: each tile color/active variant.

## Definition of Done

- [ ] CategoryGrid + CategoryTile components
- [ ] OtherCategorySheet
- [ ] `useReportCategory` hook with primary + secondary state
- [ ] Pre-selection from low-confidence AI detection
- [ ] CTA gating updated
- [ ] Localized labels
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Coding: `docs/engineering/coding-standards.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- Bottom Sheet (`@gorhom/bottom-sheet`): https://gorhom.dev/react-native-bottom-sheet
- React Native Haptics: https://docs.expo.dev/versions/latest/sdk/haptics/

### Project context

- Render UI base: `01-render-manual-ui-base.md`
- AI feedback loop: `05-ai-feedback-loop.md`
- Submit & continue: `06-submit-and-continue.md`
- `docs/features.md` § 11 (Scope Expansion · categories)
- `CLAUDE.md`

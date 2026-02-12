# Programs · Category filter chips

> **Type:** Screen feature · UI + state
> **Screen:** SCREEN 22 · Programs & Transparency
> **Effort:** S (≤1 day)
> **Dependencies:** `22-programs-transparency/01-render-programs-ui-base.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ux`

## Context

A horizontal scrollable row of category chips below the summary strip:
**Todos** (default), **Social**, **Saúde**, **Educação**, **Habitação**,
**Estrutural**. Tapping a chip filters the featured card (when
matching) and the programs grid below.

## Acceptance Criteria

### Scenario · Default render

**Given** the user opens the screen
**When** chips render
**Then** "Todos" is active (slate-900 + white)
**And** the rest appear in white with neutral borders
**And** the row scrolls horizontally when overflowing

### Scenario · Tap to filter

**Given** the user taps "Social"
**When** the action runs
**Then** "Social" becomes active
**And** the featured card hides if not in Social
**And** the programs grid (task 05) refilters

### Scenario · Persistence in session

**Given** the user picked a filter
**When** they leave and return
**Then** the filter persists for the session
**And** resets on cold start

### Scenario · Localization

**Given** en-US
**When** chips render
**Then** labels translate

### Scenario · Accessibility

**Given** SR is on
**When** the user navigates chips
**Then** each is announced with label and selection state

## Frontend

```
apps/mobile/src/screens/Programs/
├── components/
│   └── ProgramsCategoryChips.tsx
└── hooks/
    └── useProgramsCategoryFilter.ts
```

## Backend

The programs endpoint accepts a `category` query param.

## Database

`programs.category` is indexed.

## Edge Cases

- **No programs match**: empty grid state.

## Privacy / LGPD

Not applicable.

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `programs.filter_changed`          | Chip tapped                                | `from`, `to`                          |

## Tests

- **Unit**: store transitions; chip state.
- **Integration**: filter change triggers refetch.
- **A11y**: chips labeled.

## Definition of Done

- [ ] ProgramsCategoryChips component
- [ ] useProgramsCategoryFilter hook
- [ ] Localized labels
- [ ] Telemetry event
- [ ] Tests passing

## Standards & References

- Cross-cutting: `docs/engineering/`
- Render UI base: `01-render-programs-ui-base.md`
- `CLAUDE.md`

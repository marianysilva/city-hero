# Irregularity Report · Step 1 · Program/area selection

> **Type:** Screen feature · UI + state
> **Screen:** SCREEN 24 · Irregularity Report
> **Effort:** S (≤1 day)
> **Dependencies:** `24-irregularity-report/01-render-irregularity-ui-base.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ux`

## Context

The first step of the wizard: the user picks **which program or area**
the irregularity concerns. The list includes social programs (Bolsa
Família, BPC, etc.), city services (obras, saúde, educação), and a
generic "Outro" for anything not listed.

If the user came from a specific program detail (e.g., SCREEN 23
Bolsa Família), the program is **pre-selected** as a convenience.

## Acceptance Criteria

### Scenario · Default render

**Given** the user reaches step 1
**When** the screen renders
**Then** a search bar + a 2-column grid of program cards is shown
**And** a generic "Outro / Não sei" card is at the end

### Scenario · Pre-selection from context

**Given** the user came from Bolsa Família detail
**When** the screen mounts
**Then** the Bolsa Família card is highlighted as pre-selected
**And** the user can change the selection or proceed

### Scenario · Tap a program

**Given** the user taps a card
**When** the action runs
**Then** the card becomes active (brand ring)
**And** the Continuar button enables (if it wasn't already)

### Scenario · Search

**Given** the user types in the search bar
**When** the filter runs
**Then** matching programs appear; non-matching are hidden
**And** if empty, the empty state explains "Tente outro nome ou pique 'Outro'"

### Scenario · Tap "Outro / Não sei"

**Given** the user picks the generic option
**When** the action runs
**Then** the card is selected
**And** an optional text input appears asking for a one-line context ("Qual programa ou área?")

### Scenario · Localization

**Given** en-US
**When** the screen renders
**Then** labels translate; placeholders adapt

### Scenario · Accessibility

**Given** SR is on
**When** the user navigates programs
**Then** each is announced as a selection with state

## Frontend

```
apps/mobile/src/screens/IrregularityReport/
├── steps/
│   └── Step1ProgramSelection.tsx
└── hooks/
    └── useIrregularityProgram.ts
```

## Backend

The programs catalog is the same source as SCREEN 22 (`/api/v1/cities/{id}/programs`). No new endpoint.

## Database

No new schema.

## Edge Cases

- **Many programs**: search helps; the grid pages if needed.
- **Pre-fill context invalid** (program not in catalog): falls back to "Outro" with the program name as the description.

## Privacy / LGPD

No PII collected at this step.

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `irregularity.program_selected`    | User picked a program                      | `program_id`                          |
| `irregularity.search_typed`        | User searched                              | `query_length`                        |

## Tests

- **Unit**: grid renders; search filters; pre-selection; tap behavior.
- **Snapshot**: states.
- **A11y**: cards as selections.

## Definition of Done

- [ ] Step1ProgramSelection screen
- [ ] useIrregularityProgram hook
- [ ] Pre-fill from context
- [ ] Search + filter
- [ ] Localized labels
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

- Cross-cutting: `docs/engineering/`
- Render UI base: `01-render-irregularity-ui-base.md`
- Programs catalog: `22-programs-transparency/05-programs-grid.md`
- `CLAUDE.md`

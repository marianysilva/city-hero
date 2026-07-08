# My Reports · Empty state

> **Type:** Screen feature · UI + UX
> **Screen:** SCREEN 16 · My Reports
> **Effort:** S (≤1 day)
> **Dependencies:** `16-my-reports/01-render-my-reports-ui-base.md`, `16-my-reports/04-reports-list.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ux`

## Context

When the list is empty — either because the user hasn't reported
anything yet (true empty state) or because the active filter excludes
all rows (filter-empty state) — a friendly empty UI replaces the list
with a clear CTA to capture a report.

The two variants matter: a first-time empty state should welcome the
user warmly, while a filter-empty state should offer to broaden the
filter.

## User Story

**As a** Citizen with an empty list,
**I want** a helpful message and clear next step,
**In order to** know what to do.

## Acceptance Criteria

### Scenario · First-time empty state (no reports ever)

**Given** the user has never submitted a report
**When** the list area would render
**Then** an empty state appears with: a friendly illustration (e.g., a magnifier on the city), a headline ("Pronto pra virar herói?"), a short copy explaining what reporting is, and a primary CTA "📷 Tirar foto"
**And** the KPI strip shows zeros; the filter chips collapse to "Todos" only

### Scenario · Tap "📷 Tirar foto" (CTA)

**Given** the user taps the CTA
**When** the action runs
**Then** the Camera screen opens (SCREEN 08)
**And** when they submit, they return to My Reports with their first row visible

### Scenario · Filter-empty state

**Given** the user has reports but the active filter excludes all of them (e.g., picked "Resolvidos" but has no resolved reports yet)
**When** the list area would render
**Then** a different empty state appears: a smaller hint with the filter info ("Nenhum reporte 'Resolvido' ainda"), and a secondary CTA "Ver todos" that switches the filter back to Todos

### Scenario · Anonymous filter-empty

**Given** the user picked "Anônimos" but hasn't submitted any
**When** the empty state renders
**Then** the copy explains the choice ("Nenhum reporte anônimo ainda. Você pode escolher esse modo na próxima vez.")
**And** the "Ver todos" CTA appears

### Scenario · Offline mode, no cached data

**Given** the user is offline and there's no cached list
**When** the list area would render
**Then** a friendly "Modo offline · sem dados em cache" empty state appears
**And** a "Tentar de novo" CTA is shown

### Scenario · Backend error, no cached data

**Given** the list endpoint failed and there's no cache
**When** the empty state would render
**Then** an error-friendly empty state appears ("Algo deu errado · Tentar de novo") with retry
**And** otherwise behaves like the no-cached-data case

### Scenario · Localization

**Given** the user's language is en-US
**When** the empty state renders
**Then** copy is in English ("Ready to become a hero?", "📷 Take photo", "Nothing 'Resolved' yet", etc.)

### Scenario · Accessibility

**Given** screen reader is on
**When** the empty state renders
**Then** the headline is announced as a heading
**And** the copy is read in order
**And** the CTA is clearly labeled

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/MyReports/
└── components/
    └── MyReportsEmptyState.tsx
```

### Component behavior

- `MyReportsEmptyState` accepts a variant prop: `first_time`, `filter`, `offline`, `error`.
- Each variant renders its own illustration, headline, copy, and CTA.
- The first-time variant is the most prominent; others are softer.
- Tap callbacks delegate to the appropriate action (open camera, reset filter, retry).

## Backend

Not applicable.

## Database

Not applicable.

## Edge Cases

- **Empty state during a transient query state (e.g., loading)**: the list shows a skeleton instead of the empty state until the response is in.
- **Race between empty and new item arriving (real-time)**: the new item appears, the empty state goes away.

## Privacy / LGPD

Not applicable.

## Analytics

| Event                                  | When                                       | Props                                |
|----------------------------------------|--------------------------------------------|---------------------------------------|
| `my_reports.empty_first_time_shown`    | First-time variant rendered                | —                                     |
| `my_reports.empty_filter_shown`        | Filter variant rendered                    | `filter`                              |
| `my_reports.empty_first_time_cta`      | First-time CTA tapped                      | —                                     |
| `my_reports.empty_view_all_cta`        | "Ver todos" tapped                         | `from_filter`                         |

## Tests

- **Unit**: each variant renders correctly; CTAs fire the right callbacks.
- **Snapshot**: each variant.
- **A11y**: announcements verified.

## Definition of Done

- [ ] MyReportsEmptyState component with all variants
- [ ] Variant-specific illustrations
- [ ] CTAs delegate to actions
- [ ] Localized copy
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Coding: `docs/engineering/coding-standards.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Project context
- Render UI base: `01-render-my-reports-ui-base.md`
- Reports list (consumes empty state): `04-reports-list.md`
- Camera (destination of CTA): `08-camera-live/`
- `CLAUDE.md`

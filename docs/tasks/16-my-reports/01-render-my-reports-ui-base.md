# My Reports · Render UI base

> **Type:** Screen feature · UI
> **Screen:** SCREEN 16 · My Reports
> **Effort:** S (≤1 day)
> **Dependencies:** `00-foundation/02-design-tokens.md`, `00-foundation/03-bottom-nav-component.md`, `00-foundation/04-status-bar-component.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ui`

## Context

The base layout: header with back button and title ("Histórico" kicker
+ "Meus reportes · N" main title), a scrollable area for KPI strip,
filter chips, pending offline card, the list, and the bridge card
(tasks 02–06), plus the persistent bottom nav with "Mais" or "Profile"
highlighted depending on entry point.

## User Story

**As a** Citizen,
**I want** a clean history layout for my reports,
**In order to** scan my past activity at a glance.

## Acceptance Criteria

### Scenario · Default render

**Given** the user opens My Reports
**When** the screen renders
**Then** the status bar variant is `dark`
**And** the header shows a back button on the left and a "Histórico · Meus reportes · N" title
**And** below: slots for KPI strip, filter chips, pending offline card, list, bridge card
**And** the bottom nav is visible with the appropriate tab highlighted

### Scenario · Slot system

**Given** the screen exposes positional slots
**When** other tasks plug in
**Then** the named slots are: `kpi-strip`, `filter-chips`, `pending-card`, `list`, `bridge-card`
**And** the bottom nav is always present (per `00-foundation/03`)

### Scenario · Long histories scroll

**Given** the user has 100+ reports
**When** the list renders
**Then** the screen uses virtualized scrolling (task 04 handles)
**And** the header doesn't stick (the bottom nav stays visible regardless)

### Scenario · Theming

**Given** the user is in dark mode
**When** the screen renders
**Then** the slate background switches to dark
**And** cards and chips adapt tonally

### Scenario · Accessibility

**Given** screen reader is on
**When** the screen mounts
**Then** the title is announced as a heading
**And** the slot order is preserved as reading order

## Frontend (React Native)

### Component location

```
apps/city-hero/src/screens/MyReports/
├── MyReportsScreen.tsx
├── MyReportsScreen.styles.ts
├── MyReportsScreen.test.tsx
└── components/
    └── MyReportsLayoutSlots.tsx
```

### Component behavior

- `MyReportsScreen` composes the header, scrollable content with slots, and the bottom nav.
- `MyReportsLayoutSlots` defines positional anchors.
- Header title's report count comes from the list query (task 04).

## Backend

Not applicable for this task.

## Database

Not applicable directly.

## Edge Cases

- **Title count diverges from list count** (during background sync): the title shows the server-confirmed count; the list updates incrementally.
- **Scroll position lost on tab switch and return**: the screen restores the last scroll position.

## Privacy / LGPD

Not applicable.

## Analytics

| Event                          | When                                       | Props                                |
|--------------------------------|--------------------------------------------|---------------------------------------|
| `my_reports.viewed`            | Screen mounts                              | `total_count`                         |

## Tests

- **Unit**: slots render; title displays count; bottom nav highlights correctly.
- **Snapshot**: light + dark.
- **A11y**: title and navigation labeled.

## Definition of Done

- [ ] MyReportsScreen base layout
- [ ] MyReportsLayoutSlots
- [ ] Bottom nav integration
- [ ] Light + dark themes
- [ ] Accessibility verified
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Coding: `docs/engineering/coding-standards.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Project context
- Prototype: `design/index.html` (search `title: 'Meus Reportes'`)
- Bottom nav: `00-foundation/03-bottom-nav-component.md`
- `CLAUDE.md`

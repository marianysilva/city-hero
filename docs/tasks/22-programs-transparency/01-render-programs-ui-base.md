# Programs · Render UI base

> **Type:** Screen feature · UI
> **Screen:** SCREEN 22 · Programs & Transparency
> **Effort:** S (≤1 day)
> **Dependencies:** `00-foundation/02-design-tokens.md`, `00-foundation/04-status-bar-component.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ui`

## Context

The base layout: a slate-50 background, a top header row (back button,
"Controle social" small caps + "Programas & transparência" title, and
a share button on the right), then a scrollable content area hosting
the summary strip, filter chips, featured card, programs grid, and
footer (tasks 02–06). The bottom nav is visible.

## User Story

**As a** Citizen,
**I want** a clean layout for browsing transparency data,
**In order to** dig in without feeling overwhelmed.

## Acceptance Criteria

### Scenario · Default render

**Given** the user opens the screen
**When** it renders
**Then** the status bar variant is `dark`
**And** the header has a back button, "Controle social" kicker + "Programas & transparência" title, and a share button on the right
**And** below: slots for summary strip, filter chips, featured card, programs grid, footer
**And** bottom nav is visible

### Scenario · Slot system

**Given** the screen exposes positional slots
**When** other tasks plug in
**Then** named slots are: `summary-strip`, `filter-chips`, `featured-card`, `programs-grid`, `footer`
**And** the `filter-chips` slot is filled by the shared `FilterChipRow` from `@cityhero/design-system` (configured by a later task) — the base layout never defines a local chip component for it

### Scenario · Share

**Given** the user wants to share the transparency view
**When** they tap the share button in the header
**Then** the share sheet opens with a city-specific transparency link

### Scenario · Theming

**Given** dark mode
**When** the screen renders
**Then** the background and cards adapt
**And** the gradient summary strip remains constant

### Scenario · Accessibility

**Given** screen reader is on
**When** the screen mounts
**Then** the title is announced as a heading
**And** the share button is labeled

## Frontend (React Native)

### Component location

```
apps/city-hero/src/screens/Programs/
├── ProgramsScreen.tsx
├── ProgramsScreen.styles.ts
├── ProgramsScreen.test.tsx
└── components/
    ├── ProgramsHeader.tsx
    └── ProgramsLayoutSlots.tsx
```

## Backend

Not applicable for this task.

## Database

Not applicable.

## Edge Cases

- **Empty programs list**: empty state on grid; summary strip shows zeros honestly.

## Privacy / LGPD

Not applicable.

## Analytics

| Event                    | When              | Props     |
| ------------------------ | ----------------- | --------- |
| `programs.viewed`        | Screen mounts     | `city_id` |
| `programs.share_pressed` | User tapped share | —         |

## Tests

- **Unit**: slot rendering; share callback.
- **Snapshot**: light + dark.
- **A11y**: title + share labeled.

## Definition of Done

- [ ] ProgramsScreen base layout
- [ ] ProgramsHeader + LayoutSlots
- [ ] Share integration
- [ ] Light + dark themes
- [ ] Accessibility verified
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Coding: `docs/engineering/coding-standards.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Project context

- Prototype: `design/index.html` (search `title: 'Programas & Transparência'`)
- Shared chip molecule (fills `filter-chips` slot): `docs/engineering/component-inventory.md` (row `FilterChipRow`)
- Design system overview: `docs/engineering/design-system.md`
- `CLAUDE.md`

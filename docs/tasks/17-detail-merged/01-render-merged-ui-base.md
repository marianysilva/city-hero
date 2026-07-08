# Detail · Merged · Render UI base + header

> **Type:** Screen feature · UI
> **Screen:** SCREEN 17 · Detail · Merged Report
> **Effort:** S (≤1 day)
> **Dependencies:** `00-foundation/02-design-tokens.md`, `00-foundation/04-status-bar-component.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ui`

## Context

The base layout: a slate-50 background, a header with a back button,
"Seu reporte" title, and a small emerald "✓ Apoiando ticket #N" badge
right below the title (visual confirmation the merge was a positive
outcome). A scrollable area hosts the merge banner and the two
comparison cards (tasks 02–03). A sticky bottom CTA bar reserves space
for task 04.

## User Story

**As a** Citizen,
**I want** a clear layout that immediately communicates "your report counts and is part of an existing solution",
**In order to** not feel my effort was wasted.

## Acceptance Criteria

### Scenario · Default render

**Given** the user opens a merged-report detail
**When** the screen renders
**Then** the status bar variant is `dark`
**And** the header shows a back button on the left
**And** the title "Seu reporte" is shown in extrabold
**And** below the title, a small emerald pill "✓ APOIANDO TICKET #N" appears (with the parent ticket's protocol number)
**And** below the header, the scrollable area hosts slots for the banner and comparison cards
**And** a sticky bottom CTA bar reserves space

### Scenario · Slot system

**Given** the screen exposes positional slots
**When** other tasks plug in
**Then** the named slots are: `merge-banner`, `your-report-card`, `parent-ticket-card`, `cta-bar`
**And** the order reflects the prototype

### Scenario · Back navigation

**Given** the user taps back
**When** the action runs
**Then** the screen returns to the previous screen (My Reports / push origin / share origin)

### Scenario · Theming

**Given** the user is in dark mode
**When** the screen renders
**Then** the slate background switches to dark
**And** the emerald badge remains readable

### Scenario · Accessibility

**Given** screen reader is on
**When** the screen mounts
**Then** the title is announced as a heading
**And** the "Apoiando ticket #N" badge is announced as part of the title's context

## Frontend (React Native)

### Component location

```
apps/city-hero/src/screens/DetailMerged/
├── DetailMergedScreen.tsx
├── DetailMergedScreen.styles.ts
├── DetailMergedScreen.test.tsx
└── components/
    └── DetailMergedHeader.tsx
```

### Component behavior

- `DetailMergedScreen` composes the header, slots, and sticky CTA bar.
- `DetailMergedHeader` renders the title + supporting badge.
- The screen reads the merged report's data (including the parent ticket's protocol) via navigation params or a query hook.

## Backend

Not applicable for this task.

## Database

Not applicable directly.

## Edge Cases

- **Parent ticket deleted after merge**: the badge falls back to a softer state ("Apoiando ticket fechado"); the bottom CTA adapts.
- **User's own report was deleted by them later**: this screen is unreachable; My Reports doesn't show it.

## Privacy / LGPD

Not applicable to this task.

## Analytics

| Event                          | When                                       | Props                                |
|--------------------------------|--------------------------------------------|---------------------------------------|
| `detail_merged.viewed`         | Screen mounts                              | `report_id`, `parent_report_id`      |
| `detail_merged.back_pressed`   | User taps back                             | —                                     |

## Tests

- **Unit**: layout slots render; back fires callback; badge displays the parent protocol.
- **Snapshot**: light + dark.
- **A11y**: title and badge labeled.

## Definition of Done

- [ ] DetailMergedScreen base layout
- [ ] DetailMergedHeader with merge badge
- [ ] Slot system
- [ ] Light + dark themes
- [ ] Accessibility verified
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Coding: `docs/engineering/coding-standards.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Project context
- Prototype: `design/index.html` (search `title: 'Detalhe · Reporte Mesclado'`)
- `CLAUDE.md`

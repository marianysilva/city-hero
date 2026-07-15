# Detail · Ticket · Render UI base

> **Type:** Screen feature · UI\
> **Screen:** SCREEN 14 · Detail · Ticket (resolved)\
> **Effort:** S (≤1 day)\
> **Dependencies:** `13-detail-in-progress/01-render-detail-ui-base.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `frontend`, `screen`, `ui`

## Context

This screen reuses the **same shell** as SCREEN 13 (the open-ticket detail) — back button, overflow
menu, sticky bottom CTAs, scrollable content area, sticky header on scroll. The base layout differs
only in the hero slot (which hosts the before/after slider from task 02 instead of a single photo)
and the bottom CTAs (which change Apoiar → Avaliar).

By reusing the shell, the user sees consistent navigation and the codebase avoids duplicating layout
logic.

## User Story

**As a** Citizen viewing a resolved report,\
**I want** a layout that matches the open-ticket experience,\
**In order to** feel like I'm seeing the same report's final state.

## Acceptance Criteria

### Scenario · Reuses SCREEN 13 shell

**Given** the screen mounts\
**When** the layout renders\
**Then** the back button, overflow menu, scroll container, sticky header on scroll, and bottom CTA
bar match SCREEN 13's structure\
**And** the same slot system is used (`hero`, `summary`, `timeline`, `comments`, `bottom-cta`,
`overflow-menu`)

### Scenario · Hero slot accepts the before/after component

**Given** task 02's component plugs into the `hero` slot\
**When** the screen renders\
**Then** the hero is the before/after slider (instead of the single-photo hero from SCREEN 13)\
**And** the slot dimensions are the same as SCREEN 13's hero

### Scenario · Status chips reflect resolved state

**Given** the hero's overlay shows status chips\
**When** rendered\
**Then** the category chip stays (e.g., "🕳️ BURACO")\
**And** the state chip is emerald with "✓ RESOLVIDO"\
**And** the "ABERTO HÁ X DIAS" pill is replaced with "RESOLVIDO HÁ Y DIAS" or omitted on this screen

### Scenario · Sticky header on scroll

**Given** the user scrolls\
**When** the hero passes the top\
**Then** the sticky header appears with the resolved state chip\
**And** otherwise behaves identically to SCREEN 13's sticky header

### Scenario · Theming

**Given** the user is in dark mode\
**When** the screen renders\
**Then** the same dark theme rules from SCREEN 13 apply\
**And** emerald (resolved) chips remain readable on the dark hero overlay

### Scenario · Accessibility

**Given** screen reader is on\
**When** the screen mounts\
**Then** the resolved state is clearly announced ("Detail, ticket resolved")\
**And** navigation elements behave like SCREEN 13's

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/DetailTicket/
├── DetailTicketScreen.tsx
├── DetailTicketScreen.styles.ts
├── DetailTicketScreen.test.tsx
└── components/
    └── (subcomponents owned by tasks 02–06)
```

### Component behavior

- `DetailTicketScreen` composes the `DetailShell` template from
  `packages/design_system/src/templates/DetailShell/`.
- The screen reads the report's metadata and confirms it's in a `resolved` state; if it's open, it
  routes to SCREEN 13 instead.
- Slot system mirrors SCREEN 13 so tasks 02–06 plug in similarly.

### Shared shell

`packages/design_system/src/templates/DetailShell/` holds the template (see
`docs/engineering/component-inventory.md` · Templates row `DetailShell`):

- `DetailScrollContainer`
- `StickyHeader`
- `BottomCtaBar` (slot version)

SCREENs 13, 14, 17, 23, and 27 consume the same template, differing only in the slot contents. Per
`design-system.md`, the template lives in the package — never duplicated in a screen folder.

## Backend

Not applicable for this task.

## Database

Not applicable.

## Edge Cases

- **Report state changes from resolved back to in_progress** (rare: prefecture reopens): the routing
  logic auto-redirects to SCREEN 13 the next time the user opens the detail.
- **Photo "depois" not yet uploaded by prefecture**: the slider falls back to a single-photo hero
  with a "Aguardando foto 'depois'" overlay; task 02 handles this.

## Privacy / LGPD

Not applicable to this task.

## Analytics

| Event                        | When           | Props                      |
| ---------------------------- | -------------- | -------------------------- |
| `detail_ticket.viewed`       | Screen mounts  | `report_id`, `source: feed | push | share | my_reports` |
| `detail_ticket.back_pressed` | User taps back | —                          |

## Tests

- **Unit**: slot system mirrors SCREEN 13's; resolved state forces this screen; reopened state
  routes to SCREEN 13.
- **Snapshot**: light + dark.
- **A11y**: navigation labeled.

## Definition of Done

- [ ] DetailTicketScreen base layout reusing the shared shell
- [ ] Slot system aligned with SCREEN 13
- [ ] State routing (resolved → this screen; open → SCREEN 13)
- [ ] Light + dark themes
- [ ] Accessibility verified
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Coding: `docs/engineering/coding-standards.md`
- Architecture (component reuse): `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Project context

- Prototype: `design/index.html` (search `title: 'Detalhe do Ticket'`)
- Sibling screen (open state): `docs/tasks/13-detail-in-progress/`
- Shared shell components are extracted from SCREEN 13's task 01
- `CLAUDE.md`

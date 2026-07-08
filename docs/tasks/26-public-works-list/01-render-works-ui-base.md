# Public Works List · Render UI base

> **Type:** Screen feature · UI
> **Screen:** SCREEN 26 · Public Works List
> **Effort:** S (≤1 day)
> **Dependencies:** `00-foundation/02-design-tokens.md`, `00-foundation/04-status-bar-component.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ui`

## Context

Header (back + "Obras em andamento · N" title + view toggle), small map preview at the top (task 02), sticky filter chips, scrollable list of works. Bottom nav visible.

## Acceptance Criteria

### Scenario · Default render

**Given** the user opens the screen
**When** it renders
**Then** status bar is `dark`
**And** header: back button, title with count, view-toggle button (map/list)
**And** below: small map preview slot, sticky filter chips, scrollable list

### Scenario · View toggle

**Given** the user wants the full map view
**When** they tap the toggle
**Then** the screen switches to a full-screen map mode
**And** back to list on second tap

### Scenario · Slot system

**Given** the screen exposes slots
**When** tasks plug in
**Then** named slots are: `map-preview`, `filter-chips`, `works-list`, `view-toggle`

### Scenario · Title count updates

**Given** the count of active works changes
**When** real-time updates arrive
**Then** the title count reflects the change

### Scenario · Back navigation

**Given** the user taps back
**When** the action runs
**Then** returns to the previous screen (typically SCREEN 25 or Home)

### Scenario · Accessibility

**Given** SR is on
**When** mounted
**Then** title labeled with count; toggle labeled

## Frontend

```
apps/city-hero/src/screens/PublicWorks/
├── PublicWorksScreen.tsx
├── PublicWorksScreen.styles.ts
├── PublicWorksScreen.test.tsx
└── components/
    ├── WorksHeader.tsx
    └── ViewToggle.tsx
```

## Backend

Not applicable.

## Database

Not applicable.

## Edge Cases

- **Empty catalog**: empty state handled by task 05.

## Privacy / LGPD

Not applicable.

## Analytics

| Event                       | When                   | Props    |
| --------------------------- | ---------------------- | -------- |
| `public_works.viewed`       | Screen mounts          | `count`  |
| `public_works.view_toggled` | User switched map/list | `to: map | list` |

## Tests

- **Unit**: slot rendering; toggle behavior.
- **Snapshot**: light + dark.
- **A11y**: labeled.

## Definition of Done

- [ ] PublicWorksScreen base
- [ ] WorksHeader + ViewToggle
- [ ] Slot system
- [ ] Light + dark themes
- [ ] Accessibility verified
- [ ] Tests passing

## Standards & References

- Cross-cutting: `docs/engineering/`
- Prototype: `design/index.html` (search `title: 'Obras em Andamento'`)
- `CLAUDE.md`

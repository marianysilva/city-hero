# Services & Public Works · Render UI base

> **Type:** Screen feature · UI
> **Screen:** SCREEN 25 · Services & Public Works
> **Effort:** S (≤1 day)
> **Dependencies:** `00-foundation/02-design-tokens.md`, `00-foundation/04-status-bar-component.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ui`

## Context

The base layout: header with back button + "Serviços & Obras" title + search icon, scrollable area with the cards grid (task 02), and the contacts footer (task 04). Bottom nav visible.

## Acceptance Criteria

### Scenario · Default render

**Given** the user opens the screen
**When** it renders
**Then** status bar is `dark`
**And** the header shows back button, title, and a search icon
**And** below: the cards grid slot and contacts footer slot
**And** bottom nav is visible

### Scenario · Search icon

**Given** the user wants to find a service
**When** they tap the search icon
**Then** the search overlay opens (task 03)

### Scenario · Slot system

**Given** the screen exposes slots
**When** tasks plug in
**Then** named slots are: `cards-grid`, `contacts-footer`

### Scenario · Theming

**Given** dark mode
**When** rendered
**Then** background and cards adapt

### Scenario · Accessibility

**Given** SR is on
**When** mounted
**Then** title labeled; search icon labeled

## Frontend

```
apps/mobile/src/screens/ServicesPublicWorks/
├── ServicesPublicWorksScreen.tsx
├── ServicesPublicWorksScreen.styles.ts
├── ServicesPublicWorksScreen.test.tsx
└── components/
    └── ServicesHeader.tsx
```

## Backend

Not applicable.

## Database

Not applicable.

## Edge Cases

- **Empty catalog**: empty state ("Serviços em breve").

## Privacy / LGPD

Not applicable.

## Analytics

| Event                          | When                                       | Props                                |
|--------------------------------|--------------------------------------------|---------------------------------------|
| `services.viewed`              | Screen mounts                              | `city_id`                             |
| `services.search_pressed`      | User tapped search                         | —                                     |

## Tests

- **Unit**: slots render; search callback fires.
- **Snapshot**: light + dark.
- **A11y**: title and search labeled.

## Definition of Done

- [ ] ServicesPublicWorksScreen base layout
- [ ] ServicesHeader
- [ ] Slot system
- [ ] Light + dark themes
- [ ] Accessibility verified
- [ ] Tests passing

## Standards & References

- Cross-cutting: `docs/engineering/`
- Prototype: `design/index.html` (search `title: 'Serviços & Obras'`)
- `CLAUDE.md`

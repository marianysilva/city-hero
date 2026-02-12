# Citizen Profile · Render UI base

> **Type:** Screen feature · UI
> **Screen:** SCREEN 28 · Citizen Profile
> **Effort:** S (≤1 day)
> **Dependencies:** `00-foundation/02-design-tokens.md`, `00-foundation/03-bottom-nav-component.md`, `00-foundation/04-status-bar-component.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ui`

## Context

The base layout: gradient hero slot at the top (task 02), scrollable content area for stats grid, medals carousel, activity feed, settings (tasks 03–06), bottom nav with Profile tab active. A "Editar perfil" floating button in the hero (handled by task 06).

## Acceptance Criteria

### Scenario · Default render

**Given** the user opens Profile
**When** it renders
**Then** status bar variant transitions: `light` over hero, `dark` over content
**And** the hero slot is reserved at top
**And** below: stats grid, medals carousel, activity feed, settings sections
**And** bottom nav active on Profile

### Scenario · Slot system

**Given** the screen exposes slots
**When** tasks plug in
**Then** named slots are: `hero`, `stats`, `medals`, `activity`, `settings`

### Scenario · Theming

**Given** dark mode
**When** rendered
**Then** content adapts; hero gradient constant

### Scenario · Accessibility

**Given** SR is on
**When** mounted
**Then** slot order is reading order

## Frontend

```
apps/mobile/src/screens/CitizenProfile/
├── CitizenProfileScreen.tsx
├── CitizenProfileScreen.styles.ts
├── CitizenProfileScreen.test.tsx
└── components/
    └── CitizenProfileLayoutSlots.tsx
```

## Backend

Not applicable.

## Database

Not applicable.

## Edge Cases

- **Just-signed-up user**: stats are zeros honestly; activity is empty.

## Privacy / LGPD

Not applicable directly.

## Analytics

| Event                          | When                                       | Props                                |
|--------------------------------|--------------------------------------------|---------------------------------------|
| `citizen_profile.viewed`       | Screen mounts                              | `user_id`, `level`                   |

## Tests

- **Unit**: slot rendering.
- **Snapshot**: light + dark.
- **A11y**: order.

## Definition of Done

- [ ] CitizenProfileScreen base
- [ ] LayoutSlots
- [ ] Status bar transitions
- [ ] Bottom nav highlight
- [ ] Light + dark
- [ ] Accessibility verified
- [ ] Tests passing

## Standards & References

- Cross-cutting: `docs/engineering/`
- Prototype: `design/index.html` (search `title: 'Perfil Cidadão'`)
- Bottom nav: `00-foundation/03-bottom-nav-component.md`
- `CLAUDE.md`

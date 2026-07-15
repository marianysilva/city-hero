# City Profile · Render UI base

> **Type:** Screen feature · UI\
> **Screen:** SCREEN 20 · City Profile\
> **Effort:** S (≤1 day)\
> **Dependencies:** `00-foundation/02-design-tokens.md`, `00-foundation/04-status-bar-component.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `frontend`, `screen`, `ui`

## Context

The base layout: a slate-50 background, a tall gradient hero at the top reserved for task 02, then a
scrollable content area hosting the about card, quick facts grid, insights card, mini-dashboard, and
extras (tasks 03–06).

## User Story

**As a** Citizen,\
**I want** a calm, dashboard-like layout for my city's profile,\
**In order to** read at a glance without distraction.

## Acceptance Criteria

### Scenario · Default render

**Given** the user opens City Profile\
**When** the screen renders\
**Then** the status bar variant is `light` (over the gradient hero)\
**And** the hero slot is reserved at the top with safe area respected\
**And** below the hero, a scrollable area hosts slots for: about, quick facts, insights, dashboard,
extras\
**And** the bottom nav is visible with the appropriate tab highlighted

### Scenario · Slot system

**Given** the screen exposes positional slots\
**When** other tasks plug in\
**Then** the named slots are: `hero`, `about`, `quick-facts`, `insights`, `dashboard`, `extras`\
**And** the order reflects the prototype

### Scenario · Status bar transitions on scroll

**Given** the user scrolls past the hero\
**When** the hero scrolls off\
**Then** the status bar variant fades to `dark` (over the light content)\
**And** transition is smooth (per `00-foundation/04`)

### Scenario · Back navigation

**Given** the user taps the hero's overlay back button (handled by task 02)\
**When** the action runs\
**Then** the screen returns to the previous screen (More menu typically)

### Scenario · Theming

**Given** the user is in dark mode\
**When** the screen renders\
**Then** the content background adapts to dark\
**And** the gradient hero remains constant (brand identity)

### Scenario · Accessibility

**Given** screen reader is on\
**When** the screen mounts\
**Then** the slot order is preserved as reading order\
**And** subsequent tasks provide their own labels

## Frontend (React Native)

### Component location

```
apps/city-hero/src/screens/CityProfile/
├── CityProfileScreen.tsx
├── CityProfileScreen.styles.ts
├── CityProfileScreen.test.tsx
└── components/
    └── CityProfileLayoutSlots.tsx
```

### Component behavior

- `CityProfileScreen` composes the hero, scrollable content, and bottom nav.
- `CityProfileLayoutSlots` defines positional anchors.
- The screen reads the city's data via a hook (`useCityProfile`) that fetches
  `/api/v1/cities/{id}/profile`.

## Backend

Not applicable for this task.

## Database

Not applicable directly.

## Edge Cases

- **Slow data fetch**: a skeleton replaces the content while loading.
- **Network error**: an inline error in the content area; hero still renders if cached.

## Privacy / LGPD

Not applicable.

## Analytics

| Event                       | When           | Props     |
| --------------------------- | -------------- | --------- |
| `city_profile.viewed`       | Screen mounts  | `city_id` |
| `city_profile.back_pressed` | User taps back | —         |

## Tests

- **Unit**: slot rendering; status bar variant on scroll.
- **Snapshot**: light + dark.
- **A11y**: reading order.

## Definition of Done

- [ ] CityProfileScreen base layout
- [ ] CityProfileLayoutSlots
- [ ] Status bar variant on scroll
- [ ] Light + dark themes
- [ ] Accessibility verified
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Coding: `docs/engineering/coding-standards.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Project context

- Prototype: `design/index.html` (search `title: 'Perfil da Cidade'`)
- `features.md` § 5 Transparency Portal (Public View)
- `CLAUDE.md`

# Civic Feed · Render UI base

> **Type:** Screen feature · UI
> **Screen:** SCREEN 07 · Civic Feed
> **Effort:** S (≤1 day)
> **Dependencies:** `00-foundation/02-design-tokens.md`, `00-foundation/03-bottom-nav-component.md`, `00-foundation/04-status-bar-component.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ui`

## Context

The base layout for the Civic Feed: a header with a label ("FEED"), a
title ("No seu bairro"), and one action button (search); a row of
filter chips below the header (radius and sort); and the scrollable
feed list area that hosts the cards (rendered by tasks 02 and 03).

> User preferences (radius default, sort default, mute categories,
> etc.) live exclusively under **Mais → Configurações**
> (`28-citizen-profile/06-settings-and-logout.md`). The feed header has
> **no** settings icon.

This task focuses on layout and styling — it does not fetch data or
implement filter behavior.

## User Story

**As a** Citizen,
**I want** a clean, social-feed-style layout for my neighborhood,
**In order to** scan recent reports quickly and engage with one tap.

## Acceptance Criteria

### Scenario · Default render

**Given** the user lands on the Feed tab
**When** the screen renders
**Then** the status bar variant is `dark`
**And** the header shows the kicker "FEED" in small bold uppercase, the title "No seu bairro" in extrabold, and one circular icon button on the right (search 🔍)
**And** below the header, a horizontal filter chip row appears with three chips by default: a radius chip ("📍 10 km", active), "Novos", and "Mais apoiados"
**And** the rest of the screen hosts the feed list area
**And** the bottom nav is visible (Feed tab active)

### Scenario · Sticky header

**Given** the user scrolls the feed
**When** the scroll position passes the header
**Then** the header subtly compresses (smaller padding) but stays visible at the top
**And** the filter chips can stick or scroll with the content (decision: chips stay sticky for fast filter access)

### Scenario · Search button tap

**Given** the user taps the search button
**When** the action runs
**Then** the search overlay opens (delegated to task 05)

### Scenario · Empty state placeholder

**Given** the feed has no items yet (loading or empty)
**When** the screen renders the list area
**Then** a soft skeleton or empty state placeholder fills the space (actual logic lives in tasks 02 and 09)

### Scenario · Theming

**Given** the system is in dark mode
**When** the screen renders
**Then** the background uses the dark theme's neutral surface
**And** chips, header, and cards use their dark-mode variants
**And** brand colors stay constant

### Scenario · Accessibility

**Given** screen reader is on
**When** the user navigates the screen
**Then** the title is announced as a heading
**And** the search button is labeled with its action
**And** filter chips are announced as a group with selection state

## Frontend (React Native)

### Component location

```
apps/mobile/src/screens/CivicFeed/
├── CivicFeedScreen.tsx
├── CivicFeedScreen.styles.ts
├── CivicFeedScreen.test.tsx
└── components/
    └── FeedHeader.tsx
# Filter chips are not a screen-local component: the chip row consumes
# the shared `FilterChipRow` molecule from `@cityhero/design-system`
# (see `docs/engineering/component-inventory.md`). The chip list +
# filter callback are owned by `07-civic-feed/04-filter-chips.md`.
```

### Component behavior

- `CivicFeedScreen` composes `FeedHeader`, the shared `FilterChipRow`, and the list area (rendered by task 02). It owns layout and slots — not data.
- `FeedHeader` is presentational with `onSearchPress` callback.
- The filter chip row consumes the design system's `FilterChipRow`; chip definitions + tap behavior live in task 04.
- The list area is initially a placeholder; task 02 replaces it with a virtualized list.

### Layout details

- Safe area insets respected at the top.
- Filter chips row scrolls horizontally if it overflows.
- Bottom inset accommodates the bottom nav.

### Animation

- Header compress on scroll (~200ms transition).

## Backend

Not applicable for this UI task. Search opens a UI overlay (per `07-civic-feed/05-search.md`).

## Database

Not applicable directly.

## Edge Cases

- **Long screen titles**: titles truncate with ellipsis if needed.
- **Sticky header conflicts with pull-to-refresh**: the gesture's start area is the top of the list, not the header.

## Privacy / LGPD

Not applicable.

## Analytics

| Event                          | When                                    | Props |
|--------------------------------|-----------------------------------------|-------|
| `feed.viewed`                  | Screen mounts                           | —     |
| `feed.search_pressed`          | User taps the search icon               | —     |

## Tests

- **Unit**: header renders correctly; buttons fire callbacks; chip row renders the right chips.
- **Snapshot**: light + dark.
- **A11y**: title is a heading; buttons labeled.

## Definition of Done

- [ ] CivicFeedScreen base layout
- [ ] FeedHeader with search button
- [ ] Filter chip row wired (consumes shared `FilterChipRow`; chip definitions in task 04)
- [ ] Sticky header behavior
- [ ] Light + dark themes
- [ ] Accessibility verified
- [ ] Tests passing
- [ ] Ready for tasks 02–09 to plug in

## Standards & References

### Cross-cutting standards
- Coding: `docs/engineering/coding-standards.md`
- Architecture (component patterns): `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references
- React Native Safe Area Context: https://github.com/th3rdwave/react-native-safe-area-context
- Bottom Sheet (`@gorhom/bottom-sheet`): https://gorhom.dev/react-native-bottom-sheet

### Project context
- Prototype: `design/index.html` (search `title: 'Feed Cívico'`)
- Bottom nav: `00-foundation/03-bottom-nav-component.md`
- `CLAUDE.md`

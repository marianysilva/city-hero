# Home · Render UI base · Top bar, layout, FAB position

> **Type:** Screen feature · UI\
> **Screen:** SCREEN 06 · Home · Hyperlocal Map\
> **Effort:** M (1-2 days)\
> **Dependencies:** `00-foundation/02-design-tokens.md`, `00-foundation/03-bottom-nav-component.md`,
> `00-foundation/04-status-bar-component.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `frontend`, `screen`, `ui`

## Context

The base layout for the Home screen: the status bar variant, the floating top bar with the user's
level, name, and XP; the absolute positioning of the FAB camera (center of the bottom nav,
elevated); and the placeholders where other home features will plug in (filter chips, mini badges,
ticket card, discovery card, map).

This task does **not** include the map (that's task 02), but defines the slot the map fills. It does
include the visual scaffolding around the map.

## User Story

**As a** Citizen,\
**I want** a clean, info-rich home that shows my level and the city at a glance,\
**In order to** feel oriented and motivated to interact.

## Acceptance Criteria

### Scenario · Default render

**Given** the user lands on Home\
**When** the screen renders\
**Then** the status bar variant is `dark` (light overlay above the map)\
**And** the top bar floats above the map with rounded corners and a soft shadow\
**And** the top bar shows: user avatar (initial-based), name + level chip ("João, Nível 15 ★"), and
the current XP total ("2.450")\
**And** below the top bar, a horizontal row of filter chips appears (rendered by task 03)\
**And** the map fills the remaining space (rendered by task 02)\
**And** the bottom nav is rendered (foundation task 03), with the camera FAB centered and elevated
8dp above the bar

### Scenario · Top bar positioning

**Given** the user has not scrolled\
**When** the top bar renders\
**Then** it sits below the safe area inset (respects notch and dynamic island)\
**And** it remains visually distinct from the map without blocking too much of it

### Scenario · Top bar tap

**Given** the user taps the user avatar or name\
**When** the action runs\
**Then** the app navigates to the Citizen Profile screen (28)

### Scenario · Top bar in offline mode

**Given** the user is offline\
**When** the top bar renders\
**Then** the offline banner (task 10) sits below the top bar without overlapping\
**And** the top bar's content remains readable

### Scenario · Top bar with empty XP

**Given** a brand-new user with 0 XP\
**When** the top bar renders\
**Then** it shows "0 XP" (not "—" or empty)\
**And** the level shows "Nível 1"

### Scenario · Avatar fallback

**Given** the user has no profile photo (MVP doesn't have profile photos yet)\
**When** the avatar renders\
**Then** it shows the user's first letter on a brand-gradient background

### Scenario · Long names

**Given** the user has a long name (e.g., "Maria Aparecida da Silva")\
**When** the top bar renders\
**Then** the name truncates with ellipsis after one line\
**And** the level chip stays right-aligned

### Scenario · Slot positioning

**Given** the screen renders\
**When** the layout is inspected\
**Then** there are clear positional slots for: filter chips (top), mini badges (right side,
mid-screen), floating ticket card (above bottom nav), discovery card (above the ticket card),
offline banner (below top bar)\
**And** these slots use absolute positioning over the map

### Scenario · Accessibility

**Given** screen reader is on\
**When** the user navigates the screen\
**Then** the top bar's content is announced as a group with name, level, and XP\
**And** the avatar is labeled "Open profile"\
**And** elements have correct reading order

## Frontend (React Native)

### Component location

```
apps/city-hero/src/screens/Home/
├── HomeScreen.tsx
├── HomeScreen.styles.ts
├── HomeScreen.test.tsx
└── components/
    ├── ProfileTopBar.tsx
    └── HomeLayoutSlots.tsx     ← positional slots used by other tasks
```

### Component behavior

- `HomeScreen` wires together the layout: status bar, top bar, map area, slots, and the bottom nav
  (which is rendered globally by the bottom-tab navigator).
- `ProfileTopBar` reads the current user from the auth store and the XP/level from the gamification
  store. It's pure-presentational beyond that read.
- `HomeLayoutSlots` is a small component that defines the positional anchors using absolute
  positioning, so other tasks (3–10) can render their pieces in the right places without each task
  reinventing layout logic.

### Slot system

Each slot exposes a stable position the screen can render into via composition. Examples:
`top-overlay` (top bar + chips), `right-mid-overlay` (mini badges), `bottom-overlay` (discovery
card + ticket card stacked), `below-top-overlay` (offline banner).

### Theming

Top bar background uses surface white with subtle shadow. In dark mode, surface is deep slate; user
avatar gradient remains identical (brand colors are constant).

## Backend

This task doesn't make backend calls. Other home tasks (02 for pins, 04 for location-related, etc.)
own that.

## Database

Not applicable directly.

## Edge Cases

- **Map area is empty during loading**: a soft skeleton (or a static map illustration) fills the
  area until the map renders. The slot system isn't disturbed.
- **Status bar overlap on devices with dynamic island**: top bar respects the safe area inset and
  renders below the island.
- **Landscape mode**: the app is portrait-only; ignore.
- **First-time render after onboarding**: the screen mounts cleanly without flicker (the splash
  animation completes before mount).

## Privacy / LGPD

The top bar shows the user's first name and UUID-derived avatar. No sensitive PII is rendered.

## Analytics

| Event                         | When                     | Props                    |
| ----------------------------- | ------------------------ | ------------------------ |
| `home.viewed`                 | Screen mounts            | `is_first_session: bool` |
| `home.profile_top_bar_tapped` | User taps avatar or name | —                        |

## Tests

- **Unit**: top bar renders correctly with level/XP placeholders; tap on avatar fires navigation;
  layout slots render at expected positions.
- **Snapshot**: light + dark; with/without offline banner.
- **A11y**: top bar group is correctly read; avatar is labeled.

## Definition of Done

- [ ] HomeScreen base layout
- [ ] ProfileTopBar reading from stores
- [ ] HomeLayoutSlots component with named slots
- [ ] Status bar variant set
- [ ] Bottom nav integration
- [ ] Light + dark themes
- [ ] Accessibility verified
- [ ] Tests passing
- [ ] Ready for sub-tasks 02–10 to plug in

## Standards & References

### Cross-cutting standards

- Coding: `docs/engineering/coding-standards.md`
- Architecture (component patterns): `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- React Native Safe Area Context: https://github.com/th3rdwave/react-native-safe-area-context

### Project context

- Prototype: `design/index.html` (search `title: 'Home · Mapa Hiperlocal'`)
- Bottom nav: `00-foundation/03-bottom-nav-component.md`
- Status bar: `00-foundation/04-status-bar-component.md`
- Other home features: tasks 02–10 in this folder
- `CLAUDE.md`

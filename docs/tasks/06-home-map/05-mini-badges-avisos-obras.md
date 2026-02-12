# Home · Mini badges · Avisos + Obras

> **Type:** Screen feature · UI + entry points
> **Screen:** SCREEN 06 · Home · Hyperlocal Map
> **Effort:** S (≤1 day)
> **Dependencies:** `06-home-map/01-render-home-ui-base.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ui`

## Context

Two small floating badges on the right side of the map (mid-screen height)
that act as discreet entry points to:

- **Avisos da Prefeitura** (Prefecture News) — shows a count of new
  unread official announcements with a pulsing dot.
- **Obra ativa** — shows the closest active public-works project as a
  hint, linking to the Obras list.

They're intentionally non-intrusive — they don't compete with the main
map content but stay visible enough to be discovered.

## User Story

**As a** Citizen,
**I want** quick visual hints of what's happening from the prefecture and what works are near me,
**In order to** stay informed without leaving the map.

## Acceptance Criteria

### Scenario · Default render with both badges

**Given** the user is on Home
**When** badges render
**Then** the "Avisos · 3 novos" badge appears (with a pulsing red dot if there are new items)
**And** below it (small vertical gap), the "Obra ativa · Pça Central" badge appears (with a pulsing green dot)
**And** both are right-aligned and float above the map

### Scenario · Tap "Avisos" badge

**Given** the badge is rendered
**When** the user taps it
**Then** the app navigates to SCREEN 21 · Avisos da Prefeitura
**And** the unread count badge clears as the user enters that screen

### Scenario · Tap "Obra ativa" badge

**Given** the badge is rendered
**When** the user taps it
**Then** the app navigates to SCREEN 26 · Obras em Andamento (or directly to the closest one's detail, configurable)

### Scenario · No new prefecture announcements

**Given** there are no unread prefecture announcements
**When** the badge would normally render
**Then** the "Avisos" badge text changes to a generic label ("Prefeitura") with no count
**And** the pulse dot is hidden

### Scenario · No nearby active public works

**Given** there are no public works within a reasonable radius
**When** the badge would normally render
**Then** the "Obra ativa" badge is hidden entirely
**And** the layout reflows so the "Avisos" badge remains in place

### Scenario · Badge counts update in real time

**Given** a new prefecture announcement is posted
**When** the user is already on Home
**Then** the badge updates with the new count and the pulse dot animates briefly
**And** the user can tap it to navigate

### Scenario · Accessibility

**Given** screen reader is on
**When** the user focuses a badge
**Then** the screen reader announces the badge label and any unread count
**And** the badge is labeled as a button

### Scenario · Offline mode

**Given** the device is offline
**When** the screen renders
**Then** badges show their last-known state from cache
**And** the pulse dot is paused (no real-time updates)

## Frontend (React Native)

### Where it lives

```
apps/mobile/src/screens/Home/
├── components/
│   ├── PrefectureNewsBadge.tsx
│   └── NearbyWorkBadge.tsx
└── hooks/
    ├── useUnreadPrefectureCount.ts
    └── useNearestActiveWork.ts
```

### Behavior

- `useUnreadPrefectureCount` is a TanStack Query hook against the prefecture-announcements unread-count endpoint. It supports pull-based refetch and, optionally, websocket-driven invalidation (real-time, see task 08 for the broader pattern).
- `useNearestActiveWork` queries the closest active public work to the user's location (or the city centroid if no GPS).
- Each badge is a small absolute-positioned button rendered into the home layout's "right-mid-overlay" slot.
- Badges have light haptic feedback on tap.

### Visual styles

- Compact (≤32dp tall), white background, soft shadow, rounded corners.
- Pulse dots use the design system's accent colors (rose for prefecture, emerald for active works).
- Subtle scale-in animation on first render.

### Performance

The hooks use moderate stale times (e.g., 1-2 minutes) so badges feel "live" without polling aggressively. Real-time invalidation comes from task 08 (websocket integration).

## Backend (FastAPI)

### Endpoints

| Method | Path                                                   | Purpose                                  |
|--------|--------------------------------------------------------|------------------------------------------|
| GET    | `/api/v1/prefecture-news/unread-count`                 | Count of unread announcements for user  |
| GET    | `/api/v1/public-works/nearest?lat=&lng=&max_km=10`     | Nearest active public works              |

Both follow the standard contract (multi-tenant scoping, error shape, pagination not needed for these specific reads).

## Database

The prefecture-news read tracking and public-works geometry are owned by their dedicated screen tasks (Avisos screen 21 and Obras screen 26 respectively). This task only consumes their endpoints.

## Edge Cases

- **City has no public-works data**: the work badge is hidden.
- **Prefecture-news endpoint returns 5xx**: badge falls back to a generic label without count; logs telemetry.
- **Two badges overflow vertically on small devices**: stacking respects safe areas; the "Obra ativa" badge can be hidden first if needed.
- **User taps a badge mid-fetch**: navigation proceeds; the destination screen handles its own loading.

## Privacy / LGPD

- The unread count is keyed to the user; safe (just a count, not contents).
- Nearest-work query uses approximate location server-side (the user's coordinates or city centroid); no continuous tracking.

## Analytics

| Event                              | When                                    | Props                                |
|------------------------------------|-----------------------------------------|---------------------------------------|
| `home.badge_avisos_pressed`        | User taps the prefecture badge          | `unread_count`                        |
| `home.badge_obra_pressed`          | User taps the active-work badge         | `work_id`                             |
| `home.badge_avisos_rendered`       | Avisos badge rendered                   | `had_unread: bool`                    |

## Tests

- **Unit**: each badge renders correctly per data shape; tap fires navigation.
- **Integration**: empty/non-empty unread counts; missing nearest work hides the badge.
- **A11y**: badges labeled and announced.

## Definition of Done

- [ ] Two badge components in `apps/mobile/src/screens/Home`
- [ ] Hooks for unread count and nearest work
- [ ] Backend endpoints
- [ ] Layout positioning into the "right-mid-overlay" slot
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Architecture (REST conventions): `docs/engineering/architecture-patterns.md`
- Coding: `docs/engineering/coding-standards.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references
- TanStack Query: https://tanstack.com/query/latest

### Project context
- Render UI base: `01-render-home-ui-base.md`
- Avisos screen: `21-prefecture-news/`
- Obras screen: `26-public-works-list/`
- `CLAUDE.md`

# Home · Floating ticket card · Nearby high-priority report

> **Type:** Screen feature · UI + recommendation
> **Screen:** SCREEN 06 · Home · Hyperlocal Map
> **Effort:** S (≤1 day)
> **Dependencies:** `06-home-map/01-render-home-ui-base.md`, `06-home-map/02-map-integration-with-pins.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `backend`, `screen`, `recommendation`

## Context

A small floating card at the bottom of the screen (above the bottom nav)
showing one nearby high-priority report. The intent is to surface
something **actionable** — a problem the user can support with one tap —
without asking them to scroll a list. It's the lightest possible
"recommended action" recommendation, contextual to where the user is.

The card shows: category emoji, address (truncated), distance from user,
support count, and a primary "Apoiar" CTA.

## User Story

**As a** Citizen on Home,
**I want** to see one specific nearby problem I can act on,
**In order to** support it without exploring the whole map.

## Acceptance Criteria

### Scenario · Default render with a recommendation

**Given** the user has a fix on their location and there's at least one nearby open/in-progress report
**When** the screen renders
**Then** a floating card appears above the bottom nav
**And** it shows: a category emoji icon, the report's short address, distance from the user (e.g., "80m"), support count, and an "Apoiar" CTA
**And** tapping the card body opens the report's detail screen

### Scenario · Tap "Apoiar"

**Given** the card is rendered
**When** the user taps the "Apoiar" CTA
**Then** the support is added optimistically (local count +1)
**And** the backend is notified
**And** if backend confirms, the count updates; if it fails, the optimistic update rolls back
**And** XP is granted (+10 XP per `support` action; see gamification rules)

### Scenario · No nearby report

**Given** there's no nearby report in the user's vicinity
**When** the screen renders
**Then** the card is hidden entirely (no empty placeholder)
**And** the layout reflows so the discovery card (task 07) and bottom nav remain in correct positions

### Scenario · Recommendation logic

**Given** several reports are nearby
**When** the recommendation engine picks one
**Then** the chosen one is the highest-priority by combined score: distance (closer = better), support_count (more = higher), recency (newer = higher), severity (critical category like lighting at night = higher)
**And** ties are broken by most recent activity

### Scenario · Recommendation refreshes

**Given** the user moves significantly or new pins appear
**When** the recommendation engine reruns
**Then** the card content updates without a jarring transition (smooth crossfade)

### Scenario · User already supported the recommended report

**Given** the recommendation includes a report the user already supported
**When** the card renders
**Then** the CTA changes to "Apoiando" with a checkmark
**And** tapping again removes the support (toggle behavior)

### Scenario · Anonymous user (not logged in)

**Given** the user is not authenticated
**When** they tap "Apoiar"
**Then** the app prompts to log in / sign up
**And** after login, the action completes for the same report

### Scenario · Offline mode

**Given** the device is offline
**When** the user taps "Apoiar"
**Then** the action is queued via the offline queue (foundation 09)
**And** optimistic UI shows the change locally
**And** the action syncs when connectivity returns

### Scenario · Card dismissal

**Given** the card is visible
**When** the user swipes it horizontally or taps a small "×" affordance
**Then** the card is dismissed for the rest of the session
**And** the next session re-evaluates and may show a different recommendation

### Scenario · Accessibility

**Given** screen reader is on
**When** the user navigates the card
**Then** all key info (category, address, distance, count) is announced
**And** the "Apoiar" CTA is clearly labeled
**And** swipe-to-dismiss has an alternative (the × affordance)

## Frontend (React Native)

### Where it lives

```
apps/mobile/src/screens/Home/
├── components/
│   └── FloatingTicketCard.tsx
└── hooks/
    └── useNearbyRecommendation.ts
```

### Behavior

- `useNearbyRecommendation` is a hook that:
  - Reads the user's location (or city centroid).
  - Calls the backend's recommendation endpoint with the user position.
  - Caches the result; refreshes on significant location change or every few minutes.
- `FloatingTicketCard` renders the card with the recommendation. The component is positional in the home layout's "bottom-overlay" slot.
- Support tap delegates to a shared "support" action that exists project-wide (used by the Detail screens too).

### Performance

The recommendation request is debounced; it doesn't fire on every micro-pan.

## Backend (FastAPI)

### Endpoint

| Method | Path                                                     | Purpose                                       |
|--------|----------------------------------------------------------|-----------------------------------------------|
| GET    | `/api/v1/reports/recommend-nearby?lat=&lng=&max_km=2`    | Returns a single recommended report          |

The backend:

- Filters reports within `max_km` (default 2) of the user.
- Excludes reports the user has already supported.
- Scores by the formula above (distance × inverse, support_count, recency, severity weights).
- Returns the top scorer (or null).

The endpoint respects multi-tenant scoping.

## Database

Recommendation logic uses the `reports` table (geo column indexed by GiST) plus `report_supports` (who-supported-what). No new schema beyond what report-creation tasks define.

## Edge Cases

- **No location available**: use the active city's centroid; the recommendation is "hyperlocal-ish" rather than "around me".
- **All nearby reports already supported**: the card is hidden (no recommendation).
- **Recommendation candidate's photo not yet anonymized**: the card shows a category emoji instead of the photo (safe default).
- **Card dismissed twice in a row**: respect the dismissal — don't re-show within the same session.
- **Network failure**: the card is hidden; no empty placeholder; the screen continues normally.

## Privacy / LGPD

- The recommendation endpoint receives the user's lat/lng. This is necessary; minimize precision (e.g., truncate to 4 decimals = ~11m) on the request to avoid ultra-precise tracking.
- The endpoint never logs the coordinates; only the resulting report ID for analytics.

## Analytics

| Event                          | When                                       | Props                              |
|--------------------------------|--------------------------------------------|-------------------------------------|
| `home.ticket_card_shown`       | Card rendered with a recommendation        | `report_id`, `score`               |
| `home.ticket_card_tap`         | User taps the card body                    | `report_id`                         |
| `home.ticket_card_support_tap` | User taps Apoiar                           | `report_id`, `now_supporting: bool`|
| `home.ticket_card_dismissed`   | User dismisses                             | `report_id`                         |

## Tests

- **Unit (frontend)**: card renders with the recommendation; tapping CTA fires support action; dismissal hides for the session.
- **Unit (backend)**: recommendation scoring correct; multi-tenant scoping.
- **Integration**: optimistic support flow; recovery on backend error.
- **E2E**: see card on Home → tap support → count increases.

## Definition of Done

- [ ] FloatingTicketCard component in the bottom-overlay slot
- [ ] Recommendation hook
- [ ] Backend recommendation endpoint
- [ ] Optimistic support action with rollback
- [ ] Offline queue integration for the support action
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Architecture (multi-tenant, REST): `docs/engineering/architecture-patterns.md`
- Coding: `docs/engineering/coding-standards.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references
- TanStack Query optimistic updates: https://tanstack.com/query/latest/docs/react/guides/optimistic-updates

### Project context
- Render UI base: `01-render-home-ui-base.md`
- Map integration: `02-map-integration-with-pins.md`
- Offline queue: `00-foundation/09-offline-queue.md`
- `CLAUDE.md`

# Home · Discovery card · Programs & Transparency (one-time)

> **Type:** Screen feature · UX / growth
> **Screen:** SCREEN 06 · Home · Hyperlocal Map
> **Effort:** S (≤1 day)
> **Dependencies:** `06-home-map/01-render-home-ui-base.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `growth`

## Context

A one-time "discovery" card that appears above the floating ticket card,
introducing the **Programs & Transparency** feature after the user has
established familiarity (specifically, after their **3rd successful
report**). It's a teal-to-indigo gradient pill with a short pitch and a
"Ver" CTA, dismissible with an "×".

The intent: avoid front-loading every feature in onboarding. Instead,
introduce secondary features contextually after the user demonstrates
initial engagement.

## User Story

**As a** newly engaged Citizen,
**I want** to discover related features as I'm ready,
**In order to** keep the initial app simple while learning more over time.

## Acceptance Criteria

### Scenario · Show after 3rd report

**Given** the user has just completed their 3rd successful report (synced, not just queued)
**When** they next land on Home
**Then** the discovery card is visible in the "bottom-overlay" slot, above the floating ticket card
**And** the card has the gradient background, the icon, the headline, and the "Ver" CTA

### Scenario · Tap the card

**Given** the discovery card is visible
**When** the user taps it
**Then** the app navigates to SCREEN 22 · Programs & Transparency
**And** the card is marked as "seen" so it won't appear again

### Scenario · Dismiss the card

**Given** the discovery card is visible
**When** the user taps the "×" affordance
**Then** the card is dismissed
**And** marked as "dismissed" so it won't appear again
**And** subsequent app sessions don't show it

### Scenario · Already seen or dismissed

**Given** the user previously saw or dismissed the card
**When** they land on Home
**Then** the card does not appear
**And** the layout reflows so the floating ticket card moves down to fill the space

### Scenario · Persisted state

**Given** the user dismissed the card on device A
**When** they sign in on device B
**Then** the dismissed/seen state is reflected (server-stored on the user record)
**And** the card does not appear again on device B

### Scenario · Other discovery cards (future)

**Given** the architecture supports more discovery cards (e.g., "Try the Camera AI"  after 1st support)
**When** the screen renders
**Then** at most one card is visible at a time
**And** the priority order is configurable
**And** unseen cards take precedence over seen ones

### Scenario · Anonymous user

**Given** the user has not signed up but has 3 local reports queued (not yet synced)
**When** they land on Home
**Then** the card does not appear (we wait for the user to be authenticated and have 3 synced reports)
**And** after they sign up and the queue drains, the threshold can be re-evaluated

### Scenario · Accessibility

**Given** screen reader is on
**When** the user focuses the card
**Then** the card is announced as a button with a clear description
**And** the "×" affordance is announced as a separate dismiss action

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/Home/
├── components/
│   └── DiscoveryCard.tsx
└── hooks/
    └── useDiscoveryCards.ts
```

### Behavior

- `useDiscoveryCards` reads the user's discovery state (which cards have been seen / dismissed) from the auth store. It returns the next card to show (or null) based on triggers and priority.
- `DiscoveryCard` is a presentational component that receives the card metadata (id, headline, CTA label, target route) and renders the gradient pill.
- Tapping the card body fires an action that navigates to the target route and marks the card as "seen". Dismissing fires an action that marks it as "dismissed".
- The state changes are persisted to the backend via the user-update endpoint (and locally first for optimism).

### Card schema

The discovery cards are configured statically (or loaded from config service):

| Field            | Description                                   |
|------------------|-----------------------------------------------|
| `id`             | Stable identifier (`programs_transparency`)   |
| `trigger`        | Condition to evaluate (e.g., `synced_reports >= 3`) |
| `headline`       | Short label                                   |
| `cta_label`      | "Ver"                                         |
| `target_route`   | Where to navigate                             |
| `gradient_from`  | Style                                         |
| `gradient_to`    | Style                                         |

## Backend (FastAPI)

### Field on `users`

| Column                       | Type      | Notes                                                |
|------------------------------|-----------|------------------------------------------------------|
| `discovery_cards_state`      | jsonb     | Map of card_id → state (`seen`, `dismissed`, `null`) |

### Endpoint reuse

`PATCH /api/v1/auth/me` accepts a `discovery_cards_state` patch. No new endpoint.

### Trigger evaluation

The trigger condition (e.g., "synced_reports >= 3") can be evaluated client-side using user data already in scope. For more complex triggers in the future, a dedicated endpoint can return "next discovery card" — but for MVP, client-side is fine.

## Database

The `discovery_cards_state` column on `users` (added via Alembic migration with default empty object).

## Edge Cases

- **User reports a 4th, 5th, etc.**: the card has already been seen/dismissed; it doesn't reappear.
- **Card config changed after a user dismissed it**: the dismissal persists by `id`; if the headline changes, the user still doesn't see it.
- **Multiple cards triggered at the same time**: only the first by priority is shown.
- **Slot collision with the floating ticket card**: stacking is handled by the home layout; the discovery card is above the ticket card with a small gap.

## Privacy / LGPD

The state is non-sensitive (just card IDs and timestamps). Stored within the user record.

## Analytics

| Event                              | When                                    | Props                |
|------------------------------------|-----------------------------------------|----------------------|
| `home.discovery_card_shown`        | Card rendered                           | `card_id`            |
| `home.discovery_card_tapped`       | User taps the card                      | `card_id`            |
| `home.discovery_card_dismissed`    | User taps "×"                           | `card_id`            |

## Tests

- **Unit**: hook returns the right card given the user's state and triggers; tapping/dismissing updates state.
- **Integration**: state syncs to backend; card doesn't re-appear after dismissal.
- **E2E**: simulate completing 3 reports; assert card appears on next Home visit.

## Definition of Done

- [ ] DiscoveryCard component in the bottom-overlay slot
- [ ] useDiscoveryCards hook with trigger evaluation
- [ ] Backend field on users
- [ ] Card config (initially: programs_transparency only)
- [ ] State syncs to server
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Architecture: `docs/engineering/architecture-patterns.md`
- Coding: `docs/engineering/coding-standards.md`
- Testing: `docs/engineering/testing-strategy.md`

### Project context
- Render UI base: `01-render-home-ui-base.md`
- Programs screen: `22-programs-transparency/`
- `CLAUDE.md`

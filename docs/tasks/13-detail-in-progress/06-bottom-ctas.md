# Detail · In Progress · Bottom CTAs (Apoiar + Compartilhar)

> **Type:** Screen feature · UI + integration
> **Screen:** SCREEN 13 · Detail · In Progress
> **Effort:** S (≤1 day)
> **Dependencies:** `13-detail-in-progress/01-render-detail-ui-base.md`, `07-civic-feed/06-apoiar-action.md`, `07-civic-feed/07-compartilhar-action.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ux`

## Context

The sticky bottom bar with the two persistent CTAs: **Compartilhar** on
the left (slate-100 background, share icon SVG) and **🔥 Apoiar +10 XP**
on the right (brand orange, the primary action). Both reuse the shared
services from `07-civic-feed/06` (support) and `07-civic-feed/07`
(share) so behavior is consistent across the app.

When the user is the report's owner, the layout adapts: the Apoiar
button changes to a non-tappable visual ("Você é o autor") since
self-support is blocked.

## User Story

**As a** Citizen looking at an open report,
**I want** quick access to the two highest-value actions (support + share),
**In order to** amplify the report without scrolling.

## Acceptance Criteria

### Scenario · Default render (visitor)

**Given** the user is not the report's owner
**When** the bottom bar renders
**Then** a sticky bar appears at the bottom of the screen
**And** the left button is "Compartilhar" (slate-100 background, share SVG icon, label text)
**And** the right button is "🔥 Apoiar +10 XP" (brand orange gradient)
**And** both buttons are flex-1 (equal width)
**And** the bar respects the bottom safe area inset

### Scenario · Owner view

**Given** the user is the report's owner
**When** the bottom bar renders
**Then** the Apoiar button is replaced with a non-tappable visual ("Você é o autor") in muted styling
**And** Compartilhar remains active (owners can share)
**And** the layout is balanced

### Scenario · Tap Apoiar

**Given** the user is a visitor
**When** they tap Apoiar
**Then** the support action runs (via the shared `useSupportToggle` from `07-civic-feed/06`)
**And** the button animates to the active state (🔥 filled, "Apoiando" text)
**And** XP is granted with a brief toast
**And** the count in the summary card and the floating ticket card (Home) updates

### Scenario · Toggle off

**Given** the user previously supported the report
**When** they tap Apoiar again
**Then** the support is removed (via the same shared action)
**And** the count decrements; XP is sticky (not revoked)

### Scenario · Tap Compartilhar

**Given** the user wants to share
**When** they tap Compartilhar
**Then** the share service runs (via `07-civic-feed/07`)
**And** the OS share sheet opens with the appropriate message + universal link
**And** for anonymous reports, the message is the anonymous-formatted variant

### Scenario · Offline

**Given** the device is offline
**When** the user taps Apoiar
**Then** the action is queued via the offline queue (per `07-civic-feed/06`)
**And** the optimistic UI persists
**And** the share button still works for Copy Link; channels requiring connectivity show the share sheet which the OS handles

### Scenario · Haptics

**Given** the user taps either CTA
**When** the tap is registered
**Then** light haptic feedback fires
**And** the success of Apoiar fires a small success haptic in addition

### Scenario · Anti-fraud rate limit hit

**Given** the user has been supporting many reports rapidly
**When** they tap Apoiar and the backend returns 429
**Then** a soft banner appears ("Você apoiou muitos reportes muito rápido")
**And** the optimistic update for the throttled request rolls back

### Scenario · Accessibility

**Given** screen reader is on
**When** the user navigates the CTAs
**Then** Compartilhar is labeled with the action ("Share report")
**And** Apoiar is labeled with its current state ("Support, 47 supports" → after tap → "Supporting, 48 supports")
**And** the owner-locked variant is announced ("You are the author")

## Frontend (React Native)

### Where it lives

```
apps/mobile/src/screens/DetailInProgress/
└── components/
    └── BottomCtaBar.tsx
```

### Component behavior

- `BottomCtaBar` receives the report ID, the current `isSupporting` state, and the owner flag.
- It composes the two buttons using the shared support and share actions.
- The owner variant disables the Apoiar button and replaces its content.

### Reused logic

- Support: `useSupportToggle(reportId)` from `07-civic-feed/06`.
- Share: `shareReport(report)` from `07-civic-feed/07`.

The hook handles cache updates so the count in the summary card, floating ticket card (Home), and feed cards all stay consistent.

## Backend

This task doesn't introduce new endpoints; both actions reuse existing endpoints from the Feed Cívico screen tasks.

## Database

No new schema.

## Edge Cases

- **Owner of an anonymous report**: the owner view applies; sharing uses the anonymous-formatted message.
- **Real-time support arrived while user is tapping**: the optimistic state still wins for the local user; the count converges.

## Privacy / LGPD

- Reused share service respects anonymity per the report's `anonymous` flag.
- No new PII handling here.

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `detail_in_progress.apoiar_pressed`| User tapped Apoiar                         | `is_supporting_now: bool`, `is_owner: bool` |
| `detail_in_progress.share_pressed` | User tapped Compartilhar                   | `is_owner: bool`                      |

## Tests

- **Unit**: visitor vs owner layout; toggle behavior; offline routing; reused hooks integration.
- **Snapshot**: light + dark; owner variant.
- **A11y**: state announcements verified.

## Definition of Done

- [ ] BottomCtaBar component
- [ ] Visitor and owner layouts
- [ ] Shared support and share hooks integration
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Coding: `docs/engineering/coding-standards.md`
- Architecture (shared services): `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references
- React Native Haptics: https://docs.expo.dev/versions/latest/sdk/haptics/

### Project context
- Render UI base: `01-render-detail-ui-base.md`
- Support action (shared): `07-civic-feed/06-apoiar-action.md`
- Share action (shared): `07-civic-feed/07-compartilhar-action.md`
- Offline queue: `00-foundation/09-offline-queue.md`
- `CLAUDE.md`

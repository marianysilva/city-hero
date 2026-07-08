# Detail · Ticket · Avaliar CTA (NPS bifurcation)

> **Type:** Screen feature · UI + navigation
> **Screen:** SCREEN 14 · Detail · Ticket (resolved)
> **Effort:** M (1-2 days)
> **Dependencies:** `14-detail-ticket/01-render-detail-ticket-ui-base.md`, `07-civic-feed/07-compartilhar-action.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ux`, `gamification`

## Context

The sticky bottom bar with two CTAs:

- **Compartilhar** on the left (reused from SCREEN 13 — same icon, same
  share service).
- **⭐ Avaliar +15 XP** on the right (emerald, the primary action) —
  tapping it navigates to SCREEN 15 (NPS Feedback) where the user
  rates the resolution.

The +15 XP is the highest single-tap reward in the app (above support's
+10 and tag's +2), reflecting the value of structured feedback. The XP
is granted **on NPS submission**, not on Avaliar tap — to make sure
the user follows through.

The Avaliar button changes appearance based on whether the user has
already submitted an NPS for this report: green active (default), or
"Avaliado · ★★★★☆" (showing the user's rating) and tappable to
re-rate.

## User Story

**As a** Citizen seeing a resolved problem,
**I want** a clear primary action to evaluate the resolution,
**In order to** give the prefecture feedback and earn the reward.

## Acceptance Criteria

### Scenario · Default render (not yet evaluated)

**Given** the user hasn't evaluated this resolution yet
**When** the bottom bar renders
**Then** a sticky bar appears with two flex-1 buttons
**And** Compartilhar (left, slate-100, share SVG icon, label "Compartilhar")
**And** ⭐ Avaliar +15 XP (right, emerald, primary)
**And** the bar respects the bottom safe area inset

### Scenario · Tap Compartilhar

**Given** the user wants to share
**When** they tap Compartilhar
**Then** the shared share service runs (per `07-civic-feed/07`)
**And** for resolved reports, the share message emphasizes the resolution ("Foi resolvido em N dias · sua liga ajudou")

### Scenario · Tap Avaliar (not yet evaluated)

**Given** the user has not evaluated
**When** they tap Avaliar
**Then** light haptic feedback fires
**And** the app navigates to SCREEN 15 (NPS Feedback) with the report's ID
**And** the navigation push preserves the back stack so returning works naturally

### Scenario · After evaluation

**Given** the user has already submitted an NPS for this report
**When** the screen renders
**Then** the right button shows "Avaliado · ★★★★☆" with the user's stars in white
**And** the button remains tappable for re-rating
**And** re-rating updates the stored rating; XP is **not** re-granted

### Scenario · Anonymous reporter

**Given** the user is the report's anonymous owner
**When** the bottom bar renders
**Then** Avaliar is fully available (NPS isn't blocked by anonymity)
**And** the NPS submission preserves the user's identity to the prefecture (per LAI)
**And** anonymity in the feed is unchanged

### Scenario · Visitor evaluates

**Given** the user is a visitor (not the owner) but they used this resolved area
**When** they tap Avaliar
**Then** they can still submit an NPS (the prefecture values all citizen feedback)
**And** the XP reward applies

### Scenario · Offline

**Given** the device is offline
**When** the user taps Avaliar
**Then** the navigation still proceeds (the NPS screen renders locally)
**And** the actual NPS submission queues via the offline queue

### Scenario · Localization

**Given** the user's language is en-US
**When** the bar renders
**Then** "Avaliar" is "Rate" / "Avaliado" is "Rated"

### Scenario · Accessibility

**Given** screen reader is on
**When** the user navigates the bar
**Then** Compartilhar is clearly labeled
**And** the Avaliar button announces its state ("Rate report, earn 15 XP" / "Rated 4 stars, tap to re-rate")

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/DetailTicket/
└── components/
    └── BottomCtaBar.tsx
```

### Component behavior

- `BottomCtaBar` receives the report ID, the user's NPS state (if any), and the owner flag.
- The button composes its visual based on `nps.has_submitted` and the user's stars.
- The Avaliar tap delegates to a small navigation hook that passes the report ID to SCREEN 15.
- Re-rating is always allowed (no cooldown — see `docs/engineering/open-questions.md` Q8).

### State source

The user's NPS state for the report is part of the report-detail response (per `00-foundation/05`), keyed by `(user_id, report_id)`.

## Backend (FastAPI)

This task doesn't introduce new endpoints. SCREEN 15 (NPS Feedback)
owns the submission endpoint; this task just navigates there.

The detail response includes the user's NPS state:

| Field                  | Description                                    |
|------------------------|------------------------------------------------|
| `nps.has_submitted`    | Boolean                                        |
| `nps.rating`           | 1-5 (if submitted)                            |
| `nps.submitted_at`     | Timestamp                                       |

## Database

Schema for NPS is owned by SCREEN 15.

## Edge Cases

- **The user submitted NPS but the screen still shows the old state**: a small refetch on screen focus updates the state.
- **Multiple resolutions on the same report** (per `04-timeline-resolved.md`): the user can NPS each resolution attempt.

## Privacy / LGPD

NPS submissions are personally identifying (the user's rating + identity), but the public surfaces show only aggregated statistics. Per-citizen ratings are visible only to the prefecture and moderators.

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `detail_ticket.avaliar_pressed`    | User tapped Avaliar                        | `was_previously_submitted: bool`     |
| `detail_ticket.share_pressed`      | User tapped Compartilhar                   | `is_resolved: true`                   |

## Tests

- **Unit**: button state per NPS submission state; visitor vs owner; offline navigation works.
- **Integration**: Avaliar press navigates to SCREEN 15 with the report ID.
- **A11y**: state announcements verified.

## Definition of Done

- [ ] BottomCtaBar component
- [ ] State-based Avaliar button (default, after-rated)
- [ ] Compartilhar reuses the shared share service
- [ ] Navigation to SCREEN 15
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references
- React Native Haptics: https://docs.expo.dev/versions/latest/sdk/haptics/

### Project context
- Render UI base: `01-render-detail-ticket-ui-base.md`
- Share action (shared): `07-civic-feed/07-compartilhar-action.md`
- NPS Feedback (destination): `docs/tasks/15-nps-feedback/`
- `CLAUDE.md`

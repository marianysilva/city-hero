# Heroes League · Bottom bar (Skip + Share & build league)

> **Type:** Screen feature · UI + navigation
> **Screen:** SCREEN 12 · Heroes League
> **Effort:** S (≤1 day)
> **Dependencies:** `12-heroes-league/01-render-league-ui-base.md`, `12-heroes-league/05-share-channels.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ux`

## Context

The sticky bottom bar with two buttons:

- **"Pular"** (secondary, slate-100 background) — navigates to the
  report's Detail · Em andamento screen without sharing.
- **"🚀 Compartilhar & formar liga"** (primary, violet→orange gradient,
  flex-1) — opens the OS share sheet with the suggested message and
  universal link, then navigates to the detail screen.

Two distinct paths, both honored. The primary is visually dominant
because sharing is the screen's growth goal, but "Pular" is real and
clearly tappable — no dark patterns.

## User Story

**As a** Citizen who just submitted,
**I want** to either share the report or skip and check its status,
**In order to** stay in control of what I do next.

## Acceptance Criteria

### Scenario · Default render

**Given** the user is on the screen
**When** the bottom bar renders
**Then** the bar is sticky at the bottom and respects the bottom safe area inset
**And** a "Pular" button appears on the left in slate-100 background
**And** a "🚀 Compartilhar & formar liga" button takes the remaining width with the violet→orange gradient
**And** both buttons have clear touch targets (≥48dp height)

### Scenario · Tap "Pular"

**Given** the user taps Pular
**When** the action runs
**Then** light haptic feedback fires
**And** the app navigates to SCREEN 13 (Detalhe · Em andamento) with the new report's ID
**And** the navigation stack is reset to `[Home, DetailEmAndamento]` so back goes to Home
**And** no share action is performed

### Scenario · Tap "🚀 Compartilhar & formar liga"

**Given** the user taps the primary CTA
**When** the action runs
**Then** medium haptic feedback fires
**And** the OS share sheet opens with the configured message (task 06) + universal link
**And** when the share sheet closes (success or cancel), the app navigates to SCREEN 13
**And** the navigation stack is reset as above

### Scenario · Share sheet canceled

**Given** the user opened the share sheet and canceled
**When** the cancel returns
**Then** the app still navigates to SCREEN 13 (consistent end state)
**And** no share is recorded; no achievement progress

### Scenario · Share sheet completed

**Given** the user picked a target and completed the share
**When** the share returns
**Then** the achievement progress is updated optimistically (per task 07)
**And** the app navigates to SCREEN 13
**And** the achievement card on subsequent screens reflects the new state

### Scenario · Primary CTA disabled during share-in-progress

**Given** the user tapped the primary CTA
**When** the share sheet is in the process of opening
**Then** the button shows a brief in-flight state to prevent double-taps
**And** rapid double-taps are debounced

### Scenario · Stack reset semantics

**Given** the navigation reset runs
**When** the destination opens
**Then** the back-stack is `[Home, DetailEmAndamento(reportId)]`
**And** the user pressing back returns to Home
**And** the original capture/confirm/league screens are not reachable via back

### Scenario · Achievement update path

**Given** the user shared from the primary CTA
**When** the share completes
**Then** task 07's hook updates the achievement state
**And** if the share resulted in a credited install (later), the user receives a separate notification

### Scenario · Localization

**Given** the user's language is en-US
**When** the bar renders
**Then** "Pular" is "Skip" and "Compartilhar & formar liga" is "Share & build league"

### Scenario · Accessibility

**Given** screen reader is on
**When** the user navigates the bar
**Then** "Pular" is labeled with its action ("Skip and go to report tracking")
**And** the primary CTA is labeled clearly ("Share report and go to tracking")
**And** both buttons meet contrast requirements

## Frontend (React Native)

### Where it lives

```
apps/mobile/src/screens/HeroesLeague/
└── components/
    └── BottomBar.tsx
```

### Component behavior

- `BottomBar` is presentational with two callbacks: `onSkip` and `onShareAndContinue`.
- The screen owns the orchestration: navigation reset on both paths; share orchestration on the primary.
- The share path calls the shared `shareReport` service (used by task 05) with the screen's selected message; on completion (or cancellation), navigation runs.

### Animation

- Both buttons have a subtle scale-down on press.
- The primary CTA's gradient stays static; an in-flight overlay shows the spinner state.

## Backend

Not applicable to this task; the destination screen makes its own backend calls.

## Database

Not applicable.

## Edge Cases

- **User taps the primary CTA but doesn't actually share**: the navigation still happens; this is intentional (consistent end state).
- **User shares multiple times before navigating away** (e.g., via tasks 05's channels): the bottom bar is unaffected; navigation only happens when the user taps Pular or the primary CTA.
- **Achievement card already unlocked** (3+ friends already credited): the primary CTA's label can subtly change ("Compartilhar de novo") to signal there's no progression incentive — but this is optional polish.

## Privacy / LGPD

Not applicable.

## Analytics

| Event                          | When                                       | Props                                |
|--------------------------------|--------------------------------------------|---------------------------------------|
| `league.skip_pressed`          | User taps Pular                            | —                                     |
| `league.share_cta_pressed`     | User taps primary CTA                      | —                                     |
| `league.share_cta_completed`   | Share sheet returned                       | `completed: bool`                     |

## Tests

- **Unit**: both buttons render; callbacks fire; debounce on primary; correct labels and accessibility.
- **Integration**: skip resets navigation correctly; share-and-continue chains share orchestration + navigation.
- **E2E**: each path lands the user on Detail · Em andamento; back returns to Home.

## Definition of Done

- [ ] BottomBar component
- [ ] Skip path with navigation reset
- [ ] Share-and-continue orchestration
- [ ] Debounce on primary
- [ ] Localized labels
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Coding: `docs/engineering/coding-standards.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references
- React Navigation `reset`: https://reactnavigation.org/docs/navigation-actions#reset
- React Native Haptics: https://docs.expo.dev/versions/latest/sdk/haptics/

### Project context
- Render UI base: `01-render-league-ui-base.md`
- Share channels (consumed): `05-share-channels.md`
- Suggested message (consumed): `06-message-template.md`
- Achievement progress (updated): `07-formador-liga-achievement.md`
- Detalhe · Em andamento (destination): `docs/tasks/13-detail-in-progress/`
- `CLAUDE.md`

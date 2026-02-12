# Detail · Merged · Bottom CTA + navigation

> **Type:** Screen feature · UI + navigation
> **Screen:** SCREEN 17 · Detail · Merged Report
> **Effort:** S (≤1 day)
> **Dependencies:** `17-detail-merged/01-render-merged-ui-base.md`, `17-detail-merged/03-comparison-cards.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ux`

## Context

The sticky bottom CTA bar with a single primary action: "Ver ticket
principal →". Tapping it navigates the user to the parent ticket's
detail (SCREEN 13 if open, SCREEN 14 if resolved). The button uses an
amber gradient that matches the merge banner (task 02) — a deliberate
visual connection between "what happened" and "where to go next".

## User Story

**As a** Citizen who saw their report was merged,
**I want** a clear path to the parent ticket,
**In order to** follow the resolution there.

## Acceptance Criteria

### Scenario · Default render

**Given** the user is on the screen
**When** the CTA bar renders
**Then** a sticky bar appears at the bottom
**And** a single full-width button "Ver ticket principal →" with an amber gradient is shown
**And** the bar respects the bottom safe area inset

### Scenario · Tap CTA

**Given** the CTA is rendered
**When** the user taps it
**Then** medium haptic feedback fires
**And** the app navigates to the parent ticket's detail (SCREEN 13 if open, SCREEN 14 if resolved)
**And** the navigation push preserves the back stack (back returns here)

### Scenario · Parent state-aware destination

**Given** the parent ticket has a specific state
**When** the navigation runs
**Then** the destination matches: `open`/`in_progress` → SCREEN 13; `resolved` → SCREEN 14
**And** for unexpected states, the user lands on SCREEN 13 as a safe default

### Scenario · Parent deleted

**Given** the parent ticket was deleted (rare edge case after merge)
**When** the user taps the CTA
**Then** a soft sheet explains "Esse ticket não existe mais" and offers to navigate back

### Scenario · Loading state

**Given** the parent's data isn't yet loaded (race condition)
**When** the user taps
**Then** a brief loading indicator overlays the button
**And** the navigation completes once data is ready

### Scenario · Offline

**Given** the device is offline
**When** the user taps the CTA
**Then** navigation still proceeds; the destination screen handles offline state per its own logic (`13-detail-in-progress/01` covers this)

### Scenario · Real-time parent state change

**Given** the parent's state changes while the user is on this screen (e.g., resolved via WebSocket)
**When** the user then taps the CTA
**Then** the navigation targets the new state's detail screen (SCREEN 14 now instead of 13)
**And** the comparison card (task 03) also reflects the new state

### Scenario · Accessibility

**Given** screen reader is on
**When** the user focuses the CTA
**Then** it's labeled with the destination ("View main ticket")
**And** activating it announces the navigation

## Frontend (React Native)

### Where it lives

```
apps/mobile/src/screens/DetailMerged/
└── components/
    └── BottomCtaNavigate.tsx
```

### Component behavior

- The component receives the parent ticket's ID and current state.
- Tap callback navigates based on state, using a small router helper (`navigateToReportDetail(reportId, state)`).
- The router helper is shared with the parent card from task 03 (same destinations).

### Animation

The button has a subtle scale-down on press; the navigation uses the standard stack animation.

## Backend

Not applicable to this task.

## Database

Not applicable.

## Edge Cases

- **Parent's state ambiguous in cache**: refetch the parent summary before navigating; if still unclear, fall back to SCREEN 13.
- **Double-taps**: debounced.

## Privacy / LGPD

Not applicable.

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `detail_merged.cta_pressed`        | User tapped the CTA                        | `parent_state`, `target_screen: 13|14` |
| `detail_merged.parent_deleted_blocked` | CTA blocked because parent missing     | —                                     |

## Tests

- **Unit**: navigation routing per parent state; debounce; parent-deleted edge case.
- **Integration**: navigation lands on the right detail screen.
- **A11y**: button labeled with destination.

## Definition of Done

- [ ] BottomCtaNavigate component
- [ ] State-aware navigation routing
- [ ] Parent-deleted handling
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Coding: `docs/engineering/coding-standards.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references
- React Navigation: https://reactnavigation.org/

### Project context
- Render UI base: `01-render-merged-ui-base.md`
- Parent ticket card (shared routing): `03-comparison-cards.md`
- Detail destinations: `docs/tasks/13-detail-in-progress/`, `docs/tasks/14-detail-ticket/`
- `CLAUDE.md`

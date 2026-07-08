# Anonymous Send · Bottom CTA

> **Type:** Screen feature · UI + navigation
> **Screen:** SCREEN 11 · Anonymous Send
> **Effort:** S (≤1 day)
> **Dependencies:** `11-anonymous-send/01-render-anonymous-ui-base.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ux`

## Context

The sticky bottom CTA bar with a single primary action: "Acompanhar
reporte →". Tapping it navigates the user to the Detail · Em andamento
screen (SCREEN 13) for their newly created report. The button uses a
violet→indigo gradient that ties back to the hero's color scheme, and
sits in a small bar with subtle elevation.

Unlike Liga de Heróis (which has a "Pular" secondary), this screen has
only the primary CTA — the share UX (task 05) and reversibility
(task 06) are already in the scroll area.

## User Story

**As an** anonymous Citizen,
**I want** a clear next step that takes me to track my report,
**In order to** see updates from the prefecture.

## Acceptance Criteria

### Scenario · Default render

**Given** the user is on the screen
**When** the bottom CTA bar renders
**Then** a sticky bar appears at the bottom of the screen
**And** a single full-width button "Acompanhar reporte →" is shown with a violet→indigo gradient
**And** the bar respects the bottom safe area inset

### Scenario · Tap CTA

**Given** the CTA is rendered
**When** the user taps it
**Then** medium haptic feedback fires
**And** the app navigates to SCREEN 13 (Detalhe · Em andamento) with the new report's ID
**And** the previous screens (camera, confirm, anonymous send) are removed from the navigation stack so back-navigation goes to Home

### Scenario · Stack reset behavior

**Given** the navigation runs
**When** the destination opens
**Then** the back-stack is reset to `[Home, DetailEmAndamento]`
**And** the user can press back once to return to Home
**And** the original capture/confirm/anonymous-send screens are not reachable via back

### Scenario · Loading state

**Given** the report's detail isn't cached yet
**When** the user taps the CTA
**Then** a brief loading indicator overlays the button
**And** the navigation completes once the detail screen is ready to render

### Scenario · Backend not ready

**Given** the report was submitted but not yet confirmed by the backend (offline path)
**When** the user taps the CTA
**Then** navigation proceeds; the detail screen handles the "pending sync" state
**And** the user sees their report optimistically with a "pending" indicator

### Scenario · Accessibility

**Given** screen reader is on
**When** the user focuses the CTA
**Then** it's announced as "Track report, button"
**And** activating it announces the destination

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/AnonymousSend/
└── components/
    └── BottomCtaBar.tsx
```

### Component behavior

- The component receives the report's ID and renders the styled button.
- The tap callback resets the navigation stack to `[Home, DetailEmAndamento(reportId)]`.
- The visual style uses the violet→indigo gradient from the design tokens.

### Animation

The button has a subtle scale-down on press; the navigation transition uses the standard stack animation.

## Backend

Not applicable to this task; the destination screen makes its own backend calls.

## Database

Not applicable.

## Edge Cases

- **User backgrounds the app during the navigation transition**: the transition completes on return; no extra animation.
- **Detail screen errors on initial fetch**: it shows an error state with retry; the navigation still completed.

## Privacy / LGPD

Not applicable.

## Analytics

| Event                        | When              | Props       |
| ---------------------------- | ----------------- | ----------- |
| `anonymous_send.cta_pressed` | User taps the CTA | `report_id` |

## Tests

- **Unit**: button renders; tap fires callback; stack reset uses correct parameters.
- **Integration**: navigation lands on Detail · Em andamento with the report's ID.
- **E2E**: complete the flow → land on detail → back returns to Home.

## Definition of Done

- [ ] BottomCtaBar component
- [ ] Navigation stack reset
- [ ] Loading state during transition
- [ ] Telemetry event
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

- Render UI base: `01-render-anonymous-ui-base.md`
- Detalhe · Em andamento (destination): `docs/tasks/13-detail-in-progress/`
- `CLAUDE.md`

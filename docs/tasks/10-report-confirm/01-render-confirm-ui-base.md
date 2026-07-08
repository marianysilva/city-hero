# Report Confirmation · Render UI base

> **Type:** Screen feature · UI
> **Screen:** SCREEN 10 · Report Confirmation
> **Effort:** S (≤1 day)
> **Dependencies:** `00-foundation/02-design-tokens.md`, `00-foundation/04-status-bar-component.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ui`

## Context

The base layout: header with back button and title ("Revisar reporte"),
a fixed photo preview at the top, a scrollable middle for the form
fields (filled by tasks 02–07), and a sticky CTA bar at the bottom with
the XP preview line and the "Enviar reporte →" button.

This task does not implement individual form fields, the submit, or the
bifurcation — only the layout and slot system the other tasks fill.

## User Story

**As a** Citizen reviewing my report,
**I want** a clean, focused screen,
**In order to** make any tweaks quickly and send with confidence.

## Acceptance Criteria

### Scenario · Default render

**Given** the user arrived from the camera or manual report screen
**When** the confirmation screen renders
**Then** the status bar variant is `dark`
**And** the header shows a back button on the left and the title "Revisar reporte" in extrabold
**And** the photo preview slot is reserved at the top (filled by task 02; or hidden when no photo)
**And** below the photo, a scrollable area holds the form field slots in order: category, severity, location, comment, identification
**And** a sticky CTA bar at the bottom holds the XP preview line and the primary action button

### Scenario · Sticky CTA respects safe area

**Given** the device has a home indicator (iOS) or system gesture area
**When** the CTA renders
**Then** it includes the bottom safe area inset as padding
**And** the form content has bottom padding so it doesn't sit underneath the CTA

### Scenario · Scrollable form with sticky photo

**Given** the user scrolls the form
**When** scrolling down
**Then** the photo preview remains fixed at the top
**And** the form fields scroll independently
**And** the CTA stays pinned at the bottom

### Scenario · No-photo variant

**Given** the user arrived without a photo (manual report after permission denied)
**When** the screen renders
**Then** the photo preview slot is removed; the form starts where the photo would have been
**And** the layout reflows cleanly

### Scenario · Back navigation

**Given** the user taps the back button
**When** the action runs
**Then** the screen closes and returns the user to the previous screen (camera or manual report)
**And** state for the form fields is preserved if they return again later in the same session

### Scenario · Theming

**Given** the system is in dark mode
**When** the screen renders
**Then** the background uses the dark theme's neutral surface
**And** the photo preview's overlays remain readable
**And** the CTA's brand gradient is unchanged

### Scenario · Accessibility

**Given** screen reader is on
**When** the user navigates the screen
**Then** the title is announced as a heading
**And** form fields are read in logical order
**And** the CTA is clearly labeled with its action

## Frontend (React Native)

### Component location

```
apps/city-hero/src/screens/ReportConfirm/
├── ReportConfirmScreen.tsx
├── ReportConfirmScreen.styles.ts
├── ReportConfirmScreen.test.tsx
└── components/
    ├── ConfirmHeader.tsx
    └── SendCta.tsx
```

### Component behavior

- `ReportConfirmScreen` composes the header, photo slot, scrollable form area, and the sticky CTA bar.
- `ConfirmHeader` is presentational with a `onBack` callback.
- `SendCta` is presentational with `enabled`, `xpPreview`, `medalPreview` props and an `onSend` callback.
- The screen reads the payload (from the navigation params or in-memory bridge store) and renders fields accordingly.

### Slot system

The screen exposes named slots for tasks 02–07: `photo`, `category`, `severity`, `location`, `description`, `identification`, `xp-preview`. Tasks plug their components into the right slot.

### CTA state

The CTA is enabled when all required fields are valid:

- Category present.
- Location present.
- Identification choice made (or default applied — see task 06).
- Photo (if from camera path) anonymization in a state that allows sending.

Until valid, the CTA is disabled with a low-opacity look.

## Backend

Not applicable for this task.

## Database

Not applicable directly.

## Edge Cases

- **Form longer than the viewport with keyboard open**: the form auto-scrolls so the focused field stays visible.
- **CTA tap while the photo is still anonymizing**: handled by task 02 / 08 — the send action waits or shows a clear state.
- **Back navigation with unsaved progress**: the session preserves the state; the user doesn't lose work.

## Privacy / LGPD

Not applicable to this task; subsequent tasks handle photo, anonymization, and personal-identity handling.

## Analytics

| Event                          | When                                       | Props                                |
|--------------------------------|--------------------------------------------|---------------------------------------|
| `report_confirm.viewed`        | Screen mounts                              | `entry: camera|manual|no_photo`      |
| `report_confirm.back_pressed`  | User taps back                             | `had_progress: bool`                  |

## Tests

- **Unit**: renders all slots correctly; sticky photo and CTA; CTA enable/disable logic.
- **Snapshot**: light + dark; with/without photo.
- **A11y**: title is heading; CTA labeled; reading order correct.

## Definition of Done

- [ ] ReportConfirmScreen base layout
- [ ] ConfirmHeader, SendCta components
- [ ] Slot system for tasks 02–07
- [ ] Sticky photo and CTA
- [ ] CTA enable/disable logic
- [ ] Light + dark themes
- [ ] Accessibility verified
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Coding: `docs/engineering/coding-standards.md`
- Architecture (component patterns): `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references
- React Native KeyboardAvoidingView: https://reactnative.dev/docs/keyboardavoidingview
- React Native Safe Area Context: https://github.com/th3rdwave/react-native-safe-area-context

### Project context
- Prototype: `design/index.html` (search `title: 'Confirmação do Reporte'`)
- Camera capture: `08-camera-live/04-capture-shutter.md`
- Manual report submit: `09-manual-report/06-submit-and-continue.md`
- `CLAUDE.md`

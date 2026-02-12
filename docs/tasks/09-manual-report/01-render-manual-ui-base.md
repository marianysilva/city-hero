# Manual Report · Render UI base

> **Type:** Screen feature · UI
> **Screen:** SCREEN 09 · Manual Report
> **Effort:** S (≤1 day)
> **Dependencies:** `00-foundation/02-design-tokens.md`, `00-foundation/04-status-bar-component.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ui`

## Context

The base layout of the manual report screen: header with back button and
title ("Vamos juntos"); a soft amber uncertainty banner explaining the
AI's hesitation; placeholders for the photo thumbnail, category grid,
and mini-map (filled by tasks 02–04); and a sticky "Continuar →" CTA
at the bottom with a footer line crediting the user for training the
model.

This task does not implement category selection, photo swap, map drag,
or submit logic — those live in tasks 02–06.

## User Story

**As a** Citizen falling back from the camera,
**I want** a friendly, clear manual flow,
**In order to** finish reporting without feeling I failed at the AI step.

## Acceptance Criteria

### Scenario · Default render

**Given** the user arrives from the camera screen
**When** the manual screen renders
**Then** the status bar variant is `dark`
**And** the header shows a back button on the left, the title "Vamos juntos" in extrabold, and the kicker "A IA ficou em dúvida. Escolha a categoria"
**And** below the header, the soft amber banner appears with a 🤖 icon and an explanation ("Confiança baixa · 42%" if AI was attempted; "Sem foto da câmera" if entered from a permission-denied state)
**And** placeholders are reserved for the photo (left thumbnail), category grid (3×3), and mini-map
**And** a sticky CTA "Continuar →" sits at the bottom with the footer line below it

### Scenario · Banner variants

**Given** the user arrived from the camera with a low-confidence detection
**When** the banner renders
**Then** it shows the confidence percentage and the AI-uncertainty explanation
**And** if the user arrived without a photo (permission denied / no hardware), the banner shows a different message ("Reportando sem foto · isso é ok")
**And** if the user explicitly opted out of the camera, the banner says "Você escolheu reportar manualmente"

### Scenario · Footer message

**Given** the screen renders
**When** the footer text appears below the CTA
**Then** it reads: "🤖 A IA aprende com cada reporte manual. Obrigada!"
**And** it uses a small, friendly tone and is non-blocking

### Scenario · Back navigation

**Given** the user taps the back button
**When** the action runs
**Then** the screen closes
**And** the user returns to the previous screen (the camera, with any state preserved, or Home if they came from Home)

### Scenario · Sticky CTA over scroll

**Given** the user scrolls the content area
**When** scrolling
**Then** the CTA remains pinned at the bottom
**And** the content respects the bottom padding so it doesn't get hidden under the CTA

### Scenario · Theming

**Given** the system is in dark mode
**When** the screen renders
**Then** the background uses the dark theme's neutral surface
**And** the banner uses a tonal amber variant readable on dark

### Scenario · Accessibility

**Given** screen reader is on
**When** the user navigates the screen
**Then** the title is announced as a heading
**And** the uncertainty banner is announced as a live region
**And** the CTA is clearly labeled with its action

## Frontend (React Native)

### Component location

```
apps/mobile/src/screens/ManualReport/
├── ManualReportScreen.tsx
├── ManualReportScreen.styles.ts
├── ManualReportScreen.test.tsx
└── components/
    ├── ManualHeader.tsx
    ├── UncertaintyBanner.tsx
    └── ContinueCta.tsx
```

### Component behavior

- `ManualReportScreen` composes the header, banner, slots for the other sub-tasks (photo, category, map), and the sticky CTA.
- `ManualHeader` receives the back callback.
- `UncertaintyBanner` accepts a variant prop (`low_confidence` / `no_photo` / `user_opted_out`) and a confidence number when applicable.
- `ContinueCta` reads from a screen-scoped state to enable/disable based on whether required fields are present (category + location). Initially disabled.

### Slot system

The screen exposes named slots for tasks 02, 03, 04: `category-grid`, `photo-thumb`, `mini-map`. Tasks plug in their components.

## Backend

Not applicable for this task.

## Database

Not applicable directly.

## Edge Cases

- **No payload from the camera** (e.g., entered directly via deep link, hypothetical): the screen still works — the user must add a photo (task 03 path) or proceed without one.
- **Banner variant unknown**: fall back to a generic "Vamos lá" message.
- **Sticky CTA on devices with home indicator**: respect the safe area bottom inset.

## Privacy / LGPD

Not applicable to this task; subsequent tasks handle the photo and location data per LGPD.

## Analytics

| Event                          | When                                       | Props                                |
|--------------------------------|--------------------------------------------|---------------------------------------|
| `manual_report.viewed`         | Screen mounts                              | `entry: low_confidence|no_photo|user_opted_out` |
| `manual_report.back_pressed`   | User taps back                             | `had_progress: bool`                  |

## Tests

- **Unit**: renders all parts; banner variant renders correctly; back fires callback; CTA disabled until required state present.
- **Snapshot**: light + dark; each banner variant.
- **A11y**: title is heading; banner is a live region; CTA labeled.

## Definition of Done

- [ ] ManualReportScreen base layout
- [ ] ManualHeader, UncertaintyBanner, ContinueCta
- [ ] Slots for tasks 02–04
- [ ] Sticky CTA respects safe area
- [ ] Light + dark themes
- [ ] Accessibility verified
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Coding: `docs/engineering/coding-standards.md`
- Architecture (component patterns): `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references
- React Native Safe Area Context: https://github.com/th3rdwave/react-native-safe-area-context

### Project context
- Prototype: `design/index.html` (search `title: 'Reporte Manual'`)
- Camera fallback path: `08-camera-live/08-fallback-to-manual.md`
- `CLAUDE.md`

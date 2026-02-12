# Onboarding · Camera AI · Render UI

> **Type:** Screen feature · UI
> **Screen:** SCREEN 03 · Onboarding · AI Camera
> **Effort:** S (≤1 day)
> **Dependencies:** `00-foundation/02-design-tokens.md`, `00-foundation/04-status-bar-component.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ui`

## Context

The visual rendering of the first onboarding tutorial step (second
overall step after city selection). A hero illustration — stylized
scene with a pothole, AR-style detection brackets, a "BURACO · 94%"
label, and a small camera UI overlay (mode chip "IA ATIVA", GPS chip,
shutter button) — followed by title, subtitle, pagination dots, and a
"Próximo →" CTA. A back button and the step indicator ("Passo 2 de 5")
sit at the top of the screen.

> Onboarding has **no Skip path** — understanding how the app works on
> first launch is essential, so all 5 steps (city select + AI camera +
> gamification + community pact + neighborhood) must be completed
> sequentially. The user
> can go back to revisit a step, but never skip ahead.

This task focuses on layout and styling only. The animations of the
detection brackets and a reduced-motion alternative are covered by task 03.

## User Story

**As a** Citizen completing onboarding,
**I want** a clear and exciting demo of the AI camera,
**In order to** understand what makes this app different.

## Acceptance Criteria

### Scenario · Default render

**Given** the screen is the active onboarding step
**When** it renders
**Then** the status bar variant is `dark` (light background)
**And** a back button sits at the top-left and the step indicator "Passo 2 de 5" at the top-right
**And** the hero illustration card is centered, with rounded corners and a soft shadow
**And** the illustration depicts a pothole-on-road scene with detection brackets and a "BURACO · 94%" label
**And** below the illustration: a 📸 emoji, the title "Aponte. A IA reconhece.", and a short subtitle explaining the AI's role

### Scenario · Pagination dots

**Given** this is the second onboarding step (out of four)
**When** the screen renders
**Then** four pagination dots appear at the bottom-left
**And** the second dot is wider/colored (active)
**And** the others are small/neutral

### Scenario · Back button

**Given** the screen is rendered
**When** the user taps the back button
**Then** the action delegates to the onboarding state machine, which goes back to step 1 (City Select)

### Scenario · Next button

**Given** the screen is rendered
**When** the user taps "Próximo →"
**Then** the action delegates to the onboarding state machine, which advances to step 3 (Gamification)

### Scenario · Long copy / small device

**Given** a smaller device (e.g., iPhone SE)
**When** the screen renders
**Then** content reflows so the illustration shrinks proportionally and the title/subtitle remain legible
**And** the CTA stays visible without overlapping content

### Scenario · Accessibility

**Given** screen reader is on
**When** the user navigates the screen
**Then** the title is announced as a heading
**And** the illustration has a meaningful description ("Foto de rua com câmera detectando um buraco")
**And** the back and Next buttons are clearly labeled
**And** the pagination dots and the step indicator are both announced as "Step 2 of 5"

## Frontend (React Native)

### Component location

```
apps/mobile/src/screens/Onboarding/CameraAI/
├── CameraAIScreen.tsx
├── CameraAIScreen.styles.ts
├── CameraAIScreen.test.tsx
└── components/
    └── HeroIllustration.tsx
```

`PaginationDots` and `StepIndicator` are shared molecules in the
design system (`docs/engineering/component-inventory.md` · Molecules).
The screen consumes them; no local copies.

### Component behavior

- The screen is presentational: receives no data props, just navigation callbacks (`onBack`, `onNext`) provided by the onboarding state machine.
- `HeroIllustration` renders the layered scene (sky + ground + road + pothole + brackets + label + camera UI overlay). It accepts a `reducedMotion` prop (used by task 03) to skip animation.
- `PaginationDots` is consumed with `total=4` and `activeIndex=1`.
- `StepIndicator` is consumed with `{ step: 2, total: 5 }`.

### Animation (default)

The detection brackets pulse slightly, and the cyan label drops in from above with a small spring. This is the default behavior; the reduced-motion variant (task 03) skips these animations.

### Theming

The screen background uses a `brand.50 → white` vertical gradient. Dark mode swaps to a darker tonal equivalent, but the illustration's colors remain (the scene reads correctly on dark backgrounds too).

## Backend

Not applicable.

## Database

Not applicable.

## Edge Cases

- **Very short device (landscape on a phone with notch)**: app is portrait-only, ignore.
- **Custom font not loaded**: fallback to system sans-serif while loading.
- **Illustration SVG fails**: show a static fallback illustration (PNG bundled).
- **User taps Next before animation finishes**: the action is not blocked; navigation runs immediately.

## Privacy / LGPD

Not applicable (no data collected).

## Analytics

| Event                                | When                       | Props |
|--------------------------------------|----------------------------|-------|
| `onboarding.camera_ai.viewed`        | Screen mounts              | —     |
| `onboarding.camera_ai.back_pressed`  | User taps back             | —     |
| `onboarding.camera_ai.next_pressed`  | User taps Next             | —     |

(Back and Next aren't owned by this UI task — they delegate. Telemetry can fire from either layer; the state machine task owns the canonical event.)

## Tests

- **Unit**: renders all parts; pagination dots have correct active state; callbacks fire on Back/Next tap.
- **Snapshot**: light + dark.
- **A11y**: hero illustration has alt text; buttons labeled; reading order correct.

## Definition of Done

- [ ] CameraAIScreen layout matching the prototype
- [ ] HeroIllustration component (animated by default; reduced-motion-friendly via prop)
- [ ] PaginationDots reusable component
- [ ] Light + dark themes
- [ ] Accessibility verified
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Coding: `docs/engineering/coding-standards.md`
- Architecture (component patterns): `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references
- React Native SVG: https://github.com/software-mansion/react-native-svg
- React Native Reanimated: https://docs.swmansion.com/react-native-reanimated/

### Project context
- Prototype: `design/index.html` (search `title: 'Onboarding · Câmera IA'`)
- Design tokens: `00-foundation/02-design-tokens.md`
- Onboarding state machine: `02-onboarding-step-machine.md`
- Reduced-motion variant: `03-reduced-motion-illustration.md`
- `CLAUDE.md`

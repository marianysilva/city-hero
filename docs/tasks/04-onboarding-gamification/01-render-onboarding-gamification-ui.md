# Onboarding · Gamification · Render UI

> **Type:** Screen feature · UI\
> **Screen:** SCREEN 04 · Onboarding · Gamification\
> **Effort:** S (≤1 day)\
> **Dependencies:** `00-foundation/02-design-tokens.md`, `00-foundation/04-status-bar-component.md`,
> `03-onboarding-camera/02-onboarding-step-machine.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `frontend`, `screen`, `ui`

## Context

The visual rendering of the third onboarding step (step 3 of 5). A large badge illustration (with
subtle shine animation), the level progression (Cidadão → Vigilante → Guardião), and a small XP
progress bar to hint at the loop. Title and short subtitle make the promise; the top of the screen
carries a back button and the step indicator ("Passo 3 de 5"); pagination dots and a "Próximo →" CTA
drive forward navigation.

> Onboarding has **no Skip path** (see `03-onboarding-camera/02-onboarding-step-machine.md`).

This task focuses on layout and styling. Animations have a reduced-motion variant covered by
task 02.

## User Story

**As a** Citizen completing onboarding,\
**I want** a clear preview of the gamification system,\
**In order to** understand why my actions matter and what I can earn.

## Acceptance Criteria

### Scenario · Default render

**Given** the screen is the active onboarding step\
**When** it renders\
**Then** the status bar variant is `dark`\
**And** a back button sits at the top-left and the step indicator "Passo 3 de 5" at the top-right\
**And** a hero illustration centered shows a badge ("Guardião do Bairro" or similar) with a subtle
shine effect by default\
**And** below the badge, three small icons or pills represent the levels (Cidadão / Vigilante /
Guardião) with visual differentiation (size, color saturation, glow)\
**And** an XP progress bar appears with a partial fill (~20%) and a small "+50 XP por reporte"
caption\
**And** title and short subtitle reinforce the message ("A cidade reconhece quem cuida dela.")

### Scenario · Pagination dots

**Given** this is step 3 of 5\
**When** the screen renders\
**Then** the third dot is the active (wider/colored) one\
**And** the others are small/neutral

### Scenario · Back and Next buttons

**Given** the screen is rendered\
**When** the user taps back or "Próximo →"\
**Then** the action delegates to the shared onboarding state machine\
**And** Back returns to step 2 (Camera AI)\
**And** Next advances to step 4 (Community Pact)

### Scenario · Long copy / small device

**Given** a smaller device\
**When** the screen renders\
**Then** illustration scales down proportionally\
**And** title/subtitle stay legible\
**And** CTAs remain visible

### Scenario · Accessibility

**Given** screen reader is on\
**When** the user navigates the screen\
**Then** the badge has a meaningful description ("Medalha de Guardião do Bairro")\
**And** the level pills are announced as a sequence ("Levels: Cidadão, Vigilante, Guardião")\
**And** the XP bar is announced as "Experience progress, 20%"\
**And** back and Next buttons are clearly labeled

## Frontend (React Native)

### Component location

```
apps/city-hero/src/screens/Onboarding/Gamification/
├── GamificationScreen.tsx
├── GamificationScreen.styles.ts
├── GamificationScreen.test.tsx
└── components/
    ├── BadgeIllustration.tsx
    ├── LevelPills.tsx
    └── XpProgressBar.tsx
```

### Component behavior

- The screen is presentational, with `onBack` / `onNext` callbacks coming from `useOnboardingNav`.
- `StepIndicator` (shared molecule) is consumed with `{ step: 3, total: 5 }`. `PaginationDots`
  (shared) with `total=5, activeIndex=2`.
- `BadgeIllustration` accepts a `reducedMotion` prop for task 02. By default, it animates a subtle
  shine sweep across the badge's surface.
- `LevelPills` is a horizontal layout of three pills, each labeled and styled to suggest
  progression.
- `XpProgressBar` is a reusable component (also used elsewhere, e.g., Profile screen).

### Animation (default)

- Badge: a soft shine sweep loops every ~3s.
- XP bar: fills from 0 to its target (20%) on mount with a smooth ease-out curve.
- Level pills: a subtle scale-in on mount, staggered (left to right).

### Theming

The screen background uses a subtle gradient tonally consistent with the rest of the onboarding
triplet. Dark mode swaps to a darker tonal equivalent.

## Backend

Not applicable.

## Database

Not applicable.

## Edge Cases

- **Custom font not loaded**: fallback to system sans-serif while loading.
- **Badge SVG fails**: fallback to a static raster.
- **Tapping Next before animation finishes**: navigation runs immediately; animation can be
  canceled.

## Privacy / LGPD

Not applicable.

## Analytics

| Event                                  | When           | Props |
| -------------------------------------- | -------------- | ----- |
| `onboarding.gamification.viewed`       | Screen mounts  | —     |
| `onboarding.gamification.back_pressed` | User taps back | —     |
| `onboarding.gamification.next_pressed` | User taps Next | —     |

(Canonical events are owned by the state machine task; these are surface-level for funnel
breakdown.)

## Tests

- **Unit**: renders all parts; XP bar respects target fill; Back/Next callbacks fire correctly.
- **Snapshot**: light + dark.
- **A11y**: descriptions present; reading order correct.

## Definition of Done

- [ ] Gamification screen layout matching the prototype
- [ ] BadgeIllustration component (animated by default; reduced-motion-friendly via prop)
- [ ] LevelPills component
- [ ] XpProgressBar component (reusable)
- [ ] Light + dark themes
- [ ] Accessibility verified
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Coding: `docs/engineering/coding-standards.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- React Native SVG: https://github.com/software-mansion/react-native-svg
- React Native Reanimated: https://docs.swmansion.com/react-native-reanimated/

### Project context

- Prototype: `design/index.html` (search `title: 'Onboarding · Gamificação'`)
- Onboarding state machine: `03-onboarding-camera/02-onboarding-step-machine.md`
- Reduced-motion variant: `02-reduced-motion-illustration.md`
- `CLAUDE.md`

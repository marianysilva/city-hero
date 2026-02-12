# Onboarding · Camera AI · Reduced-motion variant

> **Type:** Screen feature · Accessibility
> **Screen:** SCREEN 03 · Onboarding · AI Camera
> **Effort:** S (≤1 day)
> **Dependencies:** `03-onboarding-camera/01-render-onboarding-camera-ui.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `accessibility`, `screen`

## Context

The hero illustration animates by default (detection brackets pulse, the
"BURACO · 94%" label drops in). Some users have vestibular disorders or
preferences that make animation uncomfortable or unsafe. A reduced-motion
variant renders a static version of the illustration with the same visual
intent, so the message ("AI recognizes objects") still lands.

## User Story

**As a** Citizen with reduced-motion preferences enabled,
**I want** the onboarding illustration to be static,
**In order to** complete onboarding without discomfort.

## Acceptance Criteria

### Scenario · Reduced motion enabled

**Given** the OS-level reduce-motion preference is on (iOS or Android)
**When** the screen mounts
**Then** the hero illustration renders without animations
**And** the detection brackets are present but static
**And** the cyan label is present in its final position (no entrance animation)
**And** the "IA ATIVA" pulse dot is replaced with a static dot

### Scenario · Reduced motion disabled

**Given** reduce-motion is off
**When** the screen mounts
**Then** the default animations run (brackets pulse, label drops in, IA chip pulses)

### Scenario · Preference changes mid-session

**Given** the user toggles reduce-motion in OS settings
**When** they return to the app
**Then** subsequent screens respect the new preference
**And** an already-mounted onboarding screen does not need to react in real time (it's a one-shot render)

### Scenario · Visual parity in static mode

**Given** the static variant
**When** compared to the animated final state
**Then** the layout, positions, and colors are identical
**And** the only difference is the absence of animation

### Scenario · Accessibility label

**Given** screen reader is on with reduce-motion off
**When** the user navigates to the illustration
**Then** the description states what the illustration depicts ("Foto de rua com câmera detectando um buraco")
**And** the description does not mention animation specifics
**And** the same description applies in reduced-motion mode

## Frontend (React Native)

### Where it lives

The `HeroIllustration` component (from task 01) accepts a `reducedMotion: boolean` prop. The screen reads the OS preference and passes the prop accordingly:

```
apps/mobile/src/screens/Onboarding/CameraAI/
├── components/
│   └── HeroIllustration.tsx     ← accepts reducedMotion prop
└── hooks/
    └── useReducedMotion.ts      ← shared, used by all three onboarding screens
```

### Behavior

- The hook `useReducedMotion` queries the OS preference at mount and returns a boolean.
- When the prop is true, the component:
  - Skips entrance animations entirely (renders in the final state).
  - Replaces continuous pulse animations with static styling.
  - Keeps colors, shapes, and positions identical.
- When the prop is false, animations run as designed in task 01.

### Sharing across onboarding screens

The hook is general-purpose and can be reused by other onboarding screens (Gamification's badge animation; Neighborhood's map preview pulse, etc.).

## Backend

Not applicable.

## Database

Not applicable.

## Edge Cases

- **OS API unsupported on a very old device**: hook defaults to "motion enabled" (no false positives that would over-suppress animations).
- **Custom in-app preference (future)**: an in-app override could be layered on top of the OS preference; not in MVP.
- **Animations that are essential to comprehension**: avoid them entirely. The illustration's message must work in static form.

## Privacy / LGPD

Not applicable.

## Analytics

| Event                                  | When                          | Props                  |
|----------------------------------------|-------------------------------|-------------------------|
| `accessibility.reduced_motion_active`  | Onboarding screen mounts      | `enabled: bool`        |

(The event is fired once per session at the first onboarding screen mount.)

## Tests

- **Unit**: hook returns the OS value; component honors the prop.
- **Snapshot**: static and animated variants both render the same final layout (visual parity).
- **A11y**: simulate reduce-motion ON and OFF; both variants pass the same accessibility checks.

## Definition of Done

- [ ] `useReducedMotion` hook
- [ ] HeroIllustration honors the `reducedMotion` prop
- [ ] Visual parity between static and animated final states
- [ ] Telemetry event fired
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Coding: `docs/engineering/coding-standards.md`
- Architecture (component patterns): `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references
- React Native AccessibilityInfo: https://reactnative.dev/docs/accessibilityinfo#isreducemotionenabled
- WCAG 2.1 — Animation from Interactions: https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html

### Project context
- Render UI: `01-render-onboarding-camera-ui.md`
- `CLAUDE.md`

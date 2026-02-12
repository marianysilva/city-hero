# Onboarding · Neighborhood · Reduced-motion variant

> **Type:** Screen feature · Accessibility
> **Screen:** SCREEN 05 · Onboarding · Your Neighborhood
> **Effort:** S (≤1 day)
> **Dependencies:** `05-onboarding-neighborhood/01-render-onboarding-neighborhood-ui.md`, `03-onboarding-camera/03-reduced-motion-illustration.md` (shared `useReducedMotion` hook)
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `accessibility`, `screen`

## Context

The Neighborhood screen animates by default (you-are-here dot pulses, the
radius circle "breathes", report icons bob). For users with reduced-motion
preferences, those animations are skipped while preserving the
illustration's static composition.

This task reuses the `useReducedMotion` hook shared across onboarding
screens.

## User Story

**As a** Citizen with reduced-motion preferences enabled,
**I want** the Neighborhood onboarding step to be static,
**In order to** continue without discomfort.

## Acceptance Criteria

### Scenario · Reduced motion enabled

**Given** the OS-level reduce-motion preference is on
**When** the screen mounts
**Then** the you-are-here dot is solid (no pulse)
**And** the radius circle is fully rendered without the breathing animation
**And** the nearby report icons are stationary (no bobbing)

### Scenario · Reduced motion disabled

**Given** reduce-motion is off
**When** the screen mounts
**Then** the default animations from task 01 run

### Scenario · Visual parity

**Given** the static variant
**When** compared to the animated final state
**Then** layout, positions, and colors are identical

### Scenario · Accessibility labels unchanged

**Given** the screen reader is on
**When** comparing reduce-motion ON vs OFF
**Then** the descriptions are identical (no animation references)

## Frontend (React Native)

### Where it lives

The `StylizedMapIllustration` and `RadiusCircle` components from task 01 each accept a `reducedMotion: boolean` prop.

The screen calls `useReducedMotion()` and passes the value to both.

### Behavior

- When the prop is true: animations are skipped; final-state styling renders.
- When false: default animations from task 01 play.

## Backend

Not applicable.

## Database

Not applicable.

## Edge Cases

- **OS API unsupported**: defaults to false (animations enabled).
- **Future in-app override**: not in MVP; OS preference is the source of truth.

## Privacy / LGPD

Not applicable.

## Analytics

The shared event `accessibility.reduced_motion_active` from `03-onboarding-camera/03-reduced-motion-illustration.md` covers this; no extra event is needed.

## Tests

- **Unit**: each component honors the `reducedMotion` prop.
- **Snapshot**: visual parity verified.
- **A11y**: reduce-motion ON and OFF both pass accessibility checks.

## Definition of Done

- [ ] Components honor `reducedMotion` prop
- [ ] Visual parity verified
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Coding: `docs/engineering/coding-standards.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references
- React Native AccessibilityInfo: https://reactnative.dev/docs/accessibilityinfo#isreducemotionenabled
- WCAG 2.1 — Animation from Interactions: https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html

### Project context
- Render UI: `01-render-onboarding-neighborhood-ui.md`
- Shared hook: `03-onboarding-camera/03-reduced-motion-illustration.md`
- `CLAUDE.md`

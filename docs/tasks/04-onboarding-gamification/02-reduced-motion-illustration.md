# Onboarding · Gamification · Reduced-motion variant

> **Type:** Screen feature · Accessibility
> **Screen:** SCREEN 04 · Onboarding · Gamification
> **Effort:** S (≤1 day)
> **Dependencies:** `04-onboarding-gamification/01-render-onboarding-gamification-ui.md`, `03-onboarding-camera/03-reduced-motion-illustration.md` (shared `useReducedMotion` hook)
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `accessibility`, `screen`

## Context

The Gamification screen animates by default (badge shine, XP bar fill,
level pill scale-in). For users with reduced-motion preferences, those
animations are unsafe or uncomfortable. This task delivers a static
variant that preserves visual intent without motion.

It reuses the `useReducedMotion` hook shared across onboarding screens
(introduced in `03-onboarding-camera/03-reduced-motion-illustration.md`).

## User Story

**As a** Citizen with reduced-motion preferences enabled,
**I want** the Gamification onboarding step to be static,
**In order to** continue without discomfort.

## Acceptance Criteria

### Scenario · Reduced motion enabled

**Given** the OS-level reduce-motion preference is on
**When** the screen mounts
**Then** the badge illustration renders without the shine sweep
**And** the XP bar appears already at its target fill (no animation)
**And** the level pills appear in their final positions (no stagger animation)

### Scenario · Reduced motion disabled

**Given** reduce-motion is off
**When** the screen mounts
**Then** the default animations run as designed in task 01

### Scenario · Visual parity

**Given** the static variant
**When** compared to the animated final state
**Then** layout, positions, and colors are identical

### Scenario · Accessibility labels unchanged

**Given** the screen reader is on
**When** comparing reduced-motion ON vs OFF
**Then** the labels are identical between the two modes
**And** descriptions don't reference animation

## Frontend (React Native)

### Where it lives

The `BadgeIllustration`, `LevelPills`, and `XpProgressBar` components from task 01 each accept a `reducedMotion: boolean` prop.

The screen calls `useReducedMotion()` and passes the value into all three.

### Behavior

- When the prop is true: animations are skipped; final-state styling renders.
- When false: animations from task 01 play.

The screen does not need to react to runtime preference changes — it's a one-shot render.

## Backend

Not applicable.

## Database

Not applicable.

## Edge Cases

- **OS API unsupported**: `useReducedMotion` defaults to false (animations enabled).
- **Future in-app override**: not in MVP; the OS preference is the single source of truth.

## Privacy / LGPD

Not applicable.

## Analytics

The shared event `accessibility.reduced_motion_active` from task 03's reduced-motion variant covers this; no extra event is needed.

## Tests

- **Unit**: each component honors the `reducedMotion` prop.
- **Snapshot**: visual parity between static and animated end state.
- **A11y**: reduce-motion ON and OFF both pass accessibility checks.

## Definition of Done

- [ ] Components honor `reducedMotion` prop
- [ ] Visual parity verified
- [ ] Tests passing
- [ ] No new analytics events (shared event already in place)

## Standards & References

### Cross-cutting standards
- Coding: `docs/engineering/coding-standards.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references
- React Native AccessibilityInfo: https://reactnative.dev/docs/accessibilityinfo#isreducemotionenabled
- WCAG 2.1 — Animation from Interactions: https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html

### Project context
- Render UI: `01-render-onboarding-gamification-ui.md`
- Shared hook: `03-onboarding-camera/03-reduced-motion-illustration.md`
- `CLAUDE.md`

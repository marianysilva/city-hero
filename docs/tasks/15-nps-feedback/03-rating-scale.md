# NPS Feedback · 5-face rating scale

> **Type:** Screen feature · UI + state
> **Screen:** SCREEN 15 · NPS Feedback
> **Effort:** S (≤1 day)
> **Dependencies:** `15-nps-feedback/01-render-nps-ui-base.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ux`

## Context

The rating row — a horizontal 5-face emoji scale (😡 Péssimo · 😕 Ruim
· 😐 Ok · 🙂 Bom · 😍 Excelente) inside a white card with a centered
title "Como foi o atendimento da prefeitura?". The active face is
ringed and tinted in the brand color; the others are dimmed. The
default selection is "Bom" (4/5) — a deliberate UX choice to reduce
friction without leading.

The 5-face scale is **more human than 0–10 on mobile** and lends itself
to a positive median while still capturing nuance.

## User Story

**As a** Citizen rating a resolution,
**I want** a quick 5-face scale to express how I feel,
**In order to** answer in 1 second without overthinking.

## Acceptance Criteria

### Scenario · Default render

**Given** the screen renders
**When** the rating row appears
**Then** a card with the question "Como foi o atendimento da prefeitura?" centered at the top is shown
**And** below it, a row of 5 faces with labels (Péssimo · Ruim · Ok · Bom · Excelente)
**And** "Bom" (4/5) is the default active selection (ringed + tinted)
**And** the other faces are dimmed (opacity ~55%)

### Scenario · Tap to select

**Given** the user taps a different face
**When** the action runs
**Then** the new selection becomes active (ring + brand tint)
**And** the previous selection becomes dim
**And** light haptic feedback fires
**And** the screen-level rating state updates

### Scenario · Drag across faces

**Given** the user drags their finger across the faces row
**When** the gesture moves
**Then** the selection follows the touch
**And** haptic ticks fire as the finger crosses each face
**And** the final position becomes the rating on release

### Scenario · Rating influences tag emphasis

**Given** the user picks 1 or 2 (negative)
**When** the rating state changes
**Then** the tag grid (task 04) emphasizes negative tags (positions them first or larger)
**And** if the user picks 5, positive tags are emphasized
**And** the change is subtle (no jarring reordering)

### Scenario · Reduced motion

**Given** the user has reduced motion enabled
**When** they tap or drag
**Then** the transitions between faces are instant (no spring animation)
**And** the rating still updates

### Scenario · Touch target size

**Given** any device
**When** the user taps a face
**Then** the touch target is at least 48×48dp
**And** the visual ring is centered within the larger target

### Scenario · Localization

**Given** the user's language is en-US
**When** the row renders
**Then** labels are in English ("Terrible · Bad · Ok · Good · Excellent")
**And** the title is "How was the city's service?"

### Scenario · Accessibility

**Given** screen reader is on
**When** the user navigates the row
**Then** the question is announced as a heading
**And** each face is announced with its label and selection state ("Good, selected" / "Bad, not selected")
**And** activating each announces the new selection

### Scenario · Anti-fraud · randomized initial selection (optional)

**Given** the design defaults to "Bom" to reduce friction
**When** the team wants to A/B-test no-default vs default-good vs default-neutral
**Then** the initial selection can be configured (feature flag)
**And** for MVP, "Bom" is the default

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/NpsFeedback/
├── components/
│   ├── RatingScale.tsx
│   └── RatingFace.tsx
└── hooks/
    └── useNpsRating.ts
```

### Component behavior

- `useNpsRating` holds the current rating (1-5) in screen-scoped state, exposed to the CTA gating and to task 06's submit.
- `RatingScale` renders the question and the 5-face row.
- `RatingFace` is a presentational component with active/inactive variants and a tap callback.

### Animation

- Active ring: subtle scale animation (1.0 → 1.05 → 1.0) on selection.
- Color/dim transitions over ~150ms (instant when reduced motion is on).

### Drag gesture

Use `react-native-gesture-handler` with a `Pan` gesture that maps the touch X to the closest face.

## Backend

Not applicable to this task. The rating travels with the submit payload (task 06).

## Database

Not applicable directly.

## Edge Cases

- **Very small device**: the faces shrink proportionally to fit; minimum touch targets preserved with hit-slop.
- **Tap on the label below a face**: same as tapping the face itself.

## Privacy / LGPD

The rating is part of the user's private input until submitted.

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `nps.rating_selected`              | User changed rating                        | `from`, `to`                          |

## Tests

- **Unit**: state transitions; default selection; rating range (1-5).
- **Integration**: rating change influences tag emphasis (verified by task 04's integration).
- **A11y**: face labels announced.

## Definition of Done

- [ ] RatingScale + RatingFace components
- [ ] `useNpsRating` hook
- [ ] Drag gesture across faces
- [ ] Haptic ticks
- [ ] Reduced motion respected
- [ ] Default to "Bom" with config flag
- [ ] Telemetry event
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Coding: `docs/engineering/coding-standards.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references
- React Native Gesture Handler: https://docs.swmansion.com/react-native-gesture-handler/
- React Native Haptics: https://docs.expo.dev/versions/latest/sdk/haptics/

### Project context
- Render UI base: `01-render-nps-ui-base.md`
- Reason tags (consumes rating): `04-reason-tags.md`
- `CLAUDE.md`

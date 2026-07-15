# Onboarding · Neighborhood · Render UI

> **Type:** Screen feature · UI\
> **Screen:** SCREEN 05 · Onboarding · Your Neighborhood\
> **Effort:** S (≤1 day)\
> **Dependencies:** `00-foundation/02-design-tokens.md`, `00-foundation/04-status-bar-component.md`,
> `03-onboarding-camera/02-onboarding-step-machine.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `frontend`, `screen`, `ui`

## Context

The visual rendering of the fifth and final onboarding step (step 5 of 5). A **stylized illustrated
map** (not a real OSM tile map — that comes later in real screens) shows a neighborhood with a
pulsing "you are here" dot, a few generic icons representing nearby reports, and a soft radius
circle suggesting the hyperlocal feed area. Title and subtitle invite the user to grant location so
the experience is hyperlocal. The top of the screen carries a back button and the step indicator
("Passo 5 de 5").

> Onboarding has **no Skip path** (see `03-onboarding-camera/02-onboarding-step-machine.md`). Note
> that **location permission is independently optional** — the user may tap "Permitir depois"
> without granting the OS dialog, and still complete the onboarding; that's a different concept from
> skipping the step itself.

This task focuses on layout and styling. The actual permission request is covered by task 02. The
reduced-motion variant is task 03.

## User Story

**As a** Citizen finishing onboarding,\
**I want** a clear, friendly preview of the hyperlocal experience,\
**In order to** feel confident granting location permission.

## Acceptance Criteria

### Scenario · Default render

**Given** the screen is the active onboarding step\
**When** it renders\
**Then** the status bar variant is `dark`\
**And** a back button sits at the top-left and the step indicator "Passo 5 de 5" at the top-right\
**And** a stylized map illustration occupies the upper portion of the screen\
**And** the illustration shows: a neighborhood grid (streets), 3-5 stylized icons (pothole, trash,
lighting, etc.) scattered, a pulsing blue dot ("you are here"), and a translucent soft circle (~10km
radius) around the dot\
**And** below the illustration, the title "Vamos focar no seu bairro" and a short subtitle
explaining the radius

### Scenario · Pagination dots

**Given** this is step 5 of 5\
**When** the screen renders\
**Then** the fourth dot is the active (wider/colored) one\
**And** the others are small/neutral

### Scenario · CTAs

**Given** the screen is rendered\
**When** the user taps "Permitir" (the primary CTA)\
**Then** the action delegates to the location permission task (02), which then marks onboarding
complete and routes to Home\
**And** when the user taps the secondary "Permitir depois" link\
**Then** the location permission ask is deferred (without granting), onboarding is marked complete,
and the user lands on Home — the map falls back to the city centroid until they grant permission
later\
**And** the back button returns to step 4 (Community Pact)

### Scenario · Long copy / small device

**Given** a smaller device\
**When** the screen renders\
**Then** illustration scales proportionally, title/subtitle remain legible\
**And** primary CTA stays visible

### Scenario · Accessibility

**Given** screen reader is on\
**When** the user navigates the screen\
**Then** the illustrated map has a meaningful description ("Mapa estilizado mostrando seu bairro com
problemas próximos")\
**And** the title is announced as a heading\
**And** the primary CTA "Permitir localização" is clearly labeled\
**And** the secondary "Permitir depois" link is clearly labeled\
**And** the back button is clearly labeled

### Scenario · Permission state visualization

**Given** the user has already granted location permission earlier (e.g., from City Select GPS
detect)\
**When** the screen renders\
**Then** the illustration's "you are here" dot is correctly placed\
**And** the primary CTA changes to "Continuar →" (since permission is already granted)\
**And** the radius circle reflects the configured default (10km)

### Scenario · Permission previously denied

**Given** the user denied location at City Select\
**When** the screen renders\
**Then** the illustration shows a generic "your neighborhood" placeholder (centered on the active
city's centroid)\
**And** the CTA invites them to try again ("Permitir agora")\
**And** if they denied permanently, the CTA opens system settings (per task 02)

## Frontend (React Native)

### Component location

```
apps/city-hero/src/screens/Onboarding/Neighborhood/
├── NeighborhoodScreen.tsx
├── NeighborhoodScreen.styles.ts
├── NeighborhoodScreen.test.tsx
└── components/
    ├── StylizedMapIllustration.tsx
    └── RadiusCircle.tsx
```

### Component behavior

- The screen is presentational. It receives `onBack`, `onPrimaryAction` (which is "Permitir" or
  "Continuar" depending on permission state), `onDeferPermission` (the "Permitir depois" link —
  completes onboarding without granting OS permission), and `permissionState` as props.
- `StepIndicator` (shared molecule) is consumed with `{ step: 5, total: 5 }`. `PaginationDots`
  (shared) with `total=5, activeIndex=4`.
- `StylizedMapIllustration` accepts `reducedMotion` and `userLocation` (centroid of city or actual
  user location). It renders SVG/CSS layers — no real map tiles.
- `RadiusCircle` is a soft, translucent circle component that scales with the configured radius
  (default 10km).

### Animation (default)

- The "you are here" dot pulses subtly.
- The radius circle gently breathes (scale 0.98 → 1.02) every ~3s.
- Nearby report icons have a subtle bobbing (vertical translation 1-2px over 4s).

### Theming

The screen background uses a tonal gradient consistent with the other onboarding screens.
Streets/grid use slate tones; report icons use the brand category colors.

## Backend

Not applicable.

## Database

Not applicable.

## Edge Cases

- **City centroid not available**: render a fully stylized illustration without specific user
  location; the dot is centered.
- **Custom font not loaded**: fallback to system sans-serif while loading.
- **SVG illustration fails**: fallback to a static raster.

## Privacy / LGPD

Not applicable for this UI task. The actual permission ask and data handling are in task 02.

## Analytics

| Event                                     | When                        | Props            |
| ----------------------------------------- | --------------------------- | ---------------- |
| `onboarding.neighborhood.viewed`          | Screen mounts               | —                |
| `onboarding.neighborhood.back_pressed`    | User taps back              | —                |
| `onboarding.neighborhood.defer_pressed`   | User taps "Permitir depois" | —                |
| `onboarding.neighborhood.primary_pressed` | User taps the primary CTA   | `cta_kind: allow | continue | settings` |

## Tests

- **Unit**: renders all parts; CTA label switches based on permission state; pagination dot 4
  active; back returns to step 3; defer link completes onboarding without granting permission.
- **Snapshot**: light + dark; permission states (not asked / granted / denied).
- **A11y**: descriptions present; reading order correct.

## Definition of Done

- [ ] Neighborhood screen layout matching the prototype
- [ ] StylizedMapIllustration component
- [ ] RadiusCircle component
- [ ] Light + dark themes
- [ ] CTA changes based on permission state
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

- Prototype: `design/index.html` (search `title: 'Onboarding · Seu bairro'`)
- Onboarding state machine: `03-onboarding-camera/02-onboarding-step-machine.md`
- Location permission: `02-location-permission.md`
- Reduced-motion variant: `03-reduced-motion-illustration.md`
- `CLAUDE.md`

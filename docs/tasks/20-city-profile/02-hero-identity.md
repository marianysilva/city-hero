# City Profile · Hero with city identity

> **Type:** Screen feature · UI
> **Screen:** SCREEN 20 · City Profile
> **Effort:** S (≤1 day)
> **Dependencies:** `20-city-profile/01-render-city-profile-ui-base.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ui`

## Context

A tall gradient hero (~210dp tall) with the city's name and identity:
back button + share button overlays, decorative wave shapes at the
bottom for visual interest, and at the bottom of the hero: a small
"SANTA CATARINA · BRASIL" kicker, the city name in large extrabold,
and a "🦸 Cidade CityHero · desde mar/2025" pill.

The gradient uses the brand colors (purple → orange → amber) to give
the screen energy.

## User Story

**As a** Citizen,
**I want** a striking visual identity of my city,
**In order to** feel pride and recognition.

## Acceptance Criteria

### Scenario · Default render

**Given** the screen renders
**When** the hero appears
**Then** the gradient (violet 500 → brand 500 → amber 500) fills the hero area
**And** decorative wave shapes at the bottom add depth
**And** a back button (top-left, white-tinted) and a share button (top-right) overlay
**And** at the bottom-left: "SANTA CATARINA · BRASIL" small caps + the city name in 22dp extrabold + the CityHero pill below

### Scenario · Tap back

**Given** the user taps the back button
**When** the action runs
**Then** the screen returns to the previous screen
**And** light haptic feedback fires

### Scenario · Tap share

**Given** the user taps the share button
**When** the action runs
**Then** the share sheet opens (handled by task 06's share affordance)

### Scenario · CityHero pill includes onboarding date

**Given** the city's `cityhero_since` date is "mar/2025"
**When** the pill renders
**Then** it shows "🦸 Cidade CityHero · desde mar/2025"
**And** the date format is friendly (month/year)

### Scenario · Long city name

**Given** a long city name (e.g., "Balneário Camboriú")
**When** the title renders
**Then** the text wraps gracefully or shrinks the font size
**And** does not overlap with the action buttons

### Scenario · Per-city theming (future)

**Given** different cities want different gradient palettes
**When** the hero renders
**Then** for MVP, all cities use the same brand palette
**And** future iterations can vary per city via per-tenant config

### Scenario · Reduced motion

**Given** the user has reduced motion enabled
**When** the hero renders
**Then** any subtle animations on the decorative waves are static
**And** the rest renders identically

### Scenario · Accessibility

**Given** screen reader is on
**When** the hero is read
**Then** the city name is announced as a heading
**And** the back and share buttons are clearly labeled
**And** the kicker ("SANTA CATARINA · BRASIL") is announced before the city name

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/CityProfile/
└── components/
    ├── CityHero.tsx
    └── CityHeroWaves.tsx
```

### Component behavior

- `CityHero` accepts the city data (name, state, country, cityhero_since) and renders the gradient + identity.
- `CityHeroWaves` is a small decorative SVG.
- Both are presentational; the screen wires the back and share callbacks.

## Backend

This task doesn't introduce new endpoints. The city's data is part of the city-profile response (task 01's hook).

## Database

The `cities` table has the necessary fields (`name`, `state`, `country`, `cityhero_since`). Schema is owned by `02-city-select/02-cities-catalog-api.md`.

## Edge Cases

- **`cityhero_since` is null** (data inconsistency): the pill omits the date or shows "—".
- **Long state names**: kicker truncates with ellipsis.

## Privacy / LGPD

Not applicable.

## Analytics

| Event                        | When         | Props     |
| ---------------------------- | ------------ | --------- |
| `city_profile.hero_rendered` | Hero mounted | `city_id` |

## Tests

- **Unit**: hero renders with all fields; missing fields handled gracefully; back and share fire callbacks.
- **Snapshot**: light + dark; with and without long name.
- **A11y**: announcements verified.

## Definition of Done

- [ ] CityHero + CityHeroWaves components
- [ ] Back and share callbacks
- [ ] Long-name handling
- [ ] Localized labels
- [ ] Telemetry event
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Coding: `docs/engineering/coding-standards.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Project context

- Render UI base: `01-render-city-profile-ui-base.md`
- Cities catalog (schema source): `02-city-select/02-cities-catalog-api.md`
- Share & extras (consumer): `06-share-and-extras.md`
- `CLAUDE.md`

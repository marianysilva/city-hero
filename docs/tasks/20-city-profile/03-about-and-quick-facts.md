# City Profile · About + quick facts

> **Type:** Screen feature · UI + content
> **Screen:** SCREEN 20 · City Profile
> **Effort:** S (≤1 day)
> **Dependencies:** `20-city-profile/01-render-city-profile-ui-base.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ui`

## Context

Two compact UI elements below the hero:

- **About card**: a short descriptive paragraph about the city
  ("Cidade litorânea com 22.456 habitantes e 92 km² divididos em 18
  bairros...")  — sourced from the city's profile record.
- **Quick facts grid**: 4 small white cards in a 2×4 grid showing key
  stats (population, heroes/active users, neighborhoods, km²).

These give the user the context they need to interpret the rest of the
dashboard.

## User Story

**As a** Citizen,
**I want** quick context about my city,
**In order to** understand the scale of the numbers I'm about to read.

## Acceptance Criteria

### Scenario · About card render

**Given** the screen renders
**When** the about section appears
**Then** a small "SOBRE A CIDADE" uppercase label is shown
**And** below: a short descriptive paragraph (2-4 lines) in slate-700 with key numbers bolded
**And** the paragraph uses the city's `about_md` or `about_html` field

### Scenario · Quick facts grid render

**Given** the screen renders
**When** the grid appears
**Then** 4 small cards appear in a row: Habitantes (e.g., "22k"), Heróis (active CityHero users, brand color), Bairros, km²
**And** each card has a large bold number + a small label below

### Scenario · Real-time "Heróis" updates

**Given** the screen is open and new users sign up
**When** the count changes
**Then** the "Heróis" card updates in real time (via WebSocket from `06-home-map/08`)
**And** the change animates with a small pulse

### Scenario · Long descriptive text

**Given** the about text is long
**When** rendered
**Then** the first ~4 lines are visible with a "Ver mais" toggle
**And** tapping expands to show the full text
**And** collapse returns to the truncated view

### Scenario · Localization

**Given** the user's language is en-US
**When** the labels render
**Then** they're in English ("Inhabitants", "Heroes", "Neighborhoods", "km²")
**And** numbers format per locale (e.g., "22k" stays universal)

### Scenario · Numbers above thousand format compactly

**Given** populations are in thousands or millions
**When** the number renders
**Then** "22456" becomes "22k"
**And** "1234567" becomes "1,2M"

### Scenario · Per-city customization

**Given** a city wants to swap "Heróis" with a different metric (e.g., "Aprovações" for elected officials)
**When** the config supports it
**Then** the labels and source data are configurable per city
**And** for MVP, the four facts are hard-coded

### Scenario · Accessibility

**Given** screen reader is on
**When** the user navigates
**Then** the about section is announced as a region with the heading and content
**And** the quick facts grid is announced as a group with each card's value and label

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/CityProfile/
└── components/
    ├── AboutCard.tsx
    ├── QuickFactsGrid.tsx
    └── QuickFactCard.tsx
```

### Component behavior

- `AboutCard` renders the description with markdown-style bold support.
- `QuickFactsGrid` renders the four `QuickFactCard` components.
- The component reads from the city profile data hook.

### Number formatter

A small utility (`formatCompact(number)`) handles the k/M abbreviations.

## Backend (FastAPI)

The city profile endpoint returns the about text and the quick facts:

| Method | Path                                                  | Purpose                              |
|--------|-------------------------------------------------------|---------------------------------------|
| GET    | `/api/v1/cities/{id}/profile`                         | Full profile data                    |

For "Heróis" specifically, the count is computed from the `users` table for the city.

## Database

The `cities` table has fields for `about_md`, `population`, `neighborhoods_count`, `area_km2`. The hero count is computed on-demand or cached.

## Edge Cases

- **About text empty**: the about card is hidden.
- **Numbers exactly at boundaries** (e.g., 999 vs 1k): formatting handles transitions cleanly.

## Privacy / LGPD

The "Heróis" count is aggregate; no individual users are exposed.

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `city_profile.about_expanded`      | User tapped "Ver mais"                     | —                                     |
| `city_profile.quick_facts_rendered`| Grid mounted                               | `heroes_count`                        |

## Tests

- **Unit**: about expansion; number formatting; missing data fallback.
- **Snapshot**: with/without long text; each language.
- **A11y**: regions and groups announced.

## Definition of Done

- [ ] AboutCard with expand/collapse
- [ ] QuickFactsGrid + QuickFactCard
- [ ] Number formatter
- [ ] Real-time hero count
- [ ] Localized labels
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Coding: `docs/engineering/coding-standards.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Project context
- Render UI base: `01-render-city-profile-ui-base.md`
- Cities catalog (schema source): `02-city-select/02-cities-catalog-api.md`
- `CLAUDE.md`

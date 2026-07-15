# City Select · Render UI

> **Type:** Screen feature · UI\
> **Screen:** SCREEN 02 · Choose City\
> **Effort:** S (≤1 day)\
> **Dependencies:** `00-foundation/02-design-tokens.md`, `00-foundation/04-status-bar-component.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `frontend`, `screen`, `ui`

## Context

The visual layout of the city-select screen: header with back button and step indicator (1 of 5),
title and subtitle, the prominent GPS detection card, the search input, the list of cities (active +
coming soon), and a footer hint about switching cities later.

This task focuses on the layout and styling only — list contents, GPS behavior, and selection are
implemented by their own tasks.

## User Story

**As a** Citizen on the City Select screen,\
**I want** a clear, friendly layout that guides me toward the right city,\
**In order to** complete this step quickly without confusion.

## Acceptance Criteria

### Scenario · Default render

**Given** the screen is the active route\
**When** it renders\
**Then** the status bar variant is `dark` (light background)\
**And** a top bar shows a back button on the left and a "Passo 1 de 5" indicator on the right\
**And** the title "Qual é a sua cidade?" appears in extrabold

### Scenario · GPS detection card placeholder

**Given** the screen renders\
**When** the GPS card is shown\
**Then** it appears below the title with a brand-orange-to-civic-purple gradient background\
**And** has soft decorative circles in the top-right corner\
**And** contains a location pin icon, a "Detectamos" label, the city name, GPS precision text, and a
primary "Confirmar ✓" CTA button\
**And** the actual GPS data is wired by task `04-gps-auto-detect`; the layout itself accepts
placeholders or empty state

### Scenario · GPS card hidden when not available

**Given** the GPS card has no detected city (permission denied or no signal)\
**When** the screen renders\
**Then** the card is omitted, and the search/list section moves up to fill the space gracefully

### Scenario · Search input

**Given** the screen renders\
**When** the search input is visible\
**Then** it shows a magnifier icon, a "Buscar outra cidade…" placeholder, and accepts text input\
**And** styling follows the design tokens (rounded, white background, subtle border)

### Scenario · List of cities

**Given** the screen renders\
**When** the list of cities is visible\
**Then** each row has a flag/emoji on the left, name and subtitle in the middle, status badge on the
right\
**And** the active (pilot) row has a brand-tinted background and a green "ATIVA" badge\
**And** "coming soon" rows have a desaturated style and a slate "EM BREVE" badge

### Scenario · Footer hint

**Given** the screen renders\
**When** the footer is visible\
**Then** small caption text reads "Viajando? Troque a cidade em Perfil da Cidade"\
**And** "Perfil da Cidade" is bold but not a link (it's a descriptive hint, not a CTA)

### Scenario · Step indicator updates

**Given** the screen is part of a 5-step onboarding (Splash + this + 3 onboarding steps + Home)\
**When** the screen mounts\
**Then** the step indicator shows "Passo 1 de 5"\
**And** matching styling is consistent across the onboarding triplet

### Scenario · Long city name overflow

**Given** a city has a very long name\
**When** the row renders\
**Then** the name truncates with ellipsis after one line\
**And** the subtitle similarly truncates if needed\
**And** the badge stays right-aligned without wrapping

### Scenario · Accessibility

**Given** screen reader is on\
**When** the user navigates the screen\
**Then** the title is announced as a heading\
**And** each city row is announced with its name, subtitle, and status ("Pôrto Belo SC, pilot,
active")\
**And** every interactive element has a meaningful label\
**And** color contrast meets WCAG AA

## Frontend (React Native)

### Component location

```
apps/city-hero/src/screens/CitySelect/
├── CitySelectScreen.tsx
├── CitySelectScreen.styles.ts
├── CitySelectScreen.test.tsx
└── components/
    ├── GpsDetectionCard.tsx
    ├── SearchInput.tsx
    └── CityRow.tsx
```

`StepIndicator` ("Passo 1 de 5") is **not** a screen-local component — it's the shared molecule in
`@cityhero/design-system` (see `docs/engineering/component-inventory.md` · Molecules row
`StepIndicator`). Consumed identically by tasks 02, 03, 04, 05, and 24.

### Component behavior

- The screen receives data props from its container/orchestrator: a list of cities, the GPS
  detection result (nullable), and callbacks for tapping a row and confirming the GPS suggestion.
- `GpsDetectionCard` renders the suggested city with confirm action; it's stateless.
- `SearchInput` is a controlled component; the parent owns the search value.
- `CityRow` renders a single city in three visual states: `active`, `selected` (transient when the
  user confirms), `coming_soon`.
- `StepIndicator` consumed from the design system with props `{ step: 1, total: 5 }`.

### Animation and feedback

- Tapping a row triggers a subtle press animation (scale or color change).
- Tapping the GPS confirm CTA fires haptic feedback.
- The transition from this screen to the next uses the standard onboarding slide animation.

### Theming

The screen background uses a `white → brand.50` vertical gradient. In dark mode, it switches to a
tonally equivalent dark gradient.

## Backend

Not applicable to this task (UI layout only). City data is provided by task `02-cities-catalog-api`.

## Database

Not applicable.

## Edge Cases

- **No active cities returned**: list shows a friendly empty state ("Estamos chegando em sua cidade
  em breve") with a CTA to join a waitlist.
- **Many cities** (10+): the list scrolls vertically; the GPS card and search stay near the top.
- **Status bar overlap on devices with notch**: top safe-area inset is respected.
- **Software keyboard appears for search**: the layout adjusts so the input stays visible above the
  keyboard.

## Privacy / LGPD

Not applicable to this task (no data is collected here; the GPS card is a visual placeholder).

## Analytics

| Event                  | When                  | Props |
| ---------------------- | --------------------- | ----- |
| `city_select.viewed`   | Screen mounts         | —     |
| `city_select.scrolled` | User scrolls the list | —     |

(More fine-grained events come from the other sub-tasks.)

## Tests

- **Unit**: renders all subcomponents; GPS card is conditionally rendered; rows show the right
  visual state per status.
- **Snapshot**: light + dark variants.
- **A11y**: TalkBack/VoiceOver pass with the key elements labeled.

## Definition of Done

- [ ] Screen layout matching the prototype
- [ ] All subcomponents with prop-driven rendering
- [ ] Step indicator (reusable)
- [ ] Light + dark theme
- [ ] Accessibility verified
- [ ] Unit + snapshot tests
- [ ] Ready for sub-tasks 02–06 to plug in data and behavior

## Standards & References

### Cross-cutting standards

- Coding: `docs/engineering/coding-standards.md`
- Architecture (component patterns): `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- React Native FlatList (or SectionList): https://reactnative.dev/docs/flatlist
- React Native KeyboardAvoidingView: https://reactnative.dev/docs/keyboardavoidingview

### Project context

- Prototype: `design/index.html` (search `title: 'Escolher Cidade'`)
- Design tokens: `00-foundation/02-design-tokens.md`
- `CLAUDE.md`

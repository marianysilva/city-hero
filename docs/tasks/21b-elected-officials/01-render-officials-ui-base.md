# Elected Officials · Render UI base

> **Type:** Screen feature · UI\
> **Screen:** SCREEN 21b · Politicians of the City\
> **Effort:** S (≤1 day)\
> **Dependencies:** `00-foundation/02-design-tokens.md`, `00-foundation/04-status-bar-component.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `frontend`, `screen`, `ui`

## Context

The base layout for the politicians-of-the-city roster: a slate-50 background, a header row (back
button, "Controle social" kicker + "Políticos da cidade" title), a gradient KPI hero (total
elected + breakdown by level), a search slot, a sticky filter-chip slot, four grouped list slots
(municipal executive, city council, state assembly, federal deputies + senators), a "Fonte dos
dados" sources card, and a green disclaimer card citing art. 37 + LAI. The bottom nav is visible.
The list cards, search behavior, and filter logic are filled in by tasks 02–04.

## User Story

**As a** Citizen,\
**I want** a clean, neutral layout to browse who represents my city,\
**In order to** understand the chain of representation without feeling overwhelmed or steered.

## Acceptance Criteria

### Scenario · Default render

**Given** the user opens the screen\
**When** it renders\
**Then** the status bar variant is `dark`\
**And** the header has a back button, "Controle social" kicker (uppercase, slate-500, bold), and
"Políticos da cidade" title (extrabold, slate-900)\
**And** below the header: the KPI hero, then the search slot, then the chip slot, then the four
group slots, then the sources card, then the disclaimer card\
**And** the bottom nav is visible with the `more` tab active

### Scenario · KPI hero

**Given** the screen mounts with summary data for the active city\
**When** the hero renders\
**Then** the hero uses a violet→sky gradient (matches the prototype)\
**And** it shows: a 🗳️ icon, the city kicker (e.g., "Pôrto Belo · SC"), the total count line (e.g.,
"23 eleitos representam a cidade"), and a 4-column metric grid: `vereadores`, `prefeito · vice`,
`estaduais`, `federais · sen.`\
**And** zero counts render honestly (e.g., "0 estaduais") without hiding the cell

### Scenario · Slot system

**Given** the screen exposes positional slots\
**When** other tasks plug in\
**Then** named slots are: `kpi-hero`, `search`, `filter-chips`, `group-municipal-executive`,
`group-city-council`, `group-state-assembly`, `group-federal-plus-senate`, `sources-card`,
`disclaimer-card`\
**And** the `search` slot is filled by the shared `SearchBar` atom from `@cityhero/design-system`
(configured by task 03) — the base layout never defines a local search input\
**And** the `filter-chips` slot is filled by the shared `FilterChipRow` from
`@cityhero/design-system` (configured by task 03) — the base layout never defines a local chip
component\
**And** each group slot exposes a section header (uppercase, slate-400, micro) and a list-of-cards
area (filled by task 02)

### Scenario · Sources card

**Given** the bottom of the scroll\
**When** the sources card renders\
**Then** it shows a 🛡️ icon, the bold heading "Fonte dos dados", and the body naming each active
source (TSE, Câmara dos Deputados, Senado, the active city's Câmara Municipal) with the cadence
("Atualizado mensalmente") and the external-link warning ("Link 'Portal da Transparência' abre fora
do app")\
**And** the source list is data-driven (whichever sources are wired up for the active city)

### Scenario · Disclaimer card

**Given** the bottom of the scroll, below the sources card\
**When** the disclaimer card renders\
**Then** it uses an emerald-50 background with emerald-200 border and a ⚖️ icon\
**And** the body cites Constitution art. 37 + LAI and states explicitly that CityHero does not issue
opinions about any official\
**And** the copy is non-editable through any feature flag — the disclaimer must be present on every
render

### Scenario · Theming

**Given** dark mode\
**When** the screen renders\
**Then** the background and cards adapt to dark tokens\
**And** the gradient KPI hero and the emerald disclaimer card retain their identity colors
(legibility verified)

### Scenario · Accessibility

**Given** screen reader is on\
**When** the screen mounts\
**Then** the title is announced as a heading\
**And** the back button is labeled\
**And** the KPI hero is announced as a group with the total + breakdown read in order\
**And** the disclaimer card is part of the reading order (not hidden)

## Frontend (React Native)

### Component location

```
apps/city-hero/src/screens/ElectedOfficials/
├── ElectedOfficialsScreen.tsx
├── ElectedOfficialsScreen.styles.ts
├── ElectedOfficialsScreen.test.tsx
└── components/
    ├── OfficialsHeader.tsx
    ├── OfficialsKpiHero.tsx
    ├── OfficialsLayoutSlots.tsx
    ├── OfficialsSourcesCard.tsx
    └── OfficialsDisclaimerCard.tsx
```

### Component behavior

- `OfficialsHeader` renders the back button + kicker + title; no share button on this screen (the
  screen is read-only, factual).
- `OfficialsKpiHero` is presentational — receives `{ total, byLevel }` and renders the gradient
  surface + grid. The grid order is fixed: municipal council → executive → state → federal+senate.
- `OfficialsLayoutSlots` accepts named slot children and renders them in fixed order. It does
  **not** own any business logic.
- `OfficialsSourcesCard` accepts a list of `{ name, url, updatedAt }` source descriptors and renders
  them in a single sentence.
- `OfficialsDisclaimerCard` is static (i18n strings only) and cannot be disabled.

## Backend

Not applicable for this task. The KPI hero consumes the same summary payload as task 02
(`GET /api/v1/cities/{id}/elected-officials/summary`).

## Database

Not applicable.

## Edge Cases

- **City with zero state or federal representation crossing the threshold**: the relevant group slot
  still renders its section header with a quiet empty message ("Sem representantes com votação
  relevante na cidade") — never hidden, so the user understands the absence is intentional.
- **Summary still loading**: the KPI hero shows a `Skeleton` (atom) for the total and metric grid.
- **Long city name**: the kicker truncates with ellipsis.

## Privacy / LGPD

All data shown on this screen is public per Constitution art. 37 + LAI. CPF is **never** rendered,
sent to the client, or stored in plaintext on the backend (see task 05).

## Analytics

| Event                            | When                        | Props                    |
| -------------------------------- | --------------------------- | ------------------------ |
| `elected_officials.viewed`       | Screen mounts               | `city_id`, `total_count` |
| `elected_officials.back_pressed` | User tapped the back button | —                        |

## Tests

- **Unit**: slot order; KPI grid order; sources card renders from a variable source list; disclaimer
  card always present.
- **Snapshot**: light + dark; empty group state.
- **A11y**: title heading; KPI hero announced as a group; disclaimer in reading order.

## Definition of Done

- [ ] `ElectedOfficialsScreen` base layout
- [ ] `OfficialsHeader`, `OfficialsKpiHero`, `OfficialsLayoutSlots`
- [ ] `OfficialsSourcesCard`, `OfficialsDisclaimerCard`
- [ ] Light + dark themes
- [ ] Accessibility verified
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Coding: `docs/engineering/coding-standards.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`
- Design system overview: `docs/engineering/design-system.md`
- Component inventory: `docs/engineering/component-inventory.md`

### Project context

- Prototype: `design/src/screens/21b-elected-officials.js`
- Parent overview: `docs/tasks/21b-elected-officials/_README.md`
- Open questions: `docs/engineering/open-questions.md`
- `CLAUDE.md`

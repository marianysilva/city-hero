# Prefecture News · Category filter chips

> **Type:** Screen feature · UI + state\
> **Screen:** SCREEN 21 · Prefecture News\
> **Effort:** S (≤1 day)\
> **Dependencies:** `21-prefecture-news/01-render-news-ui-base.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `frontend`, `screen`, `ux`

## Context

A horizontal scrollable row of category chips: **Todas · N** (default active), **🚨 Alertas · N**
(highlighted in rose), **🩺 Saúde**, **🚧 Obras**, **🎓 Educação**, **🎉 Eventos**, **🏛️
Transparência**, etc. Tapping a chip narrows the list below. The chips are sticky — they stay
visible as the user scrolls.

## User Story

**As a** Citizen,\
**I want** to filter the prefecture's announcements by topic,\
**In order to** focus on what matters to me.

## Acceptance Criteria

### Scenario · Default render

**Given** the user opens the screen\
**When** the chips render\
**Then** "Todas · N" is active (slate-900 background, white text) with the count badge\
**And** "🚨 Alertas · N" follows with rose-tinted background if there are active alerts\
**And** other categories appear in white with neutral borders

### Scenario · Tap to filter

**Given** the user taps a category\
**When** the action runs\
**Then** the chip becomes active\
**And** the news list (task 04) refetches/refilters to show only that category\
**And** the pinned alert (task 03) follows the filter (hidden if the filter excludes it)

### Scenario · Horizontal scroll

**Given** more categories than fit on screen\
**When** the user scrolls horizontally\
**Then** the chips scroll smoothly\
**And** active chip stays highlighted

### Scenario · Sticky position

**Given** the user scrolls the content area\
**When** scrolling vertically\
**Then** the chips stick at the top below the header\
**And** remain visible throughout the scroll

### Scenario · Counts on chips

**Given** each category has its own count\
**When** the chips render\
**Then** counts show next to category labels for "Todas" and "Alertas" prominently\
**And** other categories may show counts based on UI density

### Scenario · Localization

**Given** the user's language is en-US\
**When** chips render\
**Then** labels are in English ("All · N", "🚨 Alerts · N", "🩺 Health", etc.)

### Scenario · Persisted filter

**Given** the user picked a filter\
**When** they leave and return\
**Then** the filter persists for the session\
**And** resets on cold start

### Scenario · Accessibility

**Given** screen reader is on\
**When** the user navigates the chips\
**Then** each is announced with label, count, and selection state\
**And** the active chip is announced as "selected"

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/PrefectureNews/
└── hooks/
    └── useNewsCategoryFilter.ts
```

Renders the shared `FilterChipRow` from `@cityhero/design-system`. The screen owns the chip
definitions and the `onChipPress` callback that filters the data; no styling lives in this screen's
components. Horizontal scroll and sticky behavior come from `FilterChipRow`. See
`docs/engineering/component-inventory.md` (row `FilterChipRow`) and
`docs/engineering/design-system.md`.

### Component behavior

- `useNewsCategoryFilter` holds the active filter.
- The screen builds the chip array and passes it to `FilterChipRow` with an `onChipPress(id)`
  callback that updates the store.
- The news list and pinned alert read from the same store.

### Chip list this screen passes to `FilterChipRow`

- `Todas` — initial `active: true`; `count` reflects the total news count.
- `Alertas` — `icon` 🚨, `count` reflects active alerts; the screen passes a variant hint so
  `FilterChipRow` can render the rose accent.
- `Saúde` — `icon` 🩺.
- `Obras` — `icon` 🚧.
- `Educação` — `icon` 🎓.
- `Eventos` — `icon` 🎉.
- `Transparência` — `icon` 🏛️.
- Optional `count` on each category chip (UI density permitting).

### Catalog source

For MVP, categories are statically defined (Alertas, Saúde, Obras, Educação, Eventos,
Transparência). Future: per-city catalog with admin tooling.

## Backend

The news endpoint accepts a `category` query param matching the chip key. No new endpoint.

## Database

The `prefecture_news.category` column is indexed for fast filtering.

## Edge Cases

- **Many categories**: horizontal scroll with end-of-list indicators (visual gradient hinting more
  content).
- **Empty category**: chip is still shown; the list shows an empty state ("Nada em Saúde agora").

## Privacy / LGPD

Not applicable.

## Analytics

| Event                            | When        | Props        |
| -------------------------------- | ----------- | ------------ |
| `prefecture_news.filter_changed` | Chip tapped | `from`, `to` |

## Tests

- **Unit**: store transitions; chip visual state; counts.
- **Integration**: filter change triggers list refetch.
- **A11y**: chips labeled.

## Definition of Done

- [ ] Chip list definition + filter callback (no local chip component)
- [ ] `FilterChipRow` integration verified visually in Storybook
- [ ] useNewsCategoryFilter hook
- [ ] Sticky behavior (provided by `FilterChipRow`)
- [ ] Localized labels
- [ ] Telemetry event
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Coding: `docs/engineering/coding-standards.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Project context

- Render UI base: `01-render-news-ui-base.md`
- News list (consumes filter): `04-news-list.md`
- Pinned alert (follows filter): `03-pinned-alert-card.md`
- Shared chip molecule: `docs/engineering/component-inventory.md` (row `FilterChipRow`)
- Design system overview: `docs/engineering/design-system.md`
- `CLAUDE.md`

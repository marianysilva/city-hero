# Heroes League · Pivot copy section

> **Type:** Screen feature · UI + copy
> **Screen:** SCREEN 12 · Heroes League
> **Effort:** S (≤1 day)
> **Dependencies:** `12-heroes-league/01-render-league-ui-base.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `content`

## Context

The transitional copy between the celebration hero (task 02) and the
share UI (tasks 04–06). A small pill ("🦸 PRÓXIMO PASSO"), a headline
("Todo herói tem sua liga."), and a paragraph with a **data anchor**
explaining the value of sharing in concrete terms ("Reportes com apoio
público são resolvidos em 3 dias em média — contra 7 dias quando ficam
só seus.").

This section does the **emotional pivot** from "I did something good"
to "amplifying it makes it work faster" — without which the share
buttons below feel pushy.

## User Story

**As a** Citizen who just submitted,
**I want** a clear reason to share,
**In order to** see the value of amplification before hitting the share button.

## Acceptance Criteria

### Scenario · Default render

**Given** the user scrolls past the hero
**When** the pivot section renders
**Then** a centered pill "🦸 PRÓXIMO PASSO" appears with violet styling
**And** below it, the headline "Todo herói tem sua liga." in large extrabold
**And** below the headline, a short paragraph with the data anchor
**And** the headline and paragraph are centered

### Scenario · Data anchor

**Given** the data anchor is shown
**When** the user reads
**Then** the comparison is concrete: "resolvidos em 3 dias em média — contra 7 dias quando ficam só seus"
**And** the numbers must be **truthful** — sourced from prefecture data when available, with a small footnote or source link before launch
**And** if no data is yet available, the section shows a softer framing without specific numbers (e.g., "resolvem mais rápido")

### Scenario · Data freshness

**Given** the comparison numbers are configured (probably remote config)
**When** the screen loads
**Then** the current values are read from a config service
**And** if the config fails, fallback to safe, soft copy

### Scenario · A small "Saber mais" link

**Given** the user wants more context on the numbers
**When** they tap a small "Saber mais" link below the paragraph
**Then** a sheet expands with the source, sample size, and disclaimers
**And** dismissing returns to the screen

### Scenario · Localization

**Given** the user's language is en-US
**When** the section renders
**Then** copy is in English ("Every hero has their league." / "Reports with public support are resolved in 3 days on average — vs. 7 days when alone.")

### Scenario · No-data variant (initial launch)

**Given** the prefecture data isn't yet available
**When** the section renders
**Then** the softer copy is used ("Reportes com mais apoio chegam primeiro na fila da prefeitura.")
**And** the "Saber mais" link still works (explains methodology when data exists)

### Scenario · Accessibility

**Given** screen reader is on
**When** the section is read
**Then** the headline is announced as a heading
**And** the paragraph is read in order
**And** the "Saber mais" link is clearly labeled

## Frontend (React Native)

### Where it lives

```
apps/mobile/src/screens/HeroesLeague/
└── components/
    ├── PivotCopySection.tsx
    └── DataSourceSheet.tsx
```

### Component behavior

- `PivotCopySection` is presentational. It receives the configured numbers (or falls back to soft copy).
- `DataSourceSheet` is the explainer modal opened by "Saber mais".

### Config source

The numbers (`days_with_support`, `days_without_support`, `sample_size`, `methodology_url`) come from a small remote config endpoint or static config. For MVP, hard-coded conservative defaults are acceptable; a TODO marks the swap when prefecture data is ingested.

## Backend (FastAPI)

### Optional endpoint

If the values become dynamic, an endpoint like:

| Method | Path                              | Purpose                                |
|--------|-----------------------------------|----------------------------------------|
| GET    | `/api/v1/config/league-stats`     | Returns the data anchor numbers       |

For MVP, this can be static.

## Database

Not applicable.

## Edge Cases

- **Data anchor changed mid-session**: the screen renders the values it had at mount; subsequent visits read the new values.
- **Source link broken**: the sheet still explains methodology in body text; the link is optional.

## Privacy / LGPD

Not applicable.

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `league.pivot_rendered`            | Section mounted                            | `data_anchor_variant: numbers|soft`  |
| `league.data_source_opened`        | User taps "Saber mais"                     | —                                     |

## Tests

- **Unit**: renders correctly with numbers or soft variant; "Saber mais" opens sheet.
- **Snapshot**: both variants.
- **A11y**: heading and paragraph announced; link labeled.

## Definition of Done

- [ ] PivotCopySection component
- [ ] DataSourceSheet
- [ ] Config source wired (static or remote)
- [ ] Fallback soft variant
- [ ] Localized strings
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Coding: `docs/engineering/coding-standards.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Project context
- Render UI base: `01-render-league-ui-base.md`
- `CLAUDE.md`

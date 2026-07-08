# Bolsa Família · Render UI base

> **Type:** Screen feature · UI
> **Screen:** SCREEN 23 · Bolsa Família Detail
> **Effort:** S (≤1 day)
> **Dependencies:** `00-foundation/02-design-tokens.md`, `00-foundation/04-status-bar-component.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ui`

## Context

The base layout: a slate-50 background, a header with back button + program brand identity (🤝 + "Bolsa Família" + "Federal · Social" pill), a scrollable area for hero metrics, trend chart, breakdown table, and transparency notes (tasks 02–05), plus a sticky bottom CTA for "Denunciar irregularidade".

## Acceptance Criteria

### Scenario · Default render

**Given** the user opens the screen
**When** it renders
**Then** status bar is `dark`
**And** the header shows back button, program emoji + name, and a "FEDERAL · SOCIAL" pill
**And** below: slots for hero metrics, chart, breakdown, notes
**And** sticky bottom CTA bar at the bottom

### Scenario · Slot system

**Given** the screen exposes slots
**When** tasks plug in
**Then** named slots are: `hero-metrics`, `trend-chart`, `breakdown`, `transparency-notes`, `cta-bar`

### Scenario · Back navigation

**Given** the user taps back
**When** the action runs
**Then** returns to SCREEN 22 (Programs)

### Scenario · Theming

**Given** dark mode
**When** rendered
**Then** background + cards adapt

### Scenario · Accessibility

**Given** SR is on
**When** mounted
**Then** title + program name announced as heading

## Frontend

```
apps/city-hero/src/screens/BolsaFamiliaDetail/
├── BolsaFamiliaDetailScreen.tsx
├── BolsaFamiliaDetailScreen.styles.ts
├── BolsaFamiliaDetailScreen.test.tsx
└── components/
    └── BolsaFamiliaHeader.tsx
```

## Backend

Not applicable.

## Database

Not applicable.

## Edge Cases

- **Data unavailable for the city**: screen shows soft fallback ("Sem dados de Bolsa Família para esta cidade ainda").

## Privacy / LGPD

Not applicable directly; subsequent tasks handle PII boundaries.

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `bolsa_familia.viewed`             | Screen mounts                              | `city_id`                             |
| `bolsa_familia.back_pressed`       | User taps back                             | —                                     |

## Tests

- **Unit**: slots; header; back behavior.
- **Snapshot**: light + dark.
- **A11y**: title labeled.

## Definition of Done

- [ ] BolsaFamiliaDetailScreen base layout
- [ ] BolsaFamiliaHeader
- [ ] Slot system
- [ ] Light + dark themes
- [ ] Accessibility verified
- [ ] Tests passing

## Standards & References

- Cross-cutting: `docs/engineering/`
- Prototype: `design/index.html` (search `title: 'Detalhe · Bolsa Família'`)
- `CLAUDE.md`

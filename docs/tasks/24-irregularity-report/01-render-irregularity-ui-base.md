# Irregularity Report · Render UI base

> **Type:** Screen feature · UI
> **Screen:** SCREEN 24 · Irregularity Report
> **Effort:** S (≤1 day)
> **Dependencies:** `00-foundation/02-design-tokens.md`, `00-foundation/04-status-bar-component.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ui`

## Context

A multi-step layout. Header with back button + "Passo N de 5" indicator + screen title. Scrollable middle area for the current step's content. Sticky bottom CTA bar with "Voltar" + "Continuar" (or "Enviar" at the last step).

## Acceptance Criteria

### Scenario · Default render

**Given** the user opens the screen
**When** it renders
**Then** status bar is `dark`
**And** header: back button + step indicator + title ("Denunciar irregularidade")
**And** below: scrollable step content slot
**And** sticky bottom CTA bar with Voltar + Continuar

### Scenario · Step indicator

**Given** the user is on step N of 5
**When** rendered
**Then** "Passo N de 5" is visible
**And** a small progress bar fills proportionally

### Scenario · Slot system

**Given** the screen exposes positional slots
**When** tasks plug in
**Then** named slots are: `header` (shell), `step-content` (per step task), `cta-bar`

### Scenario · Voltar at step 1

**Given** the user is on step 1
**When** they tap Voltar
**Then** the screen closes and returns to the previous (Programs or Bolsa Família detail)

### Scenario · Voltar at later step

**Given** the user is on step >1
**When** they tap Voltar
**Then** they navigate to the previous step in the flow

### Scenario · Theming

**Given** dark mode
**When** rendered
**Then** background adapts

### Scenario · Accessibility

**Given** SR is on
**When** the screen mounts
**Then** title + step indicator announced ("Step 1 of 5")
**And** Voltar/Continuar labeled

## Frontend

```
apps/city-hero/src/screens/IrregularityReport/
├── IrregularityReportScreen.tsx
├── IrregularityReportScreen.styles.ts
├── IrregularityReportScreen.test.tsx
└── components/
    ├── StepIndicator.tsx
    └── StepCtaBar.tsx
```

## Backend

Not applicable.

## Database

Not applicable.

## Edge Cases

- **User abandoned mid-flow**: state preserved for the session; cleared on cold start (the user's choices are pre-handoff).

## Privacy / LGPD

The screen scaffolding doesn't hold PII; subsequent tasks define what's collected and how it's handled (always with the principle: nothing is stored by CityHero).

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `irregularity.viewed`              | Screen mounts                              | `entry: programs|bolsa|menu`         |
| `irregularity.back_pressed`        | User backs out                             | `from_step`                           |

## Tests

- **Unit**: step indicator; CTA gating per step.
- **Snapshot**: light + dark.
- **A11y**: title labeled.

## Definition of Done

- [ ] IrregularityReportScreen base layout with step machine
- [ ] StepIndicator + StepCtaBar
- [ ] Slot system
- [ ] Light + dark themes
- [ ] Accessibility verified
- [ ] Tests passing

## Standards & References

- Cross-cutting: `docs/engineering/`
- Prototype: `design/index.html` (search `title: 'Denunciar irregularidade'`)
- `CLAUDE.md`

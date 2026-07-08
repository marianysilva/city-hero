# Programs · Footer + Denunciar irregularity entry

> **Type:** Screen feature · UI + content
> **Screen:** SCREEN 22 · Programs & Transparency
> **Effort:** S (≤1 day)
> **Dependencies:** `22-programs-transparency/01-render-programs-ui-base.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `accountability`

## Context

A small educational footer at the bottom of the scroll area explaining
what **controle social** is and how the data here helps it work
("CityHero conecta os dados públicos (Portal da Transparência, dados
abertos da prefeitura) com você. Quando algo não bate, denuncie aos
órgãos competentes."), followed by a prominent "🛡️ Denunciar
irregularidade" button that opens SCREEN 24 (Denunciar Irregularidade).

The footer reinforces that **CityHero is a tool for accountability**,
not a substitute for the official channels — it routes to them.

## Acceptance Criteria

### Scenario · Default render

**Given** the user scrolled to the bottom
**When** the footer renders
**Then** a short educational paragraph appears in slate-600
**And** below: a primary CTA button "🛡️ Denunciar irregularidade" in a brand-tinted variant

### Scenario · Tap the CTA

**Given** the user wants to file an irregularity report
**When** they tap the button
**Then** the app navigates to SCREEN 24 (Denunciar Irregularidade)
**And** the entry context is preserved (e.g., "from_programs_hub") for analytics

### Scenario · Educational content links

**Given** the paragraph mentions external sources (Portal da Transparência)
**When** rendered
**Then** the source names are styled as links
**And** tapping opens the source in the OS browser

### Scenario · Footer always visible at end of scroll

**Given** the user scrolls past the programs grid
**When** they reach the end
**Then** the footer is visible without extra interaction
**And** below the footer, sufficient bottom padding accommodates the bottom nav

### Scenario · Localization

**Given** en-US
**When** the footer renders
**Then** copy is in English ("CityHero connects public data... Report to the relevant authorities when something looks wrong.")

### Scenario · Accessibility

**Given** SR is on
**When** the footer is read
**Then** the paragraph is announced as a region
**And** the CTA is clearly labeled with its destination

## Frontend

```
apps/city-hero/src/screens/Programs/
└── components/
    ├── ControleSocialFooter.tsx
    └── DenunciarCtaButton.tsx
```

## Backend

Not applicable for this task.

## Database

Not applicable.

## Edge Cases

- **External link unavailable**: visited in the user's browser; the app doesn't block.
- **CTA on small screens**: stretches edge-to-edge with padding.

## Privacy / LGPD

The educational content explains how the user can take action; the actual report is filed at the official channels (CityHero doesn't store it).

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `programs.footer_rendered`         | Footer mounted                             | —                                     |
| `programs.denunciar_pressed`       | User tapped the CTA                        | `from: programs_hub`                  |
| `programs.external_link_pressed`   | User tapped a source link                  | `url`                                 |

## Tests

- **Unit**: footer + CTA render; links open.
- **Snapshot**: light + dark.
- **A11y**: region + button labeled.

## Definition of Done

- [ ] ControleSocialFooter component
- [ ] DenunciarCtaButton
- [ ] Localized copy
- [ ] External link handling
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

- Cross-cutting: `docs/engineering/`
- Denunciar Irregularidade screen (destination): `docs/tasks/24-irregularity-report/`
- `CLAUDE.md`

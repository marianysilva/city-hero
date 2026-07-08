# Bolsa Família · Transparency notes + Denunciar CTA

> **Type:** Screen feature · UI + content + compliance
> **Screen:** SCREEN 23 · Bolsa Família Detail
> **Effort:** S (≤1 day)
> **Dependencies:** `23-bolsa-familia-detail/01-render-bolsa-ui-base.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `lgpd`, `accountability`

## Context

A short educational block explaining what's public (per STF MS 36.020/2020) and what's protected (LGPD), with links to the relevant laws. Below it, a primary CTA "🛡️ Denunciar irregularidade" sits in the sticky bottom bar (per task 01's slot), pre-filling the report with the program context when the user navigates to SCREEN 24.

## Acceptance Criteria

### Scenario · Default render

**Given** the user scrolled to the bottom
**When** the section renders
**Then** a small "TRANSPARÊNCIA" label
**And** a short paragraph: "O cadastro do Bolsa Família é público (STF MS 36.020/2020). Os valores individuais são protegidos pela LGPD. Mostramos só dados agregados."
**And** links to the law references (STF + LGPD)

### Scenario · Tap law links

**Given** the user wants to read the laws
**When** they tap a link
**Then** the OS browser opens the canonical source

### Scenario · Denunciar CTA

**Given** the user wants to file an irregularity report
**When** they tap the sticky bottom CTA
**Then** the app navigates to SCREEN 24 (Denunciar Irregularidade)
**And** the destination receives `program=bolsa_familia` as pre-fill context

### Scenario · Localization

**Given** en-US
**When** rendered
**Then** copy translates with English-language law references where applicable

### Scenario · Accessibility

**Given** SR is on
**When** the section + CTA are read
**Then** the law references are announced as links
**And** the CTA is clearly labeled with destination

## Frontend

```
apps/city-hero/src/screens/BolsaFamiliaDetail/
└── components/
    ├── TransparencyNotes.tsx
    └── DenunciarBottomCta.tsx
```

The Denunciar CTA reuses the shared pattern from SCREEN 22's footer.

## Backend

Not applicable.

## Database

Not applicable.

## Edge Cases

- **Future law updates**: keep the canonical URLs in a small config so they're easy to update.

## Privacy / LGPD

The notes themselves are a transparency device — they explain to the user what's happening with data.

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `bolsa_familia.transparency_rendered` | Section mounted                         | —                                     |
| `bolsa_familia.law_link_pressed`   | User tapped a law reference               | `which`                               |
| `bolsa_familia.denunciar_pressed`  | User tapped the CTA                        | —                                     |

## Tests

- **Unit**: section + CTA render; links open; navigation passes context.
- **Snapshot**: light + dark.
- **A11y**: links labeled; CTA destination clear.

## Definition of Done

- [ ] TransparencyNotes component
- [ ] DenunciarBottomCta wiring
- [ ] Localized copy
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

- Cross-cutting: `docs/engineering/`
- Denunciar screen (destination): `docs/tasks/24-irregularity-report/`
- STF MS 36.020/2020 (canonical URL)
- LGPD (Lei 13.709/2018)
- `CLAUDE.md`

# Anonymous Send · Educational panels (kept benefits + LAI transparency)

> **Type:** Screen feature · UI + transparency
> **Screen:** SCREEN 11 · Anonymous Send
> **Effort:** S (≤1 day)
> **Dependencies:** `11-anonymous-send/01-render-anonymous-ui-base.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `transparency`, `lgpd`

## Context

Two educational panels presented one after the other:

1. **"O que você mantém"** — a green-tinted card with four checkmarked
   benefits the user keeps even though they submitted anonymously: XP +
   medals (no penalty), updates (push at every state change), ownership
   (only they can edit), ranking and Liga participation (counts toward
   their level).
2. **"Quem vê seu nome"** — a slate-tinted card listing the prefecture
   (legal obligation under LAI) and the user themselves in My Reports,
   contrasted with explicit "NÃO vê" chips: neighbors in the feed, link
   recipients, other heroes.

Together they convert "wait, what does anonymous mean here?" into a
clear understanding in a few seconds.

## User Story

**As a** Citizen choosing anonymous mode,
**I want** to understand what I keep and who sees my real name,
**In order to** trust the choice and not have to read a long policy.

## Acceptance Criteria

### Scenario · "O que você mantém" card

**Given** the user is on the screen
**When** the kept-benefits card renders
**Then** the card uses a green/teal gradient background
**And** the section label reads "O QUE VOCÊ MANTÉM" in small caps
**And** four benefits appear in a 2×2 grid: "XP e medalhas (sem penalidade)", "Atualizações (push a cada mudança)", "Titularidade (só você edita)", "Ranking e Liga (conta pro seu nível)"
**And** each item has a small green check icon

### Scenario · "Quem vê seu nome" card

**Given** the user is on the screen
**When** the visibility card renders
**Then** the card uses a slate-tinted background
**And** the section label reads "QUEM VÊ SEU NOME" in small caps
**And** the "vê" section lists: Prefeitura (with "obrigação legal · LAI" note) and Você (with "em Meus Reportes" note)
**And** a divider separates the "NÃO vê" section with chips: Vizinhos no feed, Quem receber o link, Outros heróis

### Scenario · LAI link

**Given** the user taps the "LAI" note
**When** the action runs
**Then** a small sheet expands explaining LAI (Lei 12.527/2011): what it requires, why the prefecture has access, and where to read more
**And** dismissing returns to the screen state

### Scenario · Localization

**Given** the user's language is en-US
**When** the panels render
**Then** copy is in English ("What you keep" / "Who sees your name" / "Doesn't see")
**And** LAI is explained as the Brazilian equivalent of FOIA — the user gets context

### Scenario · Order

**Given** the screen renders
**When** the user scrolls
**Then** the panels appear in this order: feed preview (task 03) → kept benefits → who sees name → share UX (task 05) → reversibility (task 06)
**And** the order is consistent with the prototype

### Scenario · Accessibility

**Given** screen reader is on
**When** the user navigates the panels
**Then** each card is a region with a heading label
**And** the items are read as a list
**And** the "NÃO vê" section is clearly distinguished from "vê"

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/AnonymousSend/
└── components/
    ├── KeptBenefitsPanel.tsx
    └── WhoSeesYourNamePanel.tsx
```

### Component behavior

- Both panels are presentational and content is hard-coded (translated via i18n keys).
- The "LAI" note tap opens a `LaiExplainerSheet` (small bottom sheet, reusable elsewhere — e.g., the identification toggle's first-time hint can also link to this sheet).

### Content keys

The bullets and labels are i18n keys to support pt-BR and en-US. Future cities (or languages) can change copy without touching layout.

## Backend

Not applicable.

## Database

Not applicable.

## Edge Cases

- **Future categories of access** (e.g., audit roles): a small footnote could mention "audit logs" without surprising the user.
- **Long copy in en-US** (English is often shorter than Portuguese, but not always): layout adapts gracefully.

## Privacy / LGPD

This task is **part of** the LGPD compliance signal: by being transparent about who sees what, the app respects users' informed consent. The LAI mention is critical — anonymity is bounded by Brazilian law and users should know.

## Analytics

| Event                                 | When               | Props |
| ------------------------------------- | ------------------ | ----- |
| `anonymous_send.lai_explainer_opened` | User taps LAI note | —     |

## Tests

- **Unit**: both panels render their full content; localization respected.
- **Integration**: LAI sheet opens and closes correctly.
- **A11y**: regions and lists announced correctly.

## Definition of Done

- [ ] KeptBenefitsPanel and WhoSeesYourNamePanel components
- [ ] LaiExplainerSheet (reusable)
- [ ] Localized strings
- [ ] Telemetry event
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Coding: `docs/engineering/coding-standards.md`
- Testing: `docs/engineering/testing-strategy.md`

### Project context

- Render UI base: `01-render-anonymous-ui-base.md`
- Identification toggle (also references LAI): `10-report-confirm/06-identification-toggle.md`
- Lei 12.527/2011: https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2011/lei/l12527.htm
- `CLAUDE.md`

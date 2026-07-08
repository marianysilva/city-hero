# NPS Feedback · Celebration hero

> **Type:** Screen feature · UI
> **Screen:** SCREEN 15 · NPS Feedback
> **Effort:** S (≤1 day)
> **Dependencies:** `15-nps-feedback/01-render-nps-ui-base.md`, `14-detail-ticket/02-before-after-slider.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ui`

## Context

A small celebration card at the top of the scroll area. It contains:

- A **mini before/after slider** (a compact version of the one on
  SCREEN 14) with an "ANTES → DEPOIS" pill.
- A small "Resolvido em N dias" label in emerald.
- A friendly headline ("Seu buraco virou asfalto ✨") composed from the
  category.
- A small subtitle with the address and protocol number.

This card anchors the user in the win — they see the actual change
before being asked to rate it.

## User Story

**As a** Citizen about to rate a resolution,
**I want** to see the actual change first,
**In order to** ground my rating in what really happened.

## Acceptance Criteria

### Scenario · Default render

**Given** the report has both anonymized photos
**When** the hero renders
**Then** a compact card with rounded corners and a soft shadow appears
**And** the before/after slider fills the top portion of the card (smaller than SCREEN 14's hero)
**And** an "ANTES → DEPOIS" pill is in the slider's top-left
**And** below the slider: "Resolvido em N dias" in emerald, the composed headline, and the subtitle

### Scenario · Composed headline per category

**Given** the category is "Buraco" (or "Iluminação", etc.)
**When** the headline renders
**Then** the text uses a small client-side compose function (shared with `12-heroes-league/04`):

- Buraco → "Seu buraco virou asfalto ✨"
- Iluminação → "Seu poste tá brilhando de novo 💡"
- Lixo → "Sua rua tá limpa de novo ♻️"
- Pichação → "Sua parede voltou ao normal 🎨"
- Etc.
  **And** the headlines are localized for en-US

### Scenario · One photo missing or anonymizing

**Given** the "depois" photo is missing or anonymizing
**When** the hero renders
**Then** the same fallback states from `14-detail-ticket/02` apply
**And** if both photos missing, a category-emoji placeholder replaces the slider

### Scenario · Visitor (not the reporter)

**Given** the user is rating someone else's report
**When** the headline renders
**Then** the headline uses neutral framing ("O buraco virou asfalto ✨") rather than possessive ("Seu buraco…")
**And** the rest of the card behaves identically

### Scenario · Resolution duration

**Given** the resolution took N days
**When** the duration label renders
**Then** it formats compactly ("Resolvido em 18 dias" / "Resolvido em 1 semana" / "Resolvido em < 1 dia")
**And** very fast resolutions (< 6h) get an emphasis ("⚡ Resolvido em 4h")

### Scenario · Tap the slider

**Given** the slider is interactive
**When** the user drags or taps to toggle
**Then** the behavior matches `14-detail-ticket/02` (reused component with compact props)
**And** state is local to this view (not persisted)

### Scenario · Accessibility

**Given** screen reader is on
**When** the hero is read
**Then** the headline is announced as a heading
**And** the resolution duration is announced
**And** the slider has the same accessibility patterns as SCREEN 14

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/NpsFeedback/
└── components/
    └── CelebrationHero.tsx
```

### Component behavior

- `CelebrationHero` accepts the report's data (photos, address, protocol, resolved_at, created_at, category).
- It composes the headline using a small client-side utility (shared with `12-heroes-league/04` and other surfaces).
- The before/after slider is the same component from `14-detail-ticket/02`, configured with a `size: 'compact'` prop.

### Headline source

A shared `composeResolutionHeadline(category)` function lives in a small utility module accessible to both this screen and the Liga share preview.

## Backend

Not applicable. Data is read from the report's existing record.

## Database

Not applicable directly.

## Edge Cases

- **Category with no specific headline**: a default "Problema resolvido ✨" applies.
- **Resolution duration is suspiciously short** (rare): the duration label still shows accurately.
- **Both photos identical**: same edge case as `14-detail-ticket/02`.

## Privacy / LGPD

Same as SCREEN 14 — only anonymized photos are shown.

## Analytics

| Event               | When         | Props                                                       |
| ------------------- | ------------ | ----------------------------------------------------------- |
| `nps.hero_rendered` | Hero mounted | `had_both_photos: bool`, `category`, `duration_days_bucket` |

## Tests

- **Unit**: headline composes per category; duration formatting; visitor vs owner framing; missing-photo fallback.
- **Snapshot**: with both photos, missing depois, anonymizing state.
- **A11y**: announcements verified.

## Definition of Done

- [ ] CelebrationHero component
- [ ] composeResolutionHeadline utility
- [ ] Compact-mode before/after slider integration
- [ ] Duration formatter (shared)
- [ ] Localized headlines
- [ ] Telemetry event
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Coding: `docs/engineering/coding-standards.md`
- Architecture (shared utilities): `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Project context

- Render UI base: `01-render-nps-ui-base.md`
- Before/after slider (reused): `14-detail-ticket/02-before-after-slider.md`
- Headline compose (shared): `12-heroes-league/04-shareable-preview-card.md`
- `CLAUDE.md`

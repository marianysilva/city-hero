# Anonymous Send · Anonymous feed preview card

> **Type:** Screen feature · UI + transparency
> **Screen:** SCREEN 11 · Anonymous Send
> **Effort:** S (≤1 day)
> **Dependencies:** `11-anonymous-send/01-render-anonymous-ui-base.md`, `07-civic-feed/03-feed-item-card.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `transparency`, `lgpd`

## Context

A read-only preview showing exactly **how the report appears in the
public feed** under anonymous mode. The user sees the 🥷 avatar, "Herói
Anônimo" label, the anonymized photo, the address (truncated), and a
small "MODERADO" badge if applicable. This transparency anchors the
LGPD claim — "we're not just saying it's anonymous, here's exactly
what they see".

The preview reuses the feed card component (`07-civic-feed/03`) so
visual consistency with the actual feed is guaranteed.

## User Story

**As a** Citizen worried about exposure,
**I want** to see exactly how my report appears to neighbors,
**In order to** verify my identity is hidden.

## Acceptance Criteria

### Scenario · Default render

**Given** the user is on the screen
**When** the preview card renders
**Then** a small label appears above: "Como aparece no feed público"
**And** the card uses the anonymous variant of the feed card (🥷 avatar, "Herói Anônimo" label)
**And** the address shows truncated ("R. São Pedro, 320 · há 1 min")
**And** the photo (anonymized) shows scaled down
**And** action counters appear at 0 ("👍 0 apoios · 💬 0 · aberto")

### Scenario · Moderation badge

**Given** the report was held for moderation (anti-fraud flags from `10-report-confirm/08`)
**When** the preview renders
**Then** a small amber "MODERADO" badge appears in the card's header
**And** a hint below explains "Em revisão · seu reporte vai aparecer pra todos quando aprovar"

### Scenario · Photo still anonymizing

**Given** the anonymization pipeline hasn't completed yet
**When** the preview renders
**Then** the photo area shows a "Anonimizando…" state
**And** the card otherwise behaves the same way
**And** the preview updates when the pipeline completes

### Scenario · No photo

**Given** the report has no photo (manual report path)
**When** the preview renders
**Then** the photo area shows a category emoji placeholder
**And** the rest of the card is unchanged

### Scenario · Read-only

**Given** the user taps the preview card
**When** the action is handled
**Then** the card is non-interactive — no support, no comment, no share is triggered
**And** the entire surface is intentionally non-tappable (this is a visualization, not a real card)

### Scenario · Localization

**Given** the user's language is en-US
**When** the preview renders
**Then** "Como aparece no feed público" is "How it appears in the public feed"
**And** "Herói Anônimo" is "Anonymous Hero"

### Scenario · Accessibility

**Given** screen reader is on
**When** the preview is read
**Then** the section label is announced as a heading
**And** the card's content is read as a group ("Anonymous Hero, R. São Pedro 320, 1 minute ago, anonymized photo, 0 supports")
**And** the preview clearly indicates it's a visualization, not a live card

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/AnonymousSend/
└── components/
    └── AnonymousFeedPreview.tsx
```

The component wraps the shared `FeedCard` from `07-civic-feed/03` with `isAnonymous: true`, `interactive: false`, and synthetic data assembled from the new report's metadata.

### Behavior

- The component receives the report's data (or a subset suitable for preview).
- It assembles a `FeedCard`-compatible object and renders it.
- All callbacks (support, comment, share, enrich) are no-ops here.
- A small annotation explains "this is what neighbors will see".

### Photo source

The preview shows the **anonymized** photo (or the placeholder during anonymization). It never shows the raw photo.

## Backend

This task doesn't introduce backend endpoints. The data comes from the
submit response or a quick fetch of the new report's lightweight
summary (`/api/v1/reports/{id}/summary` from `08-camera-live/09`).

## Database

No new schema.

## Edge Cases

- **Address reverse-geocoding still loading**: show raw coords or a placeholder.
- **The feed card component evolves later**: the preview automatically reflects changes — by design.
- **Theme mismatch**: the preview always uses the feed's actual theme so the user sees an honest representation.

## Privacy / LGPD

- This is one of the strongest LGPD trust signals — the user verifies their identity is masked.
- The preview never displays the user's name or avatar, only the anonymous variant.
- The anonymized photo is the only photo shown.

## Analytics

| Event                             | When         | Props                                     |
| --------------------------------- | ------------ | ----------------------------------------- |
| `anonymous_send.preview_rendered` | Card mounted | `had_photo: bool`, `had_moderation: bool` |

## Tests

- **Unit**: renders correctly with photo, without photo, anonymizing state; moderation badge.
- **Integration**: actions are no-ops; tapping doesn't navigate.
- **A11y**: announced as a visualization; group reading.

## Definition of Done

- [ ] AnonymousFeedPreview component
- [ ] Reuses FeedCard with anonymous + non-interactive props
- [ ] Photo states handled (anonymized / anonymizing / placeholder)
- [ ] Moderation badge state
- [ ] Telemetry event
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Coding: `docs/engineering/coding-standards.md`
- Testing: `docs/engineering/testing-strategy.md`

### Project context

- Render UI base: `01-render-anonymous-ui-base.md`
- Feed card (reused): `07-civic-feed/03-feed-item-card.md`
- Anonymization pipeline: `00-foundation/08-anonymization-pipeline.md`
- `CLAUDE.md`

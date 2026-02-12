# Heroes League · Shareable preview card

> **Type:** Screen feature · UI + transparency
> **Screen:** SCREEN 12 · Heroes League
> **Effort:** M (1-2 days)
> **Dependencies:** `12-heroes-league/01-render-league-ui-base.md`, `07-civic-feed/07-compartilhar-action.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `growth`

## Context

A mockup card that simulates exactly **how the shared link will appear**
in WhatsApp / iMessage / X — showing the photo with category chip, a
"Buraco urgente na R. São Pedro" headline (server-generated for
shareability), the user's quoted description, attribution
("Reportado por João · Guardião de Pôrto Belo · agora"), and a
brand-colored URL band ("cityhero.app/r/2847") with an "Apoiar" call to
action. The preview reassures the user that what they share is
beautiful and professional, not raw.

This is a copy of the OpenGraph card the web fallback page renders, so
**fidelity matters** — the preview must match the actual link preview
recipients will see.

## User Story

**As a** Citizen about to share,
**I want** to see exactly how my shared link will look,
**In order to** feel confident I'm sharing something polished.

## Acceptance Criteria

### Scenario · Default render

**Given** the screen renders
**When** the preview section appears
**Then** a small label "Prévia do compartilhamento" appears above
**And** a card with rounded corners, a soft shadow, and a slate-100 border is shown
**And** the card contains: a photo (anonymized) at the top, the headline, the user's description quote, attribution with avatar + "Guardião de Pôrto Belo · agora", and a dark URL band with "cityhero.app/r/{id}" and an "Apoiar" pill

### Scenario · Photo overlay chips

**Given** the report has a category and severity
**When** the preview's photo area renders
**Then** a small category chip ("🕳️ BURACO · MODERADO") appears at the top-left
**And** an address chip ("📍 R. São Pedro, 320 · Pôrto Belo") appears at the bottom-left

### Scenario · Headline source

**Given** the headline needs to be generated
**When** the preview renders
**Then** the headline comes from a server-side compose function (based on category, severity, and address — kept generic and respectful)
**And** the headline is **not** the user's raw description (descriptions can be informal; the headline is the polished public version)

### Scenario · Description quote

**Given** the user wrote a description in the confirm screen
**When** the preview renders
**Then** the description is shown in italic ("Já furou pneu de 2 motos hoje…")
**And** truncated to ~2 lines if long

### Scenario · No description

**Given** the user didn't write a description
**When** the preview renders
**Then** the description area is omitted (the card adjusts cleanly)

### Scenario · Attribution

**Given** the report is identified (this screen only handles identified)
**When** the preview renders
**Then** the user's first name and current level title appear ("João · Guardião de Pôrto Belo")
**And** a small avatar with their initial is shown

### Scenario · URL band

**Given** the URL band renders
**When** the user looks at it
**Then** the URL "cityhero.app/r/{id}" is shown with the brand mascot/icon
**And** the "Apoiar" pill provides the call to action

### Scenario · Photo still anonymizing

**Given** anonymization hasn't completed
**When** the preview renders
**Then** the photo area shows an "Anonimizando…" state
**And** the rest of the card is still legible

### Scenario · Read-only

**Given** the preview is rendered
**When** the user taps it
**Then** the entire card is non-interactive (this is a visualization, not the live link)
**And** the share buttons (task 05) are what actually triggers the share

### Scenario · Fidelity to web fallback

**Given** the web fallback page renders an OG preview
**When** comparing the preview here with the actual preview in WhatsApp
**Then** they match visually (headline, photo, URL band, colors)
**And** any divergence is treated as a bug

### Scenario · Accessibility

**Given** screen reader is on
**When** the section is read
**Then** the label is announced as a heading
**And** the card is announced as a visualization (not interactive)
**And** the card's content is read in order

## Frontend (React Native)

### Where it lives

```
apps/mobile/src/screens/HeroesLeague/
└── components/
    └── ShareablePreviewCard.tsx
```

### Component behavior

- The component receives the report's data (category, severity, address, anonymized photo URL, headline, description, user profile) and renders the card.
- The headline can be passed in from the report record or computed on the client; the canonical source is the backend's compose function.
- All sub-elements are presentational and reuse styles from the design system.

### Headline compose function (concept)

A small client+server utility that composes the headline based on:

- Category (e.g., "Buraco")
- Severity (e.g., "Moderado")
- Address core (e.g., "R. São Pedro")

Producing strings like "Buraco urgente na R. São Pedro" or "Iluminação apagada na Av. Atlântica". The function lives in a shared package so client preview and server OG tags use the same logic.

## Backend (FastAPI)

The web fallback page (per `07-civic-feed/07`) reads the report and renders the OG tags using the same headline compose logic. The endpoint that powers both is the public summary endpoint (`/api/v1/public/reports/{id}`).

The fallback page's OG image is the anonymized photo with the same chip overlays applied. (For MVP, a basic OG image is acceptable; a richer composer comes later.)

## Database

No new schema. The report's existing fields power the preview.

## Edge Cases

- **User's level title (e.g., "Guardião de Pôrto Belo") changed since submit** (rare): the preview reads the current title, but the actual web fallback uses the version at the time of share.
- **Address truncation on small screens**: graceful truncation with ellipsis.
- **Headline misaligned with actual OG**: a contract test in CI compares the two sources.

## Privacy / LGPD

The preview here is the **identified** version — the user's first name and level title appear. This matches what recipients will see for an identified report. (Anonymous-mode preview lives in `11-anonymous-send/03`.)

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `league.preview_card_rendered`     | Card mounted                               | `report_id`, `had_description: bool` |

## Tests

- **Unit**: renders with/without description; truncation works; anonymization state.
- **Snapshot**: identified variant.
- **Contract test**: headline compose matches the server's logic for the same inputs.
- **A11y**: section announced; card as visualization.

## Definition of Done

- [ ] ShareablePreviewCard component
- [ ] Headline compose utility (shared between client and server)
- [ ] OG image generation contract on the fallback page
- [ ] Telemetry event
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Coding: `docs/engineering/coding-standards.md`
- Architecture (shared compose logic): `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references
- OpenGraph protocol: https://ogp.me/

### Project context
- Render UI base: `01-render-league-ui-base.md`
- Share service (used downstream): `07-civic-feed/07-compartilhar-action.md`
- Deep link handler: `00-foundation/12-deep-link-handler.md`
- Anonymous variant (sibling screen): `11-anonymous-send/03-feed-preview-card.md`
- `CLAUDE.md`

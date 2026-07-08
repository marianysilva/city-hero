# My Reports · Bridge card to Programs & Transparency

> **Type:** Screen feature · UI + growth
> **Screen:** SCREEN 16 · My Reports
> **Effort:** S (≤1 day)
> **Dependencies:** `16-my-reports/01-render-my-reports-ui-base.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `growth`

## Context

A dark slate-to-teal gradient card at the bottom of the scroll area
inviting the user to explore **Programs & Transparency** (SCREEN 22).
The card uses a 🕵️ icon, a small "ENQUANTO ISSO" kicker, a headline
("Dá uma olhada no que a prefeitura anda fazendo"), and a small stat
line ("11 programas · R$ 18,4M monitorados").

It's contextual discovery — the user is on a "wait" screen (checking
their reports), and this surface gives them something productive to do
while waiting for prefecture responses. Unlike the home discovery card
(`06-home-map/07`), this one is **always visible** (not dismissible)
because it's offering a related path, not a one-time tip.

## User Story

**As a** Citizen waiting for prefecture responses,
**I want** a suggestion of what else I can explore,
**In order to** stay engaged and informed.

## Acceptance Criteria

### Scenario · Default render

**Given** the user is on the screen
**When** the bridge card renders below the list (or below the empty state)
**Then** a dark slate-to-teal gradient card appears
**And** a 🕵️ icon on the left
**And** a small "ENQUANTO ISSO" kicker in uppercase
**And** the headline "Dá uma olhada no que a prefeitura anda fazendo" in white extrabold
**And** a small stat line "11 programas · R$ 18,4M monitorados" in muted white
**And** a → arrow on the right

### Scenario · Tap the card

**Given** the user taps it
**When** the action runs
**Then** the app navigates to SCREEN 22 (Programs & Transparency)
**And** light haptic feedback fires

### Scenario · Always visible (not dismissible)

**Given** the user might want to dismiss
**When** they look for a × button
**Then** there is **none**
**And** the card is always present as part of the screen's natural flow

### Scenario · Stat numbers come from a live config

**Given** the prefecture's program count or budget changes
**When** the card renders
**Then** the numbers reflect the current config (read from a small remote source or a stale cache)
**And** if the source fails, fallback to soft copy without specific numbers ("Explore o que tá rolando")

### Scenario · Per-city customization

**Given** different cities have different program counts
**When** the user is in a specific city
**Then** the card's stats reflect that city
**And** the rest of the card is identical

### Scenario · Localization

**Given** the user's language is en-US
**When** the card renders
**Then** copy is in English ("Meanwhile", "Take a look at what the city is doing", "11 programs · R$ 18.4M monitored")

### Scenario · Accessibility

**Given** screen reader is on
**When** the card is focused
**Then** it's announced as a button with the kicker, headline, and stats
**And** activating it announces the destination

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/MyReports/
└── components/
    └── BridgeCardToPrograms.tsx
```

### Component behavior

- The card reads program stats from a small data hook (`useCityPrograms`) or a remote config.
- It's purely presentational beyond that read.
- Tap callback navigates to SCREEN 22.

## Backend

### Optional endpoint

| Method | Path                                              | Purpose                                |
|--------|---------------------------------------------------|----------------------------------------|
| GET    | `/api/v1/cities/{id}/programs/summary`            | Returns count + total budget          |

For MVP, this can be a static config or part of the city's general summary endpoint.

## Database

The `programs` table (defined elsewhere in the Programs flow) is the source. No new schema here.

## Edge Cases

- **Stats unavailable**: fallback copy without numbers.
- **Card overlaps with the bottom nav**: the layout ensures spacing; the bottom nav is sticky and respects the safe area.

## Privacy / LGPD

Not applicable.

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `my_reports.bridge_card_rendered`  | Card mounted                               | `had_stats: bool`                     |
| `my_reports.bridge_card_pressed`   | User tapped                                | —                                     |

## Tests

- **Unit**: renders with and without stats; tap fires callback.
- **Snapshot**: with and without stats.
- **A11y**: announced as a button with destination.

## Definition of Done

- [ ] BridgeCardToPrograms component
- [ ] Stats reading hook with fallback
- [ ] Navigation to SCREEN 22
- [ ] Localized copy
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Coding: `docs/engineering/coding-standards.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Project context
- Render UI base: `01-render-my-reports-ui-base.md`
- Programs & Transparency (destination): `docs/tasks/22-programs-transparency/`
- `CLAUDE.md`

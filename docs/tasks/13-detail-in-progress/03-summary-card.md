# Detail · In Progress · Summary card

> **Type:** Screen feature · UI + content
> **Screen:** SCREEN 13 · Detail · In Progress
> **Effort:** S (≤1 day)
> **Dependencies:** `13-detail-in-progress/01-render-detail-ui-base.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ui`

## Context

A white card overlapping the bottom of the hero with the report's
summary: title ("Poste apagado · R. Central, 45"), attribution
("Reportado por Carlos M. · há 5 dias · 120m de você"), and a 3-stat
row (Apoios, Comentários, SLA restante). The card is the user's
at-a-glance comprehension surface.

For anonymous reports, attribution reads "🥷 Herói Anônimo · há 5
dias · 120m de você" without exposing identity.

## User Story

**As a** Citizen scanning a report,
**I want** a quick summary with the title, who reported, and key stats,
**In order to** decide whether to engage or move on.

## Acceptance Criteria

### Scenario · Identified report

**Given** the report is not anonymous
**When** the summary card renders
**Then** the title appears (composed from category + address), e.g., "Poste apagado · R. Central, 45"
**And** the attribution line shows the reporter's first name, time-ago, and distance from the user ("Reportado por Carlos M. · há 5 dias · 120m de você")
**And** the 3-stat row shows: Apoios (count), Comentários (count), SLA restante (e.g., "2d" amber-colored)

### Scenario · Anonymous report

**Given** the report is anonymous
**When** the summary renders
**Then** the attribution becomes "🥷 Herói Anônimo · há 5 dias · 120m de você"
**And** no name is shown anywhere on the card
**And** the rest of the card behaves identically

### Scenario · SLA color cues

**Given** the SLA remaining count
**When** rendered
**Then** if > 3 days remain, the SLA cell uses slate text
**And** if 1–3 days, it uses amber
**And** if overdue (negative), it uses rose with an "atrasado" label

### Scenario · Real-time stat updates

**Given** apoios or comentários change in real time
**When** the WebSocket delivers
**Then** the stat counter updates with a subtle pulse animation
**And** the SLA recomputes when the prefecture posts a milestone (timeline event)

### Scenario · Distance computation

**Given** the user has location permission and a fresh fix
**When** distance is computed
**Then** the distance is the Haversine between the user's location and the report's geo, formatted compactly (e.g., "80m", "1.2km", "8km")
**And** if the user has no location, "—" replaces the distance

### Scenario · Title composition

**Given** the report has category and address
**When** the title renders
**Then** it uses a small client-side compose helper (shared with the share preview from `12-heroes-league/04`)
**And** the title is consistent across surfaces (feed card subtitle, share preview, etc.)

### Scenario · Reporter is the current user

**Given** the user is the report's owner
**When** the card renders
**Then** the attribution shows "Você reportou · há 5 dias" instead of their own first name
**And** subsequent UI (timeline, comments) doesn't change behaviorally — just this attribution string

### Scenario · Long title or address

**Given** the title or address is long
**When** the card renders
**Then** the title truncates after two lines with ellipsis
**And** the attribution truncates after one line

### Scenario · Localization

**Given** the user's language is en-US
**When** the card renders
**Then** "Apoios" is "Supports", "Comentários" is "Comments", "SLA restante" is "SLA left"
**And** distance units stay metric (Brazilian default)

### Scenario · Accessibility

**Given** screen reader is on
**When** the card is read
**Then** the title is announced as a heading
**And** the attribution is read in order
**And** the stat row is read as a group ("47 supports, 12 comments, 2 days SLA left")

## Frontend (React Native)

### Where it lives

```
apps/mobile/src/screens/DetailInProgress/
└── components/
    ├── SummaryCard.tsx
    └── StatsRow.tsx
```

### Component behavior

- `SummaryCard` receives the report's data and the current user's location (for distance).
- `StatsRow` is a small reusable component with three stat cells.
- The title compose function is shared with the share preview card (`12-heroes-league/04`).

### Data sources

- Title: computed from `category` + `address`.
- Attribution: from `reporter_name` (if not anonymous), `created_at`, and computed distance.
- Stats: `support_count`, `comment_count`, `sla_remaining_hours` (server provides).

## Backend (FastAPI)

The report-detail endpoint includes the fields needed:

- `support_count`, `comment_count`, `sla_remaining_hours`, `address`, `category`, `geo`, `reporter_name` (null when anonymous), `created_at`, `is_owner_of_request_user`.

No new endpoint; this is the shape of `/api/v1/reports/{id}` defined in the report-creation flow.

## Database

No new schema. SLA fields are computed at query time from the report's timeline (or persisted for performance).

## Edge Cases

- **Distance is very small** (<10m): show "Aqui" instead of a literal "5m" to feel natural.
- **Distance is very large** (>50km): show "Muito longe" or the exact value depending on UX preference; for MVP, show the value.
- **Reporter deleted their account**: the card shows "Cidadão removido" without breaking layout.

## Privacy / LGPD

- For anonymous reports, no name is shown.
- Distance is computed client-side; no transmission of the user's coordinates here.

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `detail_in_progress.summary_rendered` | Card mounted                            | `is_owner: bool`, `is_anonymous: bool` |

## Tests

- **Unit**: title compose; attribution variants (identified, anonymous, owner, deleted reporter); SLA color buckets.
- **Snapshot**: each variant.
- **A11y**: announcements verified.

## Definition of Done

- [ ] SummaryCard component
- [ ] StatsRow component
- [ ] Title compose function (shared)
- [ ] SLA color cues
- [ ] Real-time stat updates wired
- [ ] Localized labels
- [ ] Telemetry event
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Coding: `docs/engineering/coding-standards.md`
- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Project context
- Render UI base: `01-render-detail-ui-base.md`
- Title compose (shared with): `12-heroes-league/04-shareable-preview-card.md`
- Real-time updates: `06-home-map/08-realtime-pin-updates.md`
- `CLAUDE.md`

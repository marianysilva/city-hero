# Detail · In Progress · Timeline

> **Type:** Screen feature · UI + content
> **Screen:** SCREEN 13 · Detail · In Progress
> **Effort:** M (1-2 days)
> **Dependencies:** `13-detail-in-progress/01-render-detail-ui-base.md`, `00-foundation/05-api-client.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `backend`, `database`, `screen`, `trust`

## Context

The "Trajeto do ticket" card — a vertical timeline of every state
transition with timestamps and prefecture context. Each entry has a
colored dot (matching the state), a title, a date+time, and a
sub-context (who did what). Future steps appear muted with placeholder
dates ("Aguardando", "Previsto até 22/04").

This is the **trust device** of the entire screen: it makes the
prefecture's responsiveness visible, validates that the city is doing
work, and gives the citizen the satisfaction of seeing their report
progress through a real pipeline (vs disappearing into a black box).

## User Story

**As a** Citizen who reported a problem,
**I want** to see every step the prefecture is taking,
**In order to** trust that my report isn't being ignored.

## Acceptance Criteria

### Scenario · Default render

**Given** the report has multiple completed timeline entries
**When** the card renders
**Then** the section label "TRAJETO DO TICKET" appears on the left, protocol number on the right
**And** each completed entry shows: a colored dot, title, date/time, sub-context, connected to the next by a thin line
**And** future entries appear muted (slate dot, slate text) with placeholder dates ("Aguardando", "Previsto até …")

### Scenario · Active "scheduled" entry

**Given** an entry is currently scheduled (e.g., "Agendado para reparo · Amanhã 14:00")
**When** it renders
**Then** the dot pulses gently
**And** an "AGENDADO" pill appears next to the title
**And** the row uses slightly stronger emphasis than other completed entries

### Scenario · Real-time entry added

**Given** the user is on the screen
**When** the WebSocket pushes a new timeline event
**Then** the new entry slides in at the right position
**And** the future placeholder it replaces fades out
**And** a brief celebratory pulse on the dot draws attention

### Scenario · Standard entries (state machine)

**Given** the report's state machine
**When** the timeline renders all expected entries
**Then** the sequence is, in order: "Reporte enviado" → "Triagem pela IA" → "Chamado aberto na prefeitura" → "Resposta da prefeitura" → "Agendado para reparo" → "Em execução" → "Resolvido"
**And** each entry uses its category dot color (slate for sent, sky for IA, indigo for opened, emerald for response, amber for scheduled, blue for execution, green for resolved)

### Scenario · Non-standard or extra entries

**Given** the prefecture adds an ad-hoc note (e.g., "Equipe redirecionada por chuva")
**When** the timeline renders
**Then** the note appears in the correct chronological position with a neutral slate-violet dot
**And** the layout adapts cleanly

### Scenario · Tap for more

**Given** an entry has additional context (e.g., a long internal note)
**When** the user taps the entry
**Then** a sheet expands with the full details
**And** dismissing returns to the screen

### Scenario · Delays and SLAs visible

**Given** the SLA has been exceeded for a given step
**When** the timeline renders
**Then** the next-expected entry shows a small "atrasado" / "delayed" indicator
**And** the SLA badge in the summary card (task 03) reflects this in rose

### Scenario · Reporter saw nothing yet

**Given** only the user's own "Reporte enviado" is complete; the rest is future
**When** the timeline renders
**Then** the first dot is the user's submit (with the user's name or "Você")
**And** the rest of the entries appear muted with "Aguardando…"
**And** an explanatory line reads "A prefeitura ainda não respondeu — você será notificado"

### Scenario · Accessibility

**Given** screen reader is on
**When** the user navigates the timeline
**Then** each entry is read as a list item with its title, date, and sub-context
**And** the protocol number is announced
**And** the active scheduled entry is announced with its pill ("Scheduled for tomorrow 2pm")

## Frontend (React Native)

### Where it lives

```
apps/mobile/src/screens/DetailInProgress/
└── components/
    ├── TimelineCard.tsx
    ├── TimelineEntry.tsx
    └── EntryDetailSheet.tsx
```

### Component behavior

- `TimelineCard` renders the section with the title and protocol.
- `TimelineEntry` is a presentational item with the dot, title, date, sub-context, and optional pill.
- `EntryDetailSheet` is the expanded view shown on tap.
- The timeline subscribes to real-time updates via the React Query cache.

### Data shape

Each entry has:

- `id` — UUID for stable key
- `state` — machine-readable key (e.g., `received`, `triaged`, `forwarded`, `responded`, `scheduled`, `executing`, `resolved`, `note`)
- `title` — display label (localized)
- `occurred_at` / `scheduled_for` — timestamps
- `actor` — short attribution (e.g., "Carlos M.", "Equipe de Iluminação Pública", "IA · Score 92")
- `extra` — optional long-form notes (shown in detail sheet)

## Backend (FastAPI)

### Endpoint

The timeline is part of the report-detail response:

| Method | Path                              | Purpose                              |
|--------|-----------------------------------|---------------------------------------|
| GET    | `/api/v1/reports/{id}/timeline`   | Returns the chronological events     |

This may be embedded in `/api/v1/reports/{id}` or fetched separately. For MVP, embedding is sufficient.

### State machine

The backend's report service maintains the report's state and writes timeline entries on every transition. The legacy ERP webhooks (per `features.md` § 5) can also write entries when the prefecture's internal system advances the ticket.

## Database (PostgreSQL)

### `report_timeline_events` table

| Column            | Type        | Notes                                              |
|-------------------|-------------|----------------------------------------------------|
| `id`              | UUID PK     |                                                    |
| `report_id`       | UUID FK     |                                                    |
| `city_id`         | UUID FK     | For multi-tenant indexing                          |
| `state`           | varchar(50) | Machine-readable key                              |
| `title_key`       | varchar(120)| i18n key for the title                            |
| `actor`           | text        | Display attribution                                |
| `extra`           | jsonb       | Optional long-form context                         |
| `occurred_at`     | timestamptz | Set when the event actually happened              |
| `scheduled_for`   | timestamptz | Set when a future event is scheduled              |
| `created_at`      | timestamptz |                                                    |

Indexes on `(report_id, occurred_at)` and `(city_id, state)`.

## Edge Cases

- **Entries arrive out of order** (rare in async systems): the timeline sorts by `occurred_at` (or `scheduled_for` for future).
- **Same step happens twice** (e.g., re-scheduled): both entries appear chronologically.
- **Timeline is very long** (many ad-hoc notes): the card supports vertical scrolling within itself, or expands to fill more screen height.
- **i18n key missing**: fallback to the English title or the `state` key.

## Privacy / LGPD

- Internal notes (the `extra` field) may include municipal staff info; their display follows the same anonymization rules — staff first names only, no IDs.
- Timeline access is logged for audit when staff add notes.

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `detail_in_progress.timeline_rendered` | Timeline mounted                       | `entry_count`, `current_state`       |
| `detail_in_progress.timeline_entry_tapped` | User opens detail sheet             | `state`                               |
| `detail_in_progress.timeline_realtime_event` | New entry pushed via WS           | `state`                               |

## Tests

- **Unit**: state dot color mapping; future placeholder rendering; scheduled pill; real-time entry insertion.
- **Integration**: timeline updates incrementally on WS events; tap opens sheet.
- **A11y**: list semantics announced.

## Definition of Done

- [ ] TimelineCard, TimelineEntry, EntryDetailSheet components
- [ ] State color tokens
- [ ] Backend timeline endpoint (or embedded in report detail)
- [ ] `report_timeline_events` table + Alembic migration
- [ ] Real-time event integration
- [ ] Localized titles
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Architecture (multi-tenant, real-time): `docs/engineering/architecture-patterns.md`
- Coding: `docs/engineering/coding-standards.md`
- Testing: `docs/engineering/testing-strategy.md`
- Observability: `docs/engineering/observability.md`

### Project context
- Render UI base: `01-render-detail-ui-base.md`
- Real-time updates: `06-home-map/08-realtime-pin-updates.md`
- Legacy ERP webhooks (`features.md` § 5)
- `CLAUDE.md`

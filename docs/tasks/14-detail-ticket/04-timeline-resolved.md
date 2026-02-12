# Detail · Ticket · Timeline variant (resolved)

> **Type:** Screen feature · UI + content variant
> **Screen:** SCREEN 14 · Detail · Ticket (resolved)
> **Effort:** S (≤1 day)
> **Dependencies:** `14-detail-ticket/01-render-detail-ticket-ui-base.md`, `13-detail-in-progress/04-timeline.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ui`

## Context

The timeline on the resolved-detail screen reuses the **same component**
from SCREEN 13's task 04 with these differences:

- All entries are completed (no future placeholders).
- The final entry is "Resolvido" with the prefecture's resolution
  context (e.g., "Foto 'depois' anexada").
- If the SLA was breached and the ticket was re-escalated (per
  `features.md` § 7 SLA escalation), the timeline shows extra entries
  with amber "SLA" pills documenting the escalation.

## User Story

**As a** Citizen viewing a resolved report,
**I want** the full history including escalations,
**In order to** understand the prefecture's responsiveness and any bumps along the way.

## Acceptance Criteria

### Scenario · Default render with full history

**Given** the report is resolved with a complete history
**When** the timeline renders
**Then** the section structure is identical to SCREEN 13's
**And** all entries appear with completed states (no muted placeholders)
**And** the final entry "Resolvido" has the prefecture's resolution context

### Scenario · SLA escalation entries

**Given** the original SLA expired and the system re-escalated
**When** the timeline renders
**Then** an entry like "Reenviado automaticamente · 15 dias sem resposta · escalado" appears at the right chronological position
**And** the entry has a small amber "SLA" pill
**And** subsequent entries continue normally

### Scenario · Resolution entry includes the photo

**Given** the "Resolvido" entry is rendered
**When** the user taps it
**Then** the entry-detail sheet (per SCREEN 13's task 04) expands
**And** the sheet includes the "depois" photo thumbnail as a small visual confirmation
**And** the user can tap the thumbnail to expand it inline (or scroll up to see the slider hero again)

### Scenario · Multiple resolution attempts

**Given** the report was resolved once, reopened (e.g., re-emerged), and re-resolved
**When** the timeline renders
**Then** all attempts are shown chronologically
**And** the "Resolvido" entries clearly distinguish between attempts

### Scenario · Real-time updates after resolution

**Given** the user is on the screen and the prefecture adds an ad-hoc note (e.g., a follow-up about a related issue)
**When** the WebSocket pushes the event
**Then** the new entry appears at the correct position (chronologically)
**And** the timeline reflows cleanly

### Scenario · Protocol number

**Given** the protocol number is shown in the timeline card header (same as SCREEN 13)
**When** the user views
**Then** the protocol is the same throughout the report's lifetime
**And** copying it copies the canonical identifier

### Scenario · Accessibility

**Given** screen reader is on
**When** the user navigates the timeline
**Then** entries are read in order as list items
**And** SLA pills are announced ("Re-escalated, SLA breached")

## Frontend (React Native)

### Where it lives

Reuses `TimelineCard`, `TimelineEntry`, `EntryDetailSheet` from `13-detail-in-progress/04`. This task introduces:

- A `variant: 'open' | 'resolved'` prop that controls whether future placeholders render (they're always empty for resolved).
- An extension to `TimelineEntry` to support the SLA pill and resolution photo thumbnail.

```
apps/mobile/src/screens/DetailTicket/
└── components/
    └── (reuses TimelineCard from DetailInProgress)
```

### Behavior

When `variant === 'resolved'`, the component:

- Hides the "Aguardando…" placeholder rows.
- Surfaces the SLA pill on entries that have `flagged_sla: true` metadata.
- Renders the resolution photo thumbnail in the detail sheet of the "Resolvido" entry.

## Backend

The report timeline endpoint (per `13-detail-in-progress/04`) returns the same shape. Extra metadata fields (`flagged_sla`, `resolution_photo_id`) are included when applicable.

## Database

The `report_timeline_events` table (defined in `13-detail-in-progress/04`) holds the entries. The `extra` JSON column carries the additional metadata.

## Edge Cases

- **No "Resolvido" entry but the report is marked resolved** (data inconsistency): the component shows a placeholder "Resolvido (data preliminar)" with the `resolved_at` timestamp; an alert is logged.
- **Many SLA escalations** (e.g., 3 retries): all are shown with pills; the timeline scrolls within the card.
- **Resolution photo deleted later** (rare): the detail sheet shows a placeholder; the main slider hero handles the missing case.

## Privacy / LGPD

Same as SCREEN 13's timeline; staff names are first-name only.

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `detail_ticket.timeline_rendered`  | Timeline mounted                           | `entry_count`, `had_sla_escalation: bool` |
| `detail_ticket.sla_pill_visible`   | SLA pill rendered                          | `escalation_count`                    |

## Tests

- **Unit**: variant prop suppresses future placeholders; SLA pill renders; resolution photo thumbnail in detail sheet.
- **Snapshot**: with and without SLA escalation.
- **A11y**: pills announced.

## Definition of Done

- [ ] Variant prop added to TimelineCard
- [ ] SLA pill support
- [ ] Resolution photo thumbnail in detail sheet
- [ ] Localized labels
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Coding: `docs/engineering/coding-standards.md`
- Architecture (variant pattern): `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Project context
- Render UI base: `01-render-detail-ticket-ui-base.md`
- SCREEN 13 timeline: `13-detail-in-progress/04-timeline.md`
- `features.md` § 7 SLA escalation
- `CLAUDE.md`

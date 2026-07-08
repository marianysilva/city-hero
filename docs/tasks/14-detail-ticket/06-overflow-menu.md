# Detail · Ticket · Overflow menu variant

> **Type:** Screen feature · UI + secondary actions
> **Screen:** SCREEN 14 · Detail · Ticket (resolved)
> **Effort:** S (≤1 day)
> **Dependencies:** `14-detail-ticket/01-render-detail-ticket-ui-base.md`, `13-detail-in-progress/07-overflow-menu.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ux`

## Context

The overflow menu on the resolved-detail screen reuses the component
from SCREEN 13's task 07 with these differences in the option set:

- **Enriquecer** is **hidden** (the report is resolved; adding photos
  is moot — except for very specific edge cases where the problem
  re-emerged, which the user can flag via "Reportar problema" with
  reason "Voltou a aparecer").
- **Reabrir reporte** (owner only) appears when the user believes the
  resolution didn't actually fix the issue.
- **Reportar problema** for visitors includes a new reason "Voltou
  a aparecer" / "Não foi resolvido de verdade" — feeding back into the
  moderation/reopening flow.
- The rest (Tornar anônimo/público, Editar, Excluir, Silenciar) work
  the same way.

## User Story

**As a** Citizen viewing a resolved report,
**I want** menu options that match the resolved state,
**In order to** take the right secondary action (re-open if not really fixed, etc.).

## Acceptance Criteria

### Scenario · Open menu (visitor)

**Given** the user is not the owner
**When** they tap the ⋯ button
**Then** a bottom sheet opens with: "Reportar problema (⚠️)", "Silenciar (🔇)"
**And** Enriquecer is **not** shown
**And** the Reportar problema reasons include "Voltou a aparecer" / "Não foi resolvido de verdade"

### Scenario · Open menu (owner)

**Given** the user is the owner
**When** they tap ⋯
**Then** the sheet shows: "Reabrir reporte (🔄)", "Tornar anônimo/público (🥷↔️)", "Editar (✏️)", "Excluir (🗑️)"
**And** Enriquecer is **not** shown
**And** Reabrir reporte is the first option (highlighted as the primary owner action)

### Scenario · Tap Reabrir reporte

**Given** the owner believes the resolution didn't actually fix the issue
**When** they tap Reabrir reporte
**Then** a confirmation sheet explains: "O reporte volta pra fila da prefeitura. Você pode adicionar uma foto atualizada e descrever o que ainda tá errado."
**And** confirming opens a small form: optional photo (via camera) + a brief reason (free text or pre-defined chips like "Solução não durou", "Não resolveu", "Voltou pior")
**And** submitting reopens the report (status → `in_progress`), adds a timeline entry, and notifies the prefecture

### Scenario · Reabrir cooldown

**Given** the report was just resolved (e.g., within the last hour)
**When** the user taps Reabrir
**Then** the action is gently rate-limited (e.g., must wait an hour before reopening to allow the prefecture's confirmation to settle)
**And** the user gets a clear message

### Scenario · Anti-fraud · repeated reopens

**Given** the same user reopens the same report 3+ times in a short window
**When** the backend evaluates
**Then** subsequent reopens go to moderation review (not auto-reopened)
**And** the user is informed transparently

### Scenario · Visitor "Voltou a aparecer"

**Given** the visitor picks "Voltou a aparecer" as the flag reason
**When** the submission happens
**Then** the backend treats this as a softer signal — it queues a moderator review with a tag, doesn't immediately reopen
**And** if many visitors flag the same way, the moderator may auto-reopen

### Scenario · Reused logic

**Given** the rest of the menu options (Silenciar, Tornar anônimo, Editar, Excluir)
**When** the user picks them
**Then** the same behavior as SCREEN 13 applies

### Scenario · Accessibility

**Given** screen reader is on
**When** the menu opens
**Then** items are announced as a list with their labels and short subtitles
**And** dangerous actions are flagged accessibly

## Frontend (React Native)

### Where it lives

Reuses the `OverflowMenu` from `13-detail-in-progress/07` with a `screenVariant: 'in_progress' | 'resolved'` prop and per-variant option lists.

```
apps/city-hero/src/screens/DetailTicket/
└── components/
    └── (reuses OverflowMenu from DetailInProgress with screenVariant prop)
└── components/
    ├── ReopenReportSheet.tsx
    └── (other shared)
```

### Reopen form

A small form invoked from Reabrir reporte:

- Optional photo via camera (opens SCREEN 08 with a special "reopen" mode similar to enrich).
- A short reason (free text optional + pre-defined chips).
- Submit triggers the backend's reopen endpoint.

## Backend (FastAPI)

### New endpoint

| Method | Path                          | Purpose                               |
| ------ | ----------------------------- | ------------------------------------- |
| POST   | `/api/v1/reports/{id}/reopen` | Reopen a resolved report (owner only) |

The endpoint:

- Requires owner authentication.
- Validates the report is resolved.
- Validates cooldown (e.g., not within the first hour after resolution).
- Adds a timeline entry "Reportado novamente pelo cidadão" with the reason.
- Sets `status` back to `in_progress`.
- Notifies the prefecture's pipeline (the original assignee + the moderation queue).

The flag endpoint (from `13-detail-in-progress/07`) accepts the new reason key `recurrence`.

## Database

The `reports_audit_log` records reopen events. The `report_flags` table accepts the new `reason` value. No new tables.

## Edge Cases

- **Owner reopens but never provides evidence**: the prefecture can downgrade the reopen to a flag if there's no follow-up evidence within a few days.
- **Multiple owners' reports merged**: if the user's report was merged into another (SCREEN 17), Reabrir affects the parent ticket.

## Privacy / LGPD

- Reopen is the owner's right; the reason text follows the same moderation rules as descriptions.
- The flag's "Voltou a aparecer" reason is non-identifying.

## Analytics

| Event                            | When                                | Props             |
| -------------------------------- | ----------------------------------- | ----------------- |
| `detail_ticket.overflow_opened`  | Menu opened                         | `is_owner: bool`  |
| `detail_ticket.reopen_intent`    | User tapped Reabrir                 | —                 |
| `detail_ticket.reopen_submitted` | Reopen confirmed                    | `had_photo: bool` |
| `detail_ticket.flag_recurrence`  | Visitor flagged "Voltou a aparecer" | —                 |

## Tests

- **Unit (frontend)**: visitor vs owner menus differ; Reabrir form validates; cooldown messaging works.
- **Unit (backend)**: reopen endpoint validates owner, cooldown, state transitions; flag accepts new reason.
- **Integration**: end-to-end reopen → status returns to `in_progress` → SCREEN 13 routing applies on next visit.
- **A11y**: menu items announced with their actions.

## Definition of Done

- [ ] `screenVariant` prop on OverflowMenu
- [ ] ReopenReportSheet + form
- [ ] Backend reopen endpoint with cooldown + audit
- [ ] New flag reason for recurrence
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Architecture (variant pattern, REST): `docs/engineering/architecture-patterns.md`
- Security (cooldown, anti-fraud): `docs/engineering/security-baseline.md`
- Observability (audit log): `docs/engineering/observability.md`
- Testing: `docs/engineering/testing-strategy.md`

### Project context

- Render UI base: `01-render-detail-ticket-ui-base.md`
- SCREEN 13 overflow menu: `13-detail-in-progress/07-overflow-menu.md`
- Reopen camera mode (analogous to enrich): `08-camera-live/09-enrich-mode.md`
- `CLAUDE.md`

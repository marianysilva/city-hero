# Detail · In Progress · Overflow menu

> **Type:** Screen feature · UI + secondary actions\
> **Screen:** SCREEN 13 · Detail · In Progress\
> **Effort:** M (1-2 days)\
> **Dependencies:** `13-detail-in-progress/01-render-detail-ui-base.md`,
> `07-civic-feed/08-enriquecer-action.md`, `11-anonymous-send/06-reversibility.md`\
> **Status:** ⬜ Not started\
> **Labels:** `mobile`, `backend`, `screen`, `ux`

## Context

The overflow ⋯ button in the top-right of the hero opens a small bottom sheet with secondary
actions. The visible options adapt to the user's relationship to the report:

- **Visitors** see: 📷 Enriquecer (add a photo by being on-site), ⚠️ Reportar problema (flag this
  report for moderation), 🔇 Silenciar (no more updates from this report).
- **Owners** see: 📷 Enriquecer (yes, own reports too — extra evidence helps), 🥷↔️ Tornar anônimo /
  👤↔️ Tornar público (toggle anonymity), ✏️ Editar (limited fields like description), 🗑️ Excluir
  (soft delete; with confirmation).

Keeping the primary CTAs uncluttered while making the secondary actions discoverable.

## User Story

**As a** Citizen looking at a report,\
**I want** secondary actions tucked under a menu,\
**In order to** access them when needed without distracting the main flow.

## Acceptance Criteria

### Scenario · Open menu (visitor)

**Given** the user is not the owner\
**When** they tap the ⋯ button\
**Then** a bottom sheet opens with three options: "Enriquecer (📷)", "Reportar problema (⚠️)",
"Silenciar (🔇)"\
**And** each item has an icon, label, and a short subtitle explaining the action\
**And** light haptic feedback fires on open

### Scenario · Open menu (owner)

**Given** the user is the report's owner\
**When** they tap ⋯\
**Then** the sheet shows: "Enriquecer", "Tornar anônimo/público" (depending on current state),
"Editar", "Excluir"\
**And** the dangerous "Excluir" option is visually separated with a divider and a slate-warning
style

### Scenario · Enriquecer

**Given** the user taps Enriquecer\
**When** the action runs\
**Then** the sheet closes\
**And** the Camera screen opens in `mode=enrich` with the report ID (per `07-civic-feed/08`)\
**And** the user must be near the report's location (≤20m); otherwise the proximity sheet from
`08-camera-live/05` appears

### Scenario · Reportar problema (visitor)

**Given** the user wants to flag the report for moderation\
**When** they tap "Reportar problema"\
**Then** a small sheet appears with reasons: "Fake", "Ofensivo", "Repetido", "Sem relação", "Outro"\
**And** picking a reason submits a moderation report to the backend\
**And** the user gets a confirmation ("Recebemos · vamos olhar")

### Scenario · Silenciar

**Given** the user wants to stop receiving updates\
**When** they tap Silenciar\
**Then** push notifications for this report are muted (the user no longer gets status change
alerts)\
**And** the menu's icon updates to indicate the muted state ("🔇 Desativar silenciamento" on next
open)\
**And** the user can reverse the action anytime

### Scenario · Tornar anônimo / público

**Given** the user is the owner\
**When** they tap the toggle\
**Then** a confirmation sheet appears (per `11-anonymous-send/06`)\
**And** the flip propagates to all surfaces (feed card, detail, share preview)

### Scenario · Editar (owner)

**Given** the user is the owner\
**When** they tap Editar\
**Then** an edit form opens (limited to non-load-bearing fields: description, severity)\
**And** the photo, category, location are **not** editable post-submit (they'd invalidate the
report's integrity)\
**And** the changes save server-side with an audit log entry

### Scenario · Excluir (owner)

**Given** the user is the owner\
**When** they tap Excluir\
**Then** a strict confirmation modal appears: "Tem certeza? O reporte vai sumir do feed e do mapa.
Você ainda vê em Meus Reportes."\
**And** confirming soft-deletes the report (sets `deleted_at`; hidden from public)\
**And** the user navigates back to Home or My Reports

### Scenario · Offline behavior

**Given** the device is offline\
**When** the user attempts a secondary action\
**Then** simple actions like Silenciar work locally (and sync later via the offline queue)\
**And** server-required actions (Editar, Excluir, Reportar problema) queue with the offline queue
and show "Vai enviar quando o sinal voltar"

### Scenario · Multi-tenant scoping

**Given** any of the secondary endpoints is called\
**When** the backend handles\
**Then** city scope is enforced (cross-tenant rejected)

### Scenario · Accessibility

**Given** screen reader is on\
**When** the menu opens\
**Then** each item is announced with its label and subtitle\
**And** dangerous actions are distinguished by an accessibility hint ("delete report, irreversible")

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/DetailInProgress/
├── components/
│   ├── OverflowMenu.tsx
│   ├── ReportProblemSheet.tsx
│   └── EditReportForm.tsx
└── hooks/
    ├── useMuteReport.ts
    ├── useReportProblem.ts
    ├── useEditReport.ts
    └── useDeleteReport.ts
```

### Component behavior

- `OverflowMenu` is a bottom sheet listing the appropriate options based on owner flag and mute
  state.
- Each action delegates to a dedicated hook that handles the backend call, optimistic UI, offline
  queueing, and cache invalidation.
- The reversibility (anonymity toggle) reuses the hook from `11-anonymous-send/06`.

## Backend (FastAPI)

### Endpoints

| Method | Path                        | Purpose                                |
| ------ | --------------------------- | -------------------------------------- |
| POST   | `/api/v1/reports/{id}/mute` | Mute notifications for the report      |
| DELETE | `/api/v1/reports/{id}/mute` | Unmute                                 |
| POST   | `/api/v1/reports/{id}/flag` | Submit moderation report (visitors)    |
| PATCH  | `/api/v1/reports/{id}`      | Edit (owner-only; allowed fields only) |
| DELETE | `/api/v1/reports/{id}`      | Soft delete (owner-only)               |

The mute endpoint records a per-user-per-report mute flag. The flag endpoint creates a moderation
queue entry. The edit and delete endpoints require owner authentication and write to the audit log.

## Database (PostgreSQL)

### `report_mutes` table

| Column      | Type        | Notes |
| ----------- | ----------- | ----- |
| `user_id`   | UUID PK FK  |       |
| `report_id` | UUID PK FK  |       |
| `muted_at`  | timestamptz |       |

### `report_flags` table

| Column       | Type        | Notes                                  |
| ------------ | ----------- | -------------------------------------- |
| `id`         | UUID PK     |                                        |
| `report_id`  | UUID FK     |                                        |
| `flagger_id` | UUID FK     |                                        |
| `reason`     | varchar(50) | `fake`, `offensive`, `duplicate`, etc. |
| `notes`      | text        | Optional explanation                   |
| `created_at` | timestamptz |                                        |

### `reports_audit_log` (existing, used by edit/delete/anonymity)

Already defined in earlier tasks. Records every owner-action.

## Edge Cases

- **Owner views their own report after deletion**: the report disappears from public surfaces; My
  Reports shows it in a "deleted" state with a restore option (out of MVP scope).
- **Visitor flags many reports rapidly**: rate limited.
- **Edit conflicts** (user edits offline while server changes happen): use last-write-wins for
  non-load-bearing fields, with notification if there was a conflict.

## Privacy / LGPD

- Mute and flag are per-user actions, not visible to anyone else.
- Edit changes are audited (when, who, before/after); audit log access is for moderation only.
- Delete is soft (allows reversal); hard delete on user account deletion.

## Analytics

| Event                                | When                | Props              |
| ------------------------------------ | ------------------- | ------------------ |
| `detail_in_progress.overflow_opened` | Menu opened         | `is_owner: bool`   |
| `detail_in_progress.mute_toggled`    | Mute or unmute      | `now_muted: bool`  |
| `detail_in_progress.flag_submitted`  | Report flagged      | `reason`           |
| `detail_in_progress.edit_saved`      | Owner saved an edit | `fields: [string]` |
| `detail_in_progress.deleted`         | Owner deleted       | —                  |

## Tests

- **Unit (frontend)**: menu options vary by owner state; each hook handles optimistic + offline +
  rollback.
- **Unit (backend)**: owner checks; rate limits; audit log writes; field whitelist on edit.
- **Integration**: end-to-end mute → no push → unmute; flag → moderation queue entry.
- **E2E**: owner deletes → report disappears from feed/map; reversibility flow.

## Definition of Done

- [ ] OverflowMenu with adaptive options
- [ ] Sub-sheets and forms (flag, edit)
- [ ] All hooks with optimistic + offline support
- [ ] Backend endpoints + idempotency + audit log
- [ ] New tables (`report_mutes`, `report_flags`)
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Architecture (REST, multi-tenant, owner checks): `docs/engineering/architecture-patterns.md`
- Security (audit, rate limit): `docs/engineering/security-baseline.md`
- Observability (audit log): `docs/engineering/observability.md`
- Testing: `docs/engineering/testing-strategy.md`

### Project context

- Render UI base: `01-render-detail-ui-base.md`
- Enriquecer action: `07-civic-feed/08-enriquecer-action.md`
- Anonymity reversibility: `11-anonymous-send/06-reversibility.md`
- Offline queue: `00-foundation/09-offline-queue.md`
- `CLAUDE.md`

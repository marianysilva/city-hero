# Anonymous Send · Reversibility ("Tornar público")

> **Type:** Screen feature · UI + state
> **Screen:** SCREEN 11 · Anonymous Send (and SCREEN 16 My Reports)
> **Effort:** M (1-2 days)
> **Dependencies:** `11-anonymous-send/01-render-anonymous-ui-base.md`, `00-foundation/06-auth-system.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `backend`, `database`, `screen`, `lgpd`

## Context

A small reversibility affordance near the bottom of the scroll area:
"Mudou de ideia? Dá pra **tornar público** em Meus Reportes a qualquer
momento." Tapping the highlighted text deep-links into the report's
row in **My Reports** with an inline action to convert. This makes
anonymity feel less like a "one-way door" and more like a respected,
adjustable choice — increasing the likelihood users will try it.

The actual server-side toggle is also implemented here (the endpoint
that flips a report's `anonymous` flag from true to false).

## User Story

**As a** Citizen who chose anonymous and later wants visibility,
**I want** a clear, easy path to turn the report public,
**In order to** join the Liga / accrue visible support if I change my mind.

## Acceptance Criteria

### Scenario · Default render

**Given** the user is on the screen
**When** the reversibility line renders near the bottom of the scrollable area
**Then** the text reads "Mudou de ideia? Dá pra **tornar público** em Meus Reportes a qualquer momento."
**And** "tornar público" is visually highlighted (violet underline)

### Scenario · Tap "tornar público"

**Given** the user taps the highlighted text
**When** the action runs
**Then** the app navigates to SCREEN 16 (Meus Reportes) and scrolls to (or highlights) the newly created report
**And** the row exposes an inline "Tornar público" action
**And** tapping the action opens a confirmation sheet

### Scenario · Confirmation sheet

**Given** the user opened the confirmation sheet
**When** they read the explanation
**Then** the sheet explains: "Seu nome vai aparecer no feed para os vizinhos. A prefeitura já tem essa informação."
**And** offers two CTAs: "Cancelar" (default) and "Tornar público"

### Scenario · Confirm the change

**Given** the user confirmed
**When** the action fires
**Then** the backend flips the report's `anonymous` field to false
**And** the report's public surfaces (feed card, detail screen) update to show the user's name and avatar
**And** the My Reports row reflects the new state
**And** a toast confirms: "Reporte agora é público"

### Scenario · The reverse (turn anonymous later)

**Given** the user wants to turn a public report anonymous
**When** they take the equivalent action in My Reports
**Then** the flag flips to true and public surfaces re-mask the identity
**And** the operation is symmetric (both directions are supported)

### Scenario · Idempotency on retries

**Given** the user taps confirm and the request times out
**When** they retry
**Then** the same idempotency key prevents double-toggling
**And** the final state matches the user's intent

### Scenario · Offline

**Given** the device is offline
**When** the user confirms the flip
**Then** the action is queued via the offline queue
**And** the optimistic UI shows the new state immediately
**And** the queue handles the sync

### Scenario · The change is logged

**Given** any flip is committed
**When** the audit log writes
**Then** the change is recorded with: user_id, report_id, from_state, to_state, timestamp
**And** the audit log is moderator-accessible (per LAI / internal compliance)

### Scenario · Multi-tenant scoping

**Given** the request reaches the server
**When** the city scope doesn't match
**Then** the request is rejected with 403

### Scenario · Accessibility

**Given** screen reader is on
**When** the user navigates to the reversibility line
**Then** it's announced with the action ("Change your mind? You can make it public anytime in My Reports")
**And** the tappable area is clearly labeled

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/AnonymousSend/
└── components/
    └── ReversibilityHint.tsx

apps/city-hero/src/services/reports/
├── toggleAnonymityAction.ts
└── hooks/
    └── useToggleAnonymity.ts
```

The hook is shared across:

- The anonymous send screen (deep-links to My Reports).
- The My Reports screen (per-row inline action).
- The Detail screens (a menu option for the owner).

The toggle action wraps the backend call with optimistic update,
idempotency key, offline queueing, and cache invalidation across
surfaces.

## Backend (FastAPI)

### Endpoint

| Method | Path                                              | Purpose                                |
|--------|---------------------------------------------------|----------------------------------------|
| PATCH  | `/api/v1/reports/{id}/anonymity`                  | Toggle the `anonymous` flag           |

The endpoint:

- Validates the user is the report's owner.
- Idempotency on the request key.
- Records the change in the audit log.
- Returns the updated report.
- Multi-tenant scoping enforced.

The change propagates to the public surfaces (feed, detail) immediately via:

- The standard cache invalidation in the API client.
- The real-time push events (per `06-home-map/08`).

## Database (PostgreSQL)

The existing `reports.anonymous` field is the source of truth. The
`reports_audit_log` table (defined in the report-creation flow) records
each flip:

| Column            | Type        | Notes                                          |
|-------------------|-------------|------------------------------------------------|
| `id`              | UUID PK     |                                                |
| `report_id`       | UUID FK     |                                                |
| `user_id`         | UUID FK     | Always the report's owner                      |
| `action`          | varchar(50) | `anonymity_changed`                            |
| `from_value`      | jsonb       | `{anonymous: true}`                            |
| `to_value`        | jsonb       | `{anonymous: false}`                           |
| `occurred_at`     | timestamptz |                                                |

## Edge Cases

- **Owner deleted their account but the report still exists**: a deleted user can't toggle anymore; the field is fixed at its last state.
- **Public report that was originally anonymous, becoming anonymous again**: the flip is symmetric and supported.

## Privacy / LGPD

This task strengthens **user agency** under LGPD:

- The right to control public disclosure of one's identity is supported on demand.
- The audit log gives the data subject and the regulator visibility into changes.
- LAI obligations (prefecture sees identity) are unchanged by this toggle.

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `anonymous_send.reversibility_tap` | User taps the highlighted text             | —                                     |
| `report.anonymity_flipped`         | Backend confirmed                          | `from`, `to`                          |

## Tests

- **Unit (frontend)**: hook handles online/offline; cache invalidation across surfaces; idempotency.
- **Unit (backend)**: owner check; idempotency; audit log entry.
- **Integration**: end-to-end flip with mock backend; My Reports row update.
- **E2E**: anonymous report → flip to public → verify feed shows the user's name.

## Definition of Done

- [ ] ReversibilityHint component
- [ ] `useToggleAnonymity` hook (shared)
- [ ] Backend PATCH endpoint with owner + idempotency + audit
- [ ] My Reports inline action wired
- [ ] Cache invalidation on flip
- [ ] Offline queue path
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Architecture (idempotency, REST): `docs/engineering/architecture-patterns.md`
- Observability (audit log): `docs/engineering/observability.md`
- Testing: `docs/engineering/testing-strategy.md`

### Project context
- Render UI base: `01-render-anonymous-ui-base.md`
- My Reports screen: `docs/tasks/16-my-reports/`
- Auth system: `00-foundation/06-auth-system.md`
- Offline queue: `00-foundation/09-offline-queue.md`
- `CLAUDE.md`

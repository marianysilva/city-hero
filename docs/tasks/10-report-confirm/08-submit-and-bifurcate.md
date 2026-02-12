# Report Confirmation · Submit + bifurcation routing

> **Type:** Screen feature · Core submit flow
> **Screen:** SCREEN 10 · Report Confirmation
> **Effort:** L (3-5 days)
> **Dependencies:** tasks 02-07 of this folder, `00-foundation/05-api-client.md`, `00-foundation/07-photo-upload-pipeline.md`, `00-foundation/08-anonymization-pipeline.md`, `00-foundation/09-offline-queue.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `backend`, `database`, `screen`, `lgpd`, `anti-fraud`

## Context

This task is the **heart of the entire reporting flow**. When the user
taps "Enviar reporte →", it:

1. Validates all required fields client-side.
2. Uploads the photo via the foundation pipeline (anonymization runs
   server-side).
3. Submits the report payload to the backend.
4. Credits XP and any unlocked medals.
5. **Bifurcates** the post-submit navigation: Identified → SCREEN 12
   (Liga de Heróis); Anonymous → SCREEN 11 (Envio Anônimo).
6. Handles offline gracefully via the queue.
7. Carries every anti-fraud signal captured along the way.

This is the largest task on the screen because it orchestrates almost
every foundation: API client, photo upload, anonymization, offline
queue, gamification, and deep-link-safe navigation.

## User Story

**As a** Citizen reviewing my report,
**I want** to send it with one tap and see what comes next,
**In order to** feel my action mattered.

## Acceptance Criteria

### Scenario · Standard happy path (identified, online)

**Given** the user filled all required fields, the anonymization completed, and the device is online
**When** the user taps "Enviar reporte →"
**Then** the report is created server-side with all the gathered data
**And** XP is credited
**And** any medal unlocks are applied
**And** the user is navigated to SCREEN 12 (Liga de Heróis) with the new report's ID

### Scenario · Anonymous path (online)

**Given** the user picked Anônima
**When** they tap "Enviar reporte →"
**Then** the report is created with `anonymous: true`
**And** the user is navigated to SCREEN 11 (Envio Anônimo)
**And** XP is credited identically

### Scenario · Offline submission

**Given** the device is offline
**When** the user taps "Enviar reporte →"
**Then** the report payload (including the photo as a local URI) is enqueued via the offline queue
**And** XP is reserved in the gamification store (pending state)
**And** the user sees a confirmation ("Salvo · vai pra prefeitura quando voltar o sinal")
**And** navigation goes to the appropriate destination (Liga or Envio Anônimo) immediately, showing the report as "pending sync"
**And** when connectivity returns, the queue drains; server confirms; the screens update

### Scenario · Anonymization still in progress

**Given** the anonymization pipeline hasn't completed when the user taps the CTA
**When** the click is handled
**Then** the CTA shows a small inline spinner with text "Anonimizando…"
**And** when the pipeline completes, submission proceeds
**And** if the user backgrounded the app during the wait, the flow resumes on return

### Scenario · Validation failure

**Given** a required field is missing (which shouldn't be possible via the UI but defense in depth)
**When** the submit is attempted
**Then** the offending field is highlighted
**And** the user is scrolled to it
**And** a soft toast explains

### Scenario · Backend validation failure

**Given** the backend rejects the payload (e.g., location outside city, gallery photo without consent, suspicious GPS pattern)
**When** the response arrives
**Then** a clear error is shown inline with the offending area
**And** the user can correct and retry
**And** XP is not credited

### Scenario · Server-side anti-fraud signal

**Given** the submission carries flags (mocked location, gallery flag, implausible movement, etc.)
**When** the backend processes
**Then** the report is created but flagged for moderator review
**And** the public visibility may be delayed until moderation passes (per `docs/engineering/security-baseline.md`)
**And** the user gets a friendly "Estamos validando" message instead of immediate public visibility

### Scenario · Duplicate detection

**Given** a nearby identical report exists (per the manager-panel duplicate detection logic)
**When** the backend processes
**Then** instead of creating a new report, the system associates the user's submission with the existing one (a support + photo addition, depending on rules)
**And** the user is navigated to the existing report's detail (with a "Você foi associado a um reporte existente" hint)

### Scenario · Idempotency on retry

**Given** the user tapped submit, the request timed out, and they tap again
**When** the second attempt fires
**Then** an idempotency key (the local report draft ID) ensures the backend doesn't create a duplicate report

### Scenario · Multi-tenant scoping

**Given** the active city in the JWT and the explicit header don't match
**When** the submit reaches the server
**Then** the request is rejected with a clear error
**And** the client surfaces a "Algo deu errado · tente reabrir o app"

### Scenario · Photo upload failure

**Given** the photo upload fails (after retries)
**When** the failure is final
**Then** the report submission is not attempted (photo is a requirement when the camera path was used)
**And** the user can retry the upload or retake the photo

### Scenario · Successful submit shows pending photo

**Given** the report was submitted but the anonymization is still queued server-side
**When** the next screen (Liga / Envio Anônimo / Detail) renders
**Then** the photo shows as "Anonimizando…" until done
**And** public visibility (feed / map) is gated on anonymization completion (per `00-foundation/08`)

### Scenario · Accessibility

**Given** screen reader is on
**When** the submit fires
**Then** the in-flight state is announced ("Sending report…")
**And** the result is announced ("Report sent! Going to Liga de Heróis")

## Frontend (React Native)

### Where it lives

```
apps/mobile/src/screens/ReportConfirm/
├── hooks/
│   └── useSubmitReport.ts
└── services/
    └── submitOrchestrator.ts
```

### Behavior

The orchestrator does, in order:

1. Aggregates state from all the screen's hooks (photo, category, severity, location, description, identification, AI feedback).
2. Validates client-side.
3. Checks connectivity.
4. If online: uploads the photo (if any) via the pipeline → waits for anonymization to be in `done` state → posts the report-create endpoint.
5. If offline: enqueues a job containing the photo URI + the report payload via the offline queue (`00-foundation/09`).
6. On successful response: credits XP optimistically (server is authoritative), updates caches (e.g., My Reports), prepares navigation.
7. Navigates to Liga de Heróis or Envio Anônimo based on the identification choice.

### Idempotency

A local UUID (the draft report ID) is generated when the user enters the confirmation screen. It's used as the idempotency key for both the upload and the report-create call. Retries don't create duplicates.

### Optimistic UI on submit

The submit CTA shows an in-flight state with a small spinner. The navigation to the post-submit screen happens immediately when the response is back; if offline, navigation is immediate with a "pending" state.

## Backend (FastAPI)

### Endpoint

| Method | Path                              | Purpose                              |
|--------|-----------------------------------|---------------------------------------|
| POST   | `/api/v1/reports`                 | Create a new report                  |

The backend accepts the full payload:

- `category` + optional secondary
- `severity`
- `photo_id` (the photo uploaded via the pipeline) or null
- `location` (lat, lng, accuracy, source, address)
- `description` (nullable)
- `anonymous` (boolean)
- `ai_label_candidate` (boolean)
- `ai_original_detection` (jsonb, nullable)
- `ai_model_version` (nullable)
- `entry_context` (where the user came from in the flow)
- `client_flags` (jsonb — gallery, mocked location, EXIF mismatch, etc.)
- `idempotency_key` (the draft UUID)

The backend:

- Validates against multi-tenant scoping.
- Server-side stage-3 GPS validation per `08-camera-live/05`.
- Records the report and credits XP / medals.
- Returns the report ID, the public URL slug, the granted XP, and any medal IDs unlocked.
- Triggers downstream pipelines (anonymization for the photo, real-time event push, push notifications to subscribers in the area).

### Server-side moderation

If client flags indicate suspicious data, the report is created in a `pending_moderation` state. Public visibility (feed / map) waits until a moderator reviews. The reporter sees their report normally on their My Reports list.

## Database

The `reports` table is fully populated by this submission. Schema is the comprehensive one referenced by all preceding tasks. The `xp_events` and `medals_unlocked` tables track the gamification credit.

## Edge Cases

- **User abandons mid-submit and reopens later**: the offline queue has the job; the user's My Reports shows the pending entry.
- **Photo anonymization fails server-side after report creation**: the report exists but is hidden from public until reprocessing succeeds; the reporter is notified.
- **User's account is shadowbanned (anti-fraud)**: the submission is silently accepted but not visible publicly — per `docs/user-stories.md`. The reporter sees no different UI (preventing them from gaming the shadowban detection).
- **Token expired between drafting and submit**: refresh transparently per API client; user doesn't notice.
- **City changed mid-session**: the report is associated with the city active at submit time, not at capture.

## Privacy / LGPD

This is the moment the report's data leaves the device. Specific guarantees:

- The photo travels through anonymization before public visibility (foundation `08`).
- Anonymous reports mask the identity in all public surfaces.
- The reporter's identity is always recorded server-side for audit and prefecture access per LAI.
- An audit trail captures every submission with its flags.

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `report.submit_started`            | User tapped Enviar                         | `had_photo: bool`, `anonymous: bool` |
| `report.submit_succeeded`          | Server confirmed                           | `report_id`, `xp_granted`, `medals_unlocked: int`, `online: bool` |
| `report.submit_queued_offline`     | Enqueued via offline queue                 | —                                     |
| `report.submit_failed`             | Final failure                              | `code`, `at_step: validation|upload|create` |
| `report.submit_duplicate_associated`| Backend associated with an existing report| `existing_report_id`                  |
| `report.submit_pending_moderation` | Server held for moderation                 | `flags: [string]`                     |

## Tests

- **Unit (frontend)**: orchestrator handles each path (online, offline, anonymization pending, validation error, backend error).
- **Unit (backend)**: validation; idempotency; anti-fraud flag handling; duplicate detection; XP/medal credit.
- **Integration**: end-to-end from capture → confirm → submit → land on Liga / Envio Anônimo; offline submission queues; reconnect drains.
- **Resilience**: token expiry mid-submit refreshes; partial network failures retry.
- **E2E**: full happy paths for both identified and anonymous; offline path.

## Definition of Done

- [ ] Submit orchestrator service
- [ ] `useSubmitReport` hook
- [ ] Validation across all required fields
- [ ] Idempotency end-to-end
- [ ] Online path: upload → anonymization wait → report-create
- [ ] Offline path: enqueue with photo URI + payload
- [ ] Bifurcation navigation to Liga / Envio Anônimo
- [ ] XP / medal credit handling
- [ ] Backend create endpoint with full validation
- [ ] Anti-fraud flags persisted on the report
- [ ] Duplicate detection wired
- [ ] Pending-moderation gating
- [ ] Telemetry events
- [ ] Tests passing per strategy

## Standards & References

### Cross-cutting standards
- Architecture (REST, multi-tenant, idempotency): `docs/engineering/architecture-patterns.md`
- Security (anti-fraud, scoping, moderation): `docs/engineering/security-baseline.md`
- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Observability: `docs/engineering/observability.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references
- TanStack Query mutations: https://tanstack.com/query/latest/docs/react/guides/mutations
- Idempotent HTTP: https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/

### Project context
- All other report-confirm sub-tasks (01-07)
- Photo upload pipeline: `00-foundation/07-photo-upload-pipeline.md`
- Anonymization pipeline: `00-foundation/08-anonymization-pipeline.md`
- Offline queue: `00-foundation/09-offline-queue.md`
- Envio Anônimo: `docs/tasks/11-anonymous-send/`
- Liga de Heróis: `docs/tasks/12-heroes-league/`
- `docs/user-stories.md` (Anti-Spoofing, Reputation, Cross-Departmental Collision)
- `CLAUDE.md`

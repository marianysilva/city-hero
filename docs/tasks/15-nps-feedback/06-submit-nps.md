# NPS Feedback · Submit (API + XP + navigation)

> **Type:** Screen feature · Submit flow
> **Screen:** SCREEN 15 · NPS Feedback
> **Effort:** M (1-2 days)
> **Dependencies:** tasks 02-05 of this folder, `00-foundation/05-api-client.md`, `00-foundation/09-offline-queue.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `backend`, `database`, `screen`, `gamification`

## Context

The submit CTA at the bottom orchestrates the NPS submission:
validates the state (rating is required; tags and comment optional),
calls the backend, credits +15 XP, navigates back to SCREEN 14 with
the new "Avaliado · ★★★★☆" state visible on the Avaliar button. The
button label shows the reward (+15 XP) prominently to anchor the
action emotionally.

The submission also feeds the prefecture's **Citizen Sentiment
Analysis** dashboard (per `features.md` § 4) — aggregated stats by
neighborhood, category, and time.

## User Story

**As a** Citizen ready to submit feedback,
**I want** one clear submit action with the reward visible,
**In order to** confirm and earn the XP without ambiguity.

## Acceptance Criteria

### Scenario · Submit happy path (online)

**Given** the user has at least set a rating (default + optional tags + optional comment)
**When** they tap "Enviar feedback +15 XP"
**Then** the screen sends the payload to the backend
**And** the backend records the submission, credits XP, and triggers downstream events
**And** the user sees a brief success state (small animation + haptic)
**And** the screen navigates back to SCREEN 14
**And** SCREEN 14's bottom bar reflects the new state ("Avaliado · ★★★★☆")

### Scenario · Submit offline

**Given** the device is offline
**When** the user submits
**Then** the payload is queued via the offline queue
**And** the optimistic UI shows the submit as pending
**And** the user navigates back to SCREEN 14 with the optimistic state
**And** the queue syncs on connectivity return

### Scenario · Idempotency on retry

**Given** the user tapped submit, the request timed out, and they retry
**When** the second attempt fires
**Then** an idempotency key (per submission session) prevents double XP credit
**And** the result matches the first attempt

### Scenario · Anti-fraud rate limit

**Given** the user is submitting NPS rapidly
**When** the backend evaluates
**Then** rate limit applies (e.g., 10/hour)
**And** subsequent submits are throttled (queued or non-blocking warning)

### Scenario · Validation errors

**Given** a required field is missing (rating is required by default)
**When** the user taps submit
**Then** an inline message highlights the missing field
**And** the CTA stays disabled until the field is set

### Scenario · Backend rejection

**Given** the comment moderation rejects the submission
**When** the response arrives
**Then** the comment field shows the error inline
**And** the user can revise and retry

### Scenario · Re-submit within cooldown

**Given** the user submitted within the cooldown window (per `14-detail-ticket/05`)
**When** they try to submit again
**Then** the backend rejects with a clear code
**And** the cooldown sheet from `14-detail-ticket/05` applies

### Scenario · XP grant

**Given** the submit succeeded
**When** XP is credited
**Then** +15 XP is added to the user's total
**And** the gamification store updates (the bottom-nav profile XP counter reflects the change)
**And** the credit is **once per (user, report, attempt)** — not stacked on re-submit

### Scenario · Multi-tenant scoping

**Given** the submission reaches the server
**When** the city scope doesn't match
**Then** the request is rejected with 403

### Scenario · Accessibility

**Given** screen reader is on
**When** the user activates submit
**Then** the in-flight state is announced ("Sending feedback…")
**And** the success/error is announced
**And** the resulting navigation is communicated

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/NpsFeedback/
├── hooks/
│   └── useSubmitNps.ts
└── services/
    └── npsAction.ts
```

### Behavior

- `useSubmitNps` aggregates the screen's state (rating, tags, comment) and exposes `submit()` and `canSubmit`.
- The mutation calls the backend; on success, navigates back; on failure, surfaces an error.
- Offline-aware via the offline queue.

### Idempotency

A local UUID generated when the user lands on the screen is used as the idempotency key. Retries don't double-credit XP.

### Success animation

A brief checkmark animation overlays the CTA (200ms), then the navigation runs.

## Backend (FastAPI)

### Endpoint

| Method | Path                                              | Purpose                                |
|--------|---------------------------------------------------|----------------------------------------|
| POST   | `/api/v1/reports/{id}/nps`                        | Submit NPS feedback                    |

The endpoint:

- Validates the rating (1-5).
- Validates and moderates the comment.
- Stores tags.
- Credits XP (idempotent on the submission's UUID + user_id).
- Updates the user's `nps.has_submitted` state for this report.
- Triggers the downstream sentiment-analysis pipeline (writes to the analytical data warehouse via dbt-friendly tables).
- Rate-limited per user.

The response includes the new state for the report (so the client can update SCREEN 14's button without an extra fetch).

## Database (PostgreSQL)

### `nps_submissions` table

| Column            | Type        | Notes                                              |
|-------------------|-------------|----------------------------------------------------|
| `id`              | UUID PK     |                                                    |
| `report_id`       | UUID FK     |                                                    |
| `user_id`         | UUID FK     |                                                    |
| `city_id`         | UUID FK     | Multi-tenant scope                                 |
| `rating`          | smallint    | 1-5                                                |
| `tags`            | text[]      | Tag keys                                            |
| `comment`         | text        | Nullable                                            |
| `idempotency_key` | varchar(64) | Per submission session                              |
| `submitted_at`    | timestamptz |                                                    |

Unique constraint on `(report_id, user_id, idempotency_key)`.

Indexes on `(report_id, user_id, submitted_at)` and `(city_id, submitted_at)` for analytics queries.

### Analytical destinations

A dbt model materializes per-report and per-city aggregations (avg rating, tag frequencies, sentiment over time) into fact tables consumed by Superset (per `features.md` § 4).

## Edge Cases

- **User abandoned mid-submit and reopens later**: the offline queue retries; the user's NPS state on the detail screen reflects the optimistic pending state until sync.
- **Backend rejects all submissions briefly** (outage): the queue holds them; sync resumes when the backend is healthy.
- **User changed the rating after the screen was idle for a long time**: the screen re-validates before submit.

## Privacy / LGPD

- The submission is associated with the user's identity for the prefecture's audit and per-user-per-report tracking.
- Comment text is private; only the prefecture and moderators see it.
- Aggregated sentiment dashboards never expose individual responses.
- The user can request deletion of their NPS submissions per LGPD; the data model supports it.

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `nps.submit_started`               | User tapped submit                         | `rating`, `tag_count`, `had_comment: bool` |
| `nps.submit_succeeded`             | Server confirmed                           | `report_id`, `xp_granted: 15`, `online: bool` |
| `nps.submit_failed`                | Final failure                              | `code`                                |
| `nps.submit_queued_offline`        | Enqueued via offline queue                 | —                                     |

## Tests

- **Unit (frontend)**: aggregation; CTA gating; offline routing; idempotency.
- **Unit (backend)**: rating validation; moderation; XP idempotency; rate limit.
- **Integration**: end-to-end submit → SCREEN 14 reflects state.
- **E2E**: complete flow from Avaliar tap → NPS screen → submit → back to detail with new state.

## Definition of Done

- [ ] Submit orchestrator and hook
- [ ] Idempotency end-to-end
- [ ] Backend endpoint with validation + moderation + XP credit
- [ ] `nps_submissions` table + Alembic migration
- [ ] Multi-tenant scoping enforced
- [ ] Offline queue path
- [ ] Analytical fact tables (dbt model stub)
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Architecture (REST, multi-tenant, idempotency): `docs/engineering/architecture-patterns.md`
- Security (rate limit, moderation): `docs/engineering/security-baseline.md`
- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Observability: `docs/engineering/observability.md`
- Testing: `docs/engineering/testing-strategy.md`

### Project context
- All other NPS sub-tasks (01-05)
- Avaliar CTA (entry): `14-detail-ticket/05-avaliar-cta.md`
- Offline queue: `00-foundation/09-offline-queue.md`
- `features.md` § 4 Citizen Sentiment Analysis
- `CLAUDE.md`

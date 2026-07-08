# Civic Feed · Enriquecer action (crowdsourcing)

> **Type:** Screen feature · Capture flow + state
> **Screen:** SCREEN 07 · Civic Feed (also Detail screens 13, 14)
> **Effort:** M (1-2 days)
> **Dependencies:** `07-civic-feed/03-feed-item-card.md`, `00-foundation/07-photo-upload-pipeline.md`, `00-foundation/08-anonymization-pipeline.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `backend`, `database`, `screen`, `gamification`, `anti-fraud`

## Context

"Enriquecer" lets a citizen who's physically near an existing report add
a fresh photo (additional angle, current condition, before/after evidence).
This is the **collaborative crowdsourcing** feature from `features.md` § 1
and `docs/user-stories.md` (US: Collaborative Evidence). It rewards
double XP (+100) and tightens the anti-fraud net by requiring strict GPS
validation — the user must be at the report's location.

The feature increases data quality (more recent photos help dispatching)
and engagement (gives newcomers something meaningful to do without a new
report).

## User Story

**As a** Citizen passing by an existing open report,
**I want** to add a fresh photo so the prefecture sees the current state,
**In order to** earn extra XP and accelerate resolution.

## Acceptance Criteria

### Scenario · Tap Enriquecer

**Given** the user taps the 📷 Enriquecer button on a feed card
**When** the action runs
**Then** if GPS permission is granted and the user is within ~20m of the report's geo, the camera opens for capture
**And** if not within range, a soft sheet appears explaining "Você precisa estar no local — fica a ~80m" with a "Ver no mapa" link
**And** if GPS permission is not granted, the OS prompt appears (or settings if permanently denied)

### Scenario · Capture and submit

**Given** the user is at the location and the camera opened
**When** they capture a photo and confirm
**Then** the photo is uploaded via the standard pipeline (`00-foundation/07`) and anonymized (`00-foundation/08`) before becoming public
**And** the photo is associated with the **existing** report (not a new one)
**And** XP is granted: +100 (vs +50 for new reports — this is the "double points" promised in user-stories.md)

### Scenario · Anti-fraud · GPS validation server-side

**Given** the photo arrives at the backend
**When** the server validates
**Then** it cross-checks the device-reported lat/lng against the report's geo (within 20m tolerance)
**And** rejects with a clear code if outside tolerance (`location_mismatch`)
**And** flags repeat offenders for moderator review (their reputation drops)

### Scenario · Anti-fraud · timestamp validation

**Given** the photo's EXIF or upload timestamp deviates significantly from "now"
**When** the server checks
**Then** stale photos (e.g., from gallery, EXIF older than 5 minutes) are rejected
**And** the gallery-source flag from the camera is also enforced (no gallery uploads for Enriquecer)

### Scenario · Already enriched recently

**Given** the user already enriched this report in the last 24h
**When** they try to enrich again
**Then** the backend returns a 409 ("already_enriched_recently")
**And** the UI shows a friendly message ("Você já enriqueceu esse reporte hoje")

### Scenario · XP credited

**Given** a successful enrichment
**When** the request completes
**Then** the user's XP increases by +100
**And** a toast/overlay shows "+100 XP · Enriqueceu o reporte"
**And** the report's photo gallery (in the detail screen) shows the new photo

### Scenario · Offline mode

**Given** the device is offline
**When** the user submits the enrichment
**Then** the photo + association are queued via the offline queue
**And** the optimistic UI shows the photo as "pending sync"
**And** the queue tries to drain when connectivity returns
**And** server-side anti-fraud still runs at sync time

### Scenario · Multi-tenant scoping

**Given** the report's `city_id` doesn't match the user's
**When** the request is sent
**Then** the backend rejects with 403

### Scenario · Anonymous reporter unaffected

**Given** the original report is anonymous
**When** another user enriches it
**Then** the enrichment works normally
**And** the enricher is identified (unless they themselves toggle anonymous on the camera flow — TBD)
**And** the anonymous reporter remains anonymous

### Scenario · Accessibility

**Given** screen reader is on
**When** the user activates Enriquecer
**Then** the action is clearly labeled
**And** the GPS-mismatch sheet announces the reason and suggested action

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/services/reports/
├── enrichAction.ts
└── hooks/
    └── useEnrichReport.ts
└── components/
    └── EnrichGpsMismatchSheet.tsx
```

### Behavior

- The action checks the user's current location and the report's geo before opening the camera; this is a fast client-side gate.
- If allowed, the camera screen (SCREEN 08) opens in an "enrich" mode (a small chip indicates "Adicionando foto ao reporte X"); after capture and confirmation, the upload is associated with the existing report ID instead of creating a new one.
- The hook handles XP credit visualization, optimistic photo addition to the report's gallery, and offline queueing.

### Camera mode

The camera screen receives a prop `mode` that switches between:

- `new_report` — default behavior (creates a new report).
- `enrich` — provides the report ID; the confirm screen submits to the enrich endpoint instead.

## Backend (FastAPI)

### Endpoint

| Method | Path                          | Purpose                           |
| ------ | ----------------------------- | --------------------------------- |
| POST   | `/api/v1/reports/{id}/enrich` | Add a photo to an existing report |

The endpoint:

- Accepts the photo (or a photo ID from the upload pipeline) plus device-reported lat/lng + timestamp + idempotency key.
- Validates location proximity, timestamp freshness, gallery flag, multi-tenant scope.
- Triggers anonymization (same pipeline as new reports).
- Records the enrichment in `report_enrichments` table.
- Credits +100 XP via the gamification system (idempotent).
- Returns the new photo's ID + the updated report.

### Anti-fraud

- Per-user-per-report rate limit (one enrichment per 24h).
- Per-user global rate limit (e.g., 10 enrichments/day) to prevent farming.
- GPS deviation history is tracked; repeated offenders see reputation drops and shadowban (per `docs/user-stories.md` Edge Cases).

## Database (PostgreSQL)

### `report_enrichments` table

| Column              | Type        | Notes                       |
| ------------------- | ----------- | --------------------------- |
| `id`                | UUID PK     |                             |
| `report_id`         | UUID FK     |                             |
| `user_id`           | UUID FK     |                             |
| `city_id`           | UUID FK     | For multi-tenant indexing   |
| `photo_id`          | UUID FK     | The new photo               |
| `device_lat`        | numeric     | Reported by client          |
| `device_lng`        | numeric     | Reported by client          |
| `device_distance_m` | numeric     | Computed at validation time |
| `created_at`        | timestamptz |                             |

A unique index on `(report_id, user_id, day(created_at))` enforces the once-per-day rule.

## Edge Cases

- **Report status changed to resolved**: Enriquecer is hidden on resolved reports (no value adding photos to closed cases).
- **Report was merged into another**: Enriquecer redirects to the parent report (handled by the detail screens' merged-report flow).
- **GPS spoofing**: server can detect implausible jumps (anti-fraud logic in `00-foundation/06-auth-system.md` overlap area); on detection, mark the enrichment as flagged and exclude from public view.
- **Photo fails anonymization**: same as new reports — the photo is held until anonymized; not displayed publicly until done.

## Privacy / LGPD

- Same anonymization rules as new reports — Enriquecer photos pass through the pipeline.
- The user's GPS coordinates are stored on the enrichment record for audit (anti-fraud) and are not publicly displayed.

## Analytics

| Event                           | When                                    | Props                        |
| ------------------------------- | --------------------------------------- | ---------------------------- |
| `report.enrich_intent`          | User taps Enriquecer                    | `report_id`                  |
| `report.enrich_blocked_too_far` | GPS gate failed                         | `distance_m`                 |
| `report.enrich_submitted`       | Photo submitted                         | `report_id`                  |
| `report.enrich_succeeded`       | Server confirmed                        | `report_id`, `xp_delta: 100` |
| `report.enrich_rejected`        | Server rejected (anti-fraud / mismatch) | `code`                       |

## Tests

- **Unit (frontend)**: client-side GPS gate; camera enrich-mode wiring; offline queue path.
- **Unit (backend)**: GPS proximity check; once-per-day rule; multi-tenant scope; gallery rejection.
- **Integration**: end-to-end enrichment with mocked anonymization; XP credit visible.
- **E2E**: simulate location near a seeded report → enrich → see photo added.

## Definition of Done

- [ ] Enrich action service shared across surfaces
- [ ] Camera screen accepts `mode=enrich`
- [ ] GPS-mismatch sheet
- [ ] Backend enrich endpoint with anti-fraud
- [ ] `report_enrichments` table + Alembic migration
- [ ] +100 XP credit
- [ ] Offline queue integration
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Architecture (multi-tenant, idempotency): `docs/engineering/architecture-patterns.md`
- Security (anti-fraud, rate limiting, GPS validation): `docs/engineering/security-baseline.md`
- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- expo-location accuracy modes: https://docs.expo.dev/versions/latest/sdk/location/

### Project context

- Photo upload pipeline: `00-foundation/07-photo-upload-pipeline.md`
- Anonymization pipeline: `00-foundation/08-anonymization-pipeline.md`
- Camera screen: `08-camera-live/`
- Offline queue: `00-foundation/09-offline-queue.md`
- `docs/user-stories.md` (US: Collaborative Evidence)
- `CLAUDE.md`

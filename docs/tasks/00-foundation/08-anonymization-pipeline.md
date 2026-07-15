# Anonymization Pipeline · Face/plate blur (LGPD-critical)

> **Type:** Foundation · Privacy / Compliance\
> **Screen(s):** Camera (08), Manual Report (09), Confirm Report (10), Civic Feed (07), all detail
> screens\
> **Effort:** XL (1+ week)\
> **Dependencies:** `00-foundation/07-photo-upload-pipeline.md`,
> `00-foundation/16-yolov8-inference-service.md`, `00-foundation/17-docker-dev-environment.md`\
> **Status:** ⬜ Not started\
> **Labels:** `backend`, `ai`, `lgpd`, `compliance`, `foundation`, `critical`

## Context

**Legal requirement.** Every photo a citizen uploads must pass through this pipeline before it
becomes publicly visible. The pipeline detects sensitive content (faces, license plates, document
numbers, and other configurable categories) and applies an irreversible blur over those regions.
Without this, CityHero is in violation of LGPD and exposes minors and bystanders who never consented
to appear publicly.

The pipeline is driven by an AI service (`00-foundation/16-yolov8-inference-service.md`) that
detects objects with bounding boxes; this task is the orchestration layer that takes a raw photo,
runs the detection, applies the blur, stores the anonymized version, and only then marks the photo
as feed-ready.

This task is **non-negotiable** before any photo-receiving screen can ship.

## User Story

**As a** Citizen,\
**I want** my photo to be automatically anonymized for faces, plates, and other sensitive details,\
**In order to** report problems without exposing bystanders to the public.

**As a** Data Privacy Officer,\
**I want** every public photo to pass through automated anonymization,\
**In order to** comply with LGPD and avoid liability for exposing minors or third parties.

## Acceptance Criteria

### Scenario · Standard happy path

**Given** a photo has been uploaded and stored in the raw bucket\
**When** the anonymization pipeline picks it up from the queue\
**Then** the AI service detects faces, license plates, and any configured sensitive categories\
**And** each detection's bounding box is expanded by a small margin (e.g., 10%) before blurring\
**And** a Gaussian blur strong enough to be irreversible (large kernel) is applied\
**And** the anonymized image is saved to the anonymized bucket\
**And** the photo record's `anonymized_at` is set\
**And** a thumbnail is generated from the anonymized version

### Scenario · Multiple detections

**Given** a photo contains 3 faces and 2 license plates\
**When** the pipeline runs\
**Then** all 5 regions are blurred\
**And** the bounding boxes can be saved (encrypted) for audit purposes — never publicly served

### Scenario · Confidence threshold

**Given** the AI returns a low-confidence detection (below the configured threshold)\
**When** the pipeline processes it\
**Then** the region is **still** blurred (false positives in blurring are acceptable; missed faces
are not)\
**And** a high false-positive rate triggers an alert for retraining

### Scenario · No detections

**Given** a photo with no faces or plates\
**When** the pipeline processes it\
**Then** the original photo is copied (unmodified) to the anonymized bucket\
**And** the photo record is marked anonymized

### Scenario · Sensitive content beyond faces and plates

**Given** the pipeline configuration includes additional categories (document numbers, name tags,
screen content)\
**When** the AI service detects them\
**Then** each region is blurred the same way\
**And** the configuration is hot-reloadable without redeploying

### Scenario · Pipeline failure

**Given** the AI service is unavailable or fails on a specific photo\
**When** the pipeline processes it\
**Then** the job retries with exponential backoff (e.g., 1s, 5s, 30s, 5min)\
**And** after a hard cap (e.g., 24h of retries) the photo is marked `anonymization_failed`\
**And** the photo is **not** displayed publicly under any circumstance\
**And** an alert is sent to the on-call so the case can be investigated

### Scenario · Manual review queue

**Given** a photo is flagged for manual review (low AI confidence, or user-reported)\
**When** a moderator opens the queue\
**Then** they see the anonymized version + bounding boxes overlay\
**And** can mark "approve", "blur more", or "reject"\
**And** their decision is logged with their user ID and timestamp

### Scenario · Audit trail

**Given** a photo has been anonymized\
**When** an auditor needs to verify what was blurred\
**Then** the original photo is retrievable from the encrypted raw bucket within the retention window
(90 days)\
**And** the AI's detections (bounding boxes + confidence) are stored alongside the photo record\
**And** all access to raw photos is logged

### Scenario · Public access

**Given** a photo is referenced in a feed item\
**When** a user requests it\
**Then** only the anonymized version is served (via signed URL)\
**And** raw access is restricted to internal services and audit roles

### Scenario · Reverse-blur prevention

**Given** the blurring algorithm\
**When** an attacker attempts to reverse it (e.g., deconvolution)\
**Then** the kernel size and strength are large enough to make recovery infeasible\
**And** the original is never embedded in metadata

## Backend (orchestration)

### Where the pipeline lives

```
apps/backend/src/services/anonymization/
├── orchestrator.py
├── blur.py
├── moderation_queue.py
└── audit.py
```

### Behavior

- A background worker picks up anonymization jobs from the queue (typically Redis-backed via Celery
  or arq).
- For each job: fetch the raw photo from the storage bucket, call the AI service to detect, apply
  blur using OpenCV (or PIL with a strong Gaussian kernel), upload the anonymized version, generate
  a thumbnail, update the photo record.
- The job is idempotent: if a job is retried after partial completion, it re-runs cleanly without
  duplicating work.
- Detection bounding boxes are persisted (encrypted) for audit.
- The worker exposes metrics: jobs/min, mean duration, P95 duration, failure rate.

### Configuration

- Confidence threshold (default low — bias toward over-blur).
- Bounding-box margin (e.g., 10%).
- Blur kernel size (e.g., proportional to box dimensions).
- Categories to blur (faces, plates, optionally documents/screens/name-tags).
- Retry policy.
- Hot-reloadable from a config service or environment.

### Manual review queue

A moderator screen (in the manager admin app — separate from the citizen MVP scope, but the queue is
API-ready) lists photos flagged for human review with the anonymized image + detection overlays.

## Backend (FastAPI endpoints)

| Method | Path                                                 | Purpose                                       |
| ------ | ---------------------------------------------------- | --------------------------------------------- |
| GET    | `/api/v1/photos/{id}`                                | Photo metadata (signed URLs)                  |
| GET    | `/api/v1/photos/{id}/url`                            | Issue a signed URL for the anonymized version |
| POST   | `/api/v1/photos/{id}/reanonymize` (admin)            | Force re-run for a specific photo             |
| GET    | `/api/v1/admin/anonymization/queue` (admin)          | List manual-review items                      |
| POST   | `/api/v1/admin/anonymization/{id}/approve` (admin)   | Moderator approves                            |
| POST   | `/api/v1/admin/anonymization/{id}/blur-more` (admin) | Moderator requests stronger blur              |

All admin endpoints require the `moderator` or higher role.

## Database (PostgreSQL)

### Extensions to `photos` table

| Column                 | Type        | Notes                                                |
| ---------------------- | ----------- | ---------------------------------------------------- |
| `anonymization_status` | varchar(20) | `pending`, `processing`, `done`, `failed`, `flagged` |
| `anonymized_at`        | timestamptz | Null until done                                      |
| `detections_count`     | int         | Number of regions blurred                            |
| `ai_model_version`     | varchar(20) | For reproducibility                                  |

### `photo_detections` table (encrypted)

| Column       | Type         | Notes                          |
| ------------ | ------------ | ------------------------------ |
| `id`         | UUID PK      |                                |
| `photo_id`   | UUID FK      |                                |
| `category`   | varchar(50)  | `face`, `license_plate`, etc.  |
| `bbox`       | jsonb        | Normalized coords [x, y, w, h] |
| `confidence` | numeric(4,3) | 0.0–1.0                        |
| `created_at` | timestamptz  |                                |

### `photo_audit_access` table

| Column        | Type        | Notes                                     |
| ------------- | ----------- | ----------------------------------------- |
| `id`          | UUID PK     |                                           |
| `photo_id`    | UUID FK     |                                           |
| `accessed_by` | UUID FK     | User who accessed                         |
| `purpose`     | varchar(50) | `audit`, `manual_review`, `legal_request` |
| `accessed_at` | timestamptz |                                           |

## Edge Cases

- **AI returns no detections on a photo that clearly has faces**: monitored as a quality metric;
  manual review queue handles, and the model is retrained.
- **AI service down**: jobs queue up; alerts fire if the queue depth exceeds threshold; nothing is
  publicly exposed in the meantime.
- **Photo too large to fit in memory**: streaming/down-sampling for inference; the original is
  preserved.
- **Photo upload corrupted**: the pipeline catches the decode error, marks the job as failed, and
  the photo is not displayed.
- **User reports a published photo as still revealing**: a "report this photo" button on the feed
  creates a moderation queue item; the photo is hidden until moderated.
- **GDPR-style "right to be forgotten" request**: deleting the photo cascades to the anonymized
  version and the detection records.
- **Blur kernel too small at high resolution**: kernel size is computed proportionally to the
  bounding box dimensions, not a fixed pixel count.

## Privacy / LGPD

This pipeline **is** the LGPD compliance layer for photos. Specific measures:

- The original (pre-anonymization) photo never leaves the encrypted raw bucket.
- Raw access is logged and restricted to roles `admin`, `auditor`, `moderator`.
- The 90-day raw retention is enforced by a scheduled cleanup job.
- Detection bounding boxes are stored encrypted at rest.
- The anonymized version is what every public consumer sees.
- For minors specifically, the policy may require even stricter handling — the moderation queue
  surfaces flagged child detections for explicit human approval.

See `security-baseline.md` for the full LGPD framework.

## Analytics

| Event                              | When                          | Props                                  |
| ---------------------------------- | ----------------------------- | -------------------------------------- |
| `anonymization.job_started`        | Worker picks up job           | `photo_id`                             |
| `anonymization.job_succeeded`      | Job completes                 | `duration_ms`, `detections_count`      |
| `anonymization.job_failed`         | Permanent failure             | `photo_id`, `reason`                   |
| `anonymization.manually_flagged`   | Moderator queue triggered     | `photo_id`, `reason`                   |
| `anonymization.moderator_decision` | Moderator approves/blurs more | `photo_id`, `decision`, `moderator_id` |

## Tests

- **Unit**: blur correctly applies to a list of bounding boxes; confidence threshold biases toward
  over-blur; detection record is persisted; retry policy honored.
- **Integration**: end-to-end: upload photo → pipeline runs → public URL serves the anonymized
  version, raw is gated.
- **AI quality regression**: a curated test set of photos with known faces/plates measures detection
  recall (false negatives are the danger) and precision; thresholds enforced in CI.
- **Adversarial**: deconvolution attack on a blurred image fails to recover identifiable features.
- **Load**: pipeline handles peak load (e.g., 50 photos/sec) without queue runaway.

## Definition of Done

- [ ] Worker implementation with retry/backoff
- [ ] Integration with the AI service (`16-yolov8-inference-service.md`)
- [ ] Blur application with proportional kernel
- [ ] Anonymized + thumbnail buckets populated
- [ ] Photo record updated with status, model version, detection count
- [ ] Encrypted detections persisted
- [ ] Audit-access logging
- [ ] Admin endpoints for moderation queue
- [ ] Quality-regression test suite in CI
- [ ] Alerting on queue depth and failure rate
- [ ] Legal review approves the implementation

## Standards & References

### Cross-cutting standards

- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Architecture (background workers, layered services): `docs/engineering/architecture-patterns.md`
- Observability: `docs/engineering/observability.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- OpenCV (Gaussian blur): https://docs.opencv.org/
- Pillow (PIL): https://pillow.readthedocs.io/
- Celery: https://docs.celeryq.dev/ — or arq: https://arq-docs.helpmanual.io/
- LGPD: Lei nº 13.709/2018

### Project context

- AI inference service: `00-foundation/16-yolov8-inference-service.md`
- Photo upload pipeline: `00-foundation/07-photo-upload-pipeline.md`
- `docs/features.md` § 1 (anonymization mandatory)
- `CLAUDE.md`

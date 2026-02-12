# Photo Upload Pipeline · Compress, upload, retry, EXIF strip

> **Type:** Foundation · Media pipeline
> **Screen(s):** Camera (08), Manual Report (09), Confirm Report (10), Field Team app (out of MVP)
> **Effort:** L (3-5 days)
> **Dependencies:** `00-foundation/05-api-client.md`, `00-foundation/09-offline-queue.md`, `00-foundation/17-docker-dev-environment.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `backend`, `media`, `lgpd`, `foundation`

## Context

The pipeline that takes a photo from capture all the way to durable storage,
ready for AI processing and feed display. It handles client-side compression
to keep upload sizes reasonable on slow networks, EXIF stripping to remove
sensitive metadata, multipart upload with progress reporting, retry on
transient failures, and graceful enqueue when the device is offline.

The output of this pipeline feeds the **anonymization pipeline**
(`00-foundation/08-anonymization-pipeline.md`), which is a LGPD legal
requirement before any photo becomes publicly visible.

## User Story

**As a** Citizen,
**I want** my photo to upload reliably even on poor connections,
**In order to** report problems without losing my work to network hiccups.

## Acceptance Criteria

### Scenario · Standard upload (online, good network)

**Given** the user just captured a photo and confirmed the report
**When** the upload starts
**Then** the photo is compressed to a target max long edge (e.g., 1920px) and JPEG quality (e.g., 85)
**And** EXIF metadata is stripped except for orientation
**And** GPS coordinates from the device sensor (not EXIF) are attached as a separate metadata field
**And** the upload uses multipart with progress events surfaced to the UI
**And** the response returns a photo ID stored on the new report

### Scenario · Slow network, partial upload

**Given** the network is slow and the upload is in progress
**When** the connection drops mid-upload
**Then** the client retries the upload from the beginning (or resumes from the last chunk if multipart-resumable is supported)
**And** retry follows exponential backoff with a cap on attempts
**And** the user is shown a "retrying" state, not a failure

### Scenario · Offline at upload time

**Given** the device has no internet
**When** the user submits the report
**Then** the photo and report metadata are saved to the offline queue
**And** the user gets an immediate "saved locally · will sync" confirmation
**And** the queue auto-syncs when connectivity returns

### Scenario · EXIF metadata stripped

**Given** the source photo carries EXIF metadata (camera info, GPS, timestamps)
**When** the upload pipeline processes it
**Then** all EXIF is removed except orientation
**And** the orientation is applied so the image is correctly oriented when re-displayed

### Scenario · Compression preserves orientation

**Given** the source photo is in landscape with EXIF orientation flag
**When** compressed
**Then** the saved image is correctly rotated and re-encoded without the orientation flag
**And** does not appear sideways in the feed

### Scenario · Server-side validation

**Given** an upload arrives at the backend
**When** the file is processed
**Then** the server validates MIME type by content (not extension), size (max 10MB), and dimensions (max 8000×8000)
**And** rejects malformed or oversized files with a clear error code

### Scenario · Storage layout

**Given** an upload succeeds
**When** the backend stores the file
**Then** the raw photo lands in the raw bucket (private, retained 30 days for audit)
**And** the file path includes the city ID, year/month, and a UUID
**And** the photo record in the database stores the bucket path, content hash (SHA-256), and metadata

## Frontend (React Native)

### Where the pipeline lives

```
packages/api_client/src/uploads/
├── PhotoUploader.ts
├── compress.ts
├── stripExif.ts
└── progressTracker.ts
```

### Behavior

- Receives a captured photo URI or asset, target compression settings, and the report metadata.
- Returns a promise that resolves to the photo ID after a successful upload, with progress events along the way.
- On offline detection, hands off to the offline queue with the same input shape so the resumed flow goes through the same path.
- Surfaces granular states (compressing, uploading, retrying, succeeded, failed) so the host screen can render appropriate feedback.

### Compression

A photo-manipulation library compresses the long edge to the target size and re-encodes JPEG at the target quality. Compression is done on a worker thread when supported to avoid jank.

### Progress reporting

The host screen subscribes to progress events (0–100%) and shows a bar or percentage. Resume from the same percentage when retrying after a transient error.

## Backend (FastAPI)

### Endpoints

| Method | Path                          | Purpose                                              |
|--------|-------------------------------|------------------------------------------------------|
| POST   | `/api/v1/photos`              | Upload a photo (multipart). Returns the photo ID.   |
| POST   | `/api/v1/photos/presigned`    | Issue a pre-signed S3 PUT URL for direct upload.    |
| GET    | `/api/v1/photos/{id}`         | Fetch metadata (not the binary). Signed URL for binary. |

The two upload paths support two strategies:

- **Server-relayed**: the client posts to FastAPI, which streams to MinIO/S3. Simpler, slower for large files.
- **Direct-to-storage with pre-signed URL**: the client gets a pre-signed URL and uploads directly. Faster, lower backend CPU. Default for production.

### Server-side validation

- MIME sniffing (libmagic / python-magic) — never trust the extension.
- Size cap enforced by middleware before parsing the body.
- Dimensions check after the file is read.
- Content hash (SHA-256) computed and stored to detect duplicate uploads.

### Anonymization handoff

After the raw photo is durably stored, the backend enqueues an anonymization job (see `00-foundation/08-anonymization-pipeline.md`). The photo record's `anonymized_at` is null until that job completes.

## Database (PostgreSQL)

### `photos` table

| Column             | Type            | Notes                                                |
|--------------------|-----------------|------------------------------------------------------|
| `id`               | UUID PK         |                                                      |
| `user_id`          | UUID FK         | Nullable for anonymous reports (kept on report)     |
| `city_id`          | UUID FK         | Multi-tenant scope                                   |
| `bucket_path_raw`  | text            | Path in the raw-photos bucket                        |
| `bucket_path_anon` | text            | Path in the anonymized bucket; null until processed  |
| `bucket_path_thumb`| text            | Thumbnail path                                       |
| `content_hash`     | char(64)        | SHA-256 hex                                          |
| `mime_type`        | varchar(50)     |                                                      |
| `size_bytes`       | bigint          |                                                      |
| `width`            | int             |                                                      |
| `height`           | int             |                                                      |
| `taken_at`         | timestamptz     | Device clock (informational; not authoritative)     |
| `gps_latitude`     | numeric(9,6)    | From device sensor                                   |
| `gps_longitude`    | numeric(9,6)    | From device sensor                                   |
| `anonymized_at`    | timestamptz     | Null until anonymization completes                   |
| `created_at`       | timestamptz     |                                                      |

Indexes on `user_id`, `city_id`, and `content_hash`.

## Edge Cases

- **Duplicate upload** (same hash): return the existing photo ID instead of creating a new record.
- **Photo from gallery vs camera**: gallery uploads are flagged for manual review (anti-fraud, see `CLAUDE.md`). The pipeline preserves the source flag.
- **Very small image** (< 200×200): rejected as likely junk.
- **HEIC/HEIF format on iOS**: convert to JPEG client-side before upload.
- **Multi-photo upload (future)**: pipeline must support a sequence; for MVP, one photo per report is sufficient.
- **Upload mid-app-kill**: the offline queue holds the work; no data lost.
- **Storage quota exceeded**: clear error to the user; ops alert on backend.

## Privacy / LGPD

- EXIF stripped on upload (specifically: GPS, camera serial, owner name).
- The raw bucket is private, with a 30-day retention before auto-delete.
- Photos are **not** publicly displayable until the anonymization pipeline completes successfully.
- Direct-to-storage URLs are short-lived (e.g., 5 minutes) and tied to the user.

## Analytics

| Event                    | When                                       | Props                                |
|--------------------------|--------------------------------------------|---------------------------------------|
| `photo.upload_started`   | Pipeline begins                            | `source: camera|gallery`, `bytes`    |
| `photo.upload_succeeded` | Upload confirmed by server                 | `duration_ms`, `bytes_after_compress`|
| `photo.upload_failed`    | All retries exhausted                      | `reason`, `attempts`                  |
| `photo.upload_offline_enqueued` | Queued for later sync               | `bytes`                               |

## Tests

- **Unit (mobile)**: compression preserves orientation; EXIF is stripped; offline triggers enqueue; progress events are dispatched.
- **Unit (backend)**: MIME sniffing rejects mismatched extensions; size and dimension caps enforced; duplicate hash returns existing ID.
- **Integration**: upload → record persisted → anonymization job enqueued.
- **E2E**: capture a photo, confirm a report, see a "synced" indicator on the resulting record.
- **Load**: backend handles concurrent uploads under expected load (Locust scenario).

## Definition of Done

- [ ] Mobile uploader with compression, EXIF strip, progress, retry
- [ ] Server-side validation (MIME, size, dimensions, hash)
- [ ] Two upload paths supported (server-relayed and pre-signed direct)
- [ ] Photo record persisted with all required metadata
- [ ] Anonymization job enqueued after successful upload
- [ ] Offline path integrated with the offline queue
- [ ] Telemetry events fired
- [ ] Tests passing per the strategy above

## Standards & References

### Cross-cutting standards
- Architecture: `docs/engineering/architecture-patterns.md`
- Security (storage, signed URLs, file validation): `docs/engineering/security-baseline.md`
- Observability: `docs/engineering/observability.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references
- expo-image-manipulator: https://docs.expo.dev/versions/latest/sdk/imagemanipulator/
- python-magic (MIME sniffing): https://pypi.org/project/python-magic/
- AWS S3 pre-signed URLs: https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html
- MinIO equivalent: https://min.io/docs/minio/linux/developers/python/API.html

### Project context
- Anonymization pipeline: `00-foundation/08-anonymization-pipeline.md`
- Offline queue: `00-foundation/09-offline-queue.md`
- `CLAUDE.md`

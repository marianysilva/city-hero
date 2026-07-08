# Report Confirmation · Photo preview + anonymization status

> **Type:** Screen feature · UI + LGPD
> **Screen:** SCREEN 10 · Report Confirmation
> **Effort:** M (1-2 days)
> **Dependencies:** `10-report-confirm/01-render-confirm-ui-base.md`, `00-foundation/08-anonymization-pipeline.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `lgpd`

## Context

A photo preview at the top of the screen with a visible **anonymization
status badge** ("2 placas anonimizadas · 0 rostos"). This is one of the
most important LGPD compliance signals in the entire app — the user sees
**what was blurred** before submitting.

Two small action buttons in the top corners:

- 🔄 retake (reopens the camera)
- ✏️ edit (allows light adjustments — for MVP just "retake"; future could include crop/rotate)

The badge state has variants: in-progress ("Anonimizando…"), done with
counts, and failed (allows retry).

## User Story

**As a** Citizen reviewing my photo before submitting,
**I want** to see clearly that sensitive content was blurred,
**In order to** trust that what I'm sending is safe to be public.

## Acceptance Criteria

### Scenario · Anonymization complete

**Given** the anonymization pipeline finished successfully
**When** the photo preview renders
**Then** the anonymized version of the photo is shown
**And** the dark overlay badge at the bottom-left shows a green dot + the counts ("2 placas anonimizadas · 0 rostos")
**And** the retake (🔄) and edit (✏️) buttons appear in the top corners

### Scenario · Anonymization in progress

**Given** the pipeline is still processing
**When** the preview renders
**Then** a subtle "Anonimizando…" overlay is shown over the original photo
**And** the badge reads "Anonimizando · aguarde"
**And** the CTA (task 01) is disabled during this state
**And** when the pipeline completes, the preview updates and the CTA enables

### Scenario · Anonymization failed

**Given** the pipeline returned an error
**When** the preview renders
**Then** the badge shows a warning state ("Anonimização falhou · tente de novo")
**And** a retry button is shown
**And** the CTA is disabled until anonymization succeeds (or the user retakes)

### Scenario · No-photo path

**Given** the user came from manual report without a photo
**When** the preview slot would render
**Then** the slot is removed entirely (handled by task 01's layout)
**And** the form starts where the photo would have been

### Scenario · Retake action

**Given** the user taps 🔄
**When** the action runs
**Then** the camera screen reopens
**And** when a new photo is captured, the screen returns to confirmation with the new photo
**And** the previous form state (category, severity, etc.) is preserved if the user wants to keep it

### Scenario · Privacy detail expansion

**Given** the badge shows counts
**When** the user taps the badge
**Then** a small sheet expands explaining what was blurred (a thumbnail with the blurred regions highlighted)
**And** offers a deeper "Privacy details" link

### Scenario · Zero detections

**Given** the AI detected no sensitive content
**When** the badge renders
**Then** it reads "Nada sensível detectado" with the green dot
**And** the user can still trust the pipeline ran (vs not running at all)

### Scenario · Multiple sensitive categories

**Given** the AI found a mix (e.g., 1 face + 2 plates + 1 document)
**When** the badge renders
**Then** the counts are aggregated by category ("1 rosto · 2 placas · 1 documento anonimizados")

### Scenario · Photo from gallery (manual flow)

**Given** the photo came from the gallery (per `09-manual-report/03`)
**When** the preview renders
**Then** the badge additionally shows a "Foto da galeria · revisão extra" indicator
**And** the anonymization pipeline still runs

### Scenario · Accessibility

**Given** screen reader is on
**When** the user navigates to the preview
**Then** the photo is described
**And** the anonymization badge is announced with state and counts
**And** the retake/edit buttons are labeled

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/ReportConfirm/
├── components/
│   ├── PhotoPreview.tsx
│   └── AnonymizationDetailsSheet.tsx
└── hooks/
    └── useAnonymizationStatus.ts
```

The anonymization indicator on top of the photo is **not** a
screen-local component — it's a `<Badge>` composition from
`@cityhero/design-system` (see
`docs/engineering/component-inventory.md` · Badge section). The hook
picks the right composition per state via children:

- `processing` → `<Badge color="brand" pulse>Anonimizando…</Badge>`
- `done` → `<Badge color="info" size="sm">{rostos} rostos · {placas} placas · {documentos} documentos</Badge>`
- `failed` → `<Badge color="danger" size="sm" onPress={retry}>Anonimização falhou · tentar de novo</Badge>`
- gallery flag → an additional `<Badge color="warning" size="xs">📷 Foto da galeria · revisão extra</Badge>` rendered alongside

### Behavior

- `useAnonymizationStatus` polls the anonymization pipeline and reports the state: `processing`, `done`, `failed`, with counts and the anonymized photo URL.
- `PhotoPreview` renders the photo (anonymized when available) and slots the appropriate `<Badge>` composition based on hook state.
- `AnonymizationDetailsSheet` shows the optional expansion with blurred-region highlights and the privacy link.

### Update strategy

For MVP, the client polls the photo's status endpoint every 1-2s with backoff for up to 30s. If the pipeline takes longer, a "Demorando mais que o esperado" state appears with a retry option. See `architecture-patterns.md` § Real-time updates — push is the canonical async channel; this short-lived polling is the exception, justified because the user is waiting on a single photo within seconds of capture.

## Backend (FastAPI)

### Endpoint

| Method | Path                          | Purpose                                        |
| ------ | ----------------------------- | ---------------------------------------------- |
| GET    | `/api/v1/photos/{id}/status`  | Returns processing / done / failed + counts    |
| GET    | `/api/v1/photos/{id}/preview` | Signed URL for the anonymized photo when ready |

The status response includes: state, counts per category (`face`, `license_plate`, `document`, `screen`), the anonymized photo URL when done, and an error code if failed.

## Database

This task does not change schema. It consumes data from `photos` and `photo_detections` defined in `00-foundation/08`.

## Edge Cases

- **Pipeline very slow**: the user sees the in-progress state and can choose to wait or retake.
- **Pipeline succeeded server-side but the client missed the event**: polling catches up; never strands the user.
- **User taps the privacy details link mid-anonymization**: the sheet shows what's expected to be detected; clarifies the running state.
- **Network drops during polling**: backoff continues until reconnect; once online, status syncs.

## Privacy / LGPD

This task is **the** UX-visible LGPD signal. Specific guarantees:

- The displayed photo is always the **anonymized variant** in the preview.
- The original is never displayed in the UI.
- The counts shown match the actual detections (not faked).
- The "Anonimizando…" state means the photo can't be sent yet — preventing accidental submission before anonymization.

## Analytics

| Event                                      | When                          | Props                                                        |
| ------------------------------------------ | ----------------------------- | ------------------------------------------------------------ |
| `report_confirm.anonymization_in_progress` | Polling started               | —                                                            |
| `report_confirm.anonymization_done`        | Pipeline returned done        | `face_count`, `plate_count`, `document_count`, `duration_ms` |
| `report_confirm.anonymization_failed`      | Pipeline failed               | `code`                                                       |
| `report_confirm.privacy_details_opened`    | User opened the details sheet | —                                                            |
| `report_confirm.retake_pressed`            | User taps 🔄                  | —                                                            |

## Tests

- **Unit**: status hook handles each state; badge variants render correctly.
- **Integration**: in-progress → done transitions enable the CTA; failed state offers retry.
- **A11y**: badge announces state changes; details sheet content is read in order.
- **Visual regression**: each state captured.

## Definition of Done

- [ ] PhotoPreview component
- [ ] `<Badge>` compositions wired for all anonymization states (processing / done / failed) — no screen-local badge component
- [ ] AnonymizationDetailsSheet
- [ ] Status polling hook
- [ ] Retake action wired to the camera
- [ ] Gallery indicator
- [ ] CTA gating during processing
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Observability: `docs/engineering/observability.md`
- Testing: `docs/engineering/testing-strategy.md`

### Project context

- Anonymization pipeline: `00-foundation/08-anonymization-pipeline.md`
- Render UI base: `01-render-confirm-ui-base.md`
- Camera screen (retake target): `08-camera-live/`
- Manual gallery handling: `09-manual-report/03-photo-thumbnail.md`
- `CLAUDE.md`

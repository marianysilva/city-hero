# Manual Report · Photo thumbnail + replace/swap flow

> **Type:** Screen feature · UI + camera handoff
> **Screen:** SCREEN 09 · Manual Report
> **Effort:** S (≤1 day)
> **Dependencies:** `09-manual-report/01-render-manual-ui-base.md`, `08-camera-live/`, `00-foundation/07-photo-upload-pipeline.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ux`, `anti-fraud`

## Context

A small thumbnail showing the photo the user is reporting (if any), the
address, and the GPS accuracy. Below it, a "Trocar foto" link reopens
the camera or a gallery picker so the user can swap. Gallery selections
are explicitly flagged for anti-fraud (gallery photos can't pass through
the camera shutter flow — they always land here, marked as such).

## User Story

**As a** Citizen using the manual flow,
**I want** to see the photo I'm submitting and have the option to swap it,
**In order to** correct the framing without restarting.

## Acceptance Criteria

### Scenario · Default render with photo

**Given** the user arrived with a photo captured from the camera
**When** the thumbnail section renders
**Then** an 80dp square thumbnail shows the photo
**And** next to it, the address and GPS accuracy appear (e.g., "R. São Pedro, 320 · GPS 4m")
**And** "Trocar foto" link is shown below the address

### Scenario · Default render without photo

**Given** the user arrived without a photo (camera permission denied / hardware unavailable / user opted out before capture)
**When** the thumbnail section renders
**Then** the thumbnail is a friendly placeholder ("Sem foto") with a 📷 emoji
**And** the address shows the user's current GPS location
**And** the action link reads "Adicionar foto" (instead of "Trocar foto")

### Scenario · Tap "Trocar foto" / "Adicionar foto"

**Given** the user taps the action link
**When** a small sheet appears
**Then** it offers two options: "Câmera com IA" and "Galeria"
**And** the user can pick one or cancel

### Scenario · Pick "Câmera com IA"

**Given** the user chose camera
**When** the action runs
**Then** the camera screen (SCREEN 08) opens with the existing partial state preserved (category, address)
**And** when the user returns from a successful capture, the new photo replaces the thumbnail
**And** if the user cancels the camera, the original photo (if any) remains

### Scenario · Pick "Galeria"

**Given** the user chose gallery
**When** the action runs
**Then** the OS photo picker opens
**And** the chosen photo is set as the thumbnail
**And** an internal flag `source: gallery` is attached (anti-fraud per `docs/user-stories.md`)
**And** a soft notice appears: "Foto da galeria · passa por revisão extra"

### Scenario · Photo metadata validation

**Given** a gallery photo is selected
**When** the system inspects EXIF
**Then** if EXIF coordinates exist and significantly differ from the device's current GPS, the system flags it for moderation
**And** if EXIF is missing entirely, the photo is accepted but flagged as `no_exif`
**And** the user is informed transparently ("Vamos validar — só pra garantir")

### Scenario · Photo too small or corrupted

**Given** the chosen photo is below a minimum size (e.g., 200×200) or fails to decode
**When** the system detects
**Then** a friendly error explains and asks the user to pick another
**And** the original photo (if any) is retained until a valid replacement is chosen

### Scenario · Address loading

**Given** the address has not been reverse-geocoded yet
**When** the thumbnail section renders
**Then** a small skeleton replaces the address area until the geocode completes
**And** GPS accuracy still shows immediately

### Scenario · Accessibility

**Given** screen reader is on
**When** the user focuses the section
**Then** the photo is described (or "no photo" announced)
**And** the address and GPS accuracy are read in order
**And** the action link is clearly labeled

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/ManualReport/
├── components/
│   ├── PhotoThumbnail.tsx
│   └── PhotoSourceSheet.tsx
└── hooks/
    └── usePhotoState.ts
```

### Behavior

- `usePhotoState` holds the current photo (URI + metadata: source, EXIF flags, dimensions) plus the address. It's updated when the user swaps via camera or gallery.
- `PhotoSourceSheet` is a small bottom sheet offering the two options.
- The reverse geocode happens via the platform's location library; it's cached for the session.

### Gallery handling

The OS gallery picker returns a URI; the screen validates dimensions and EXIF immediately, then updates the state. Flags travel with the report payload to the backend for moderation.

## Backend (FastAPI)

This task does not introduce backend endpoints. The photo (when uploaded later in the flow per `docs/tasks/10-report-confirm/`) carries the flags as part of the report payload. The backend enforces moderation rules for flagged gallery photos.

## Database

The `reports.photo_source` field records `camera` or `gallery`; flags like `no_exif`, `exif_mismatch` are stored in a JSON column. Schema is owned by the report-creation task.

## Edge Cases

- **HEIC photos on iOS**: convert to JPEG locally before submit (handled by the upload pipeline; this task doesn't worry about format details).
- **Very large gallery photos**: client-side resize to a reasonable max long edge.
- **Gallery picker permission**: not always granted; if denied, the sheet explains and offers system settings.
- **Backgrounded during picker**: state preserved on return.

## Privacy / LGPD

- The photo is held only in memory or a temporary file until the user submits in the next step.
- EXIF stripping happens at upload (per the upload pipeline). Here we only inspect EXIF, not transmit it.
- Gallery flag travels with the report; doesn't leak to other citizens but is part of the moderator/audit view.

## Analytics

| Event                              | When                                       | Props                                |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `manual_report.swap_intent`        | User taps "Trocar foto" / "Adicionar"     | —                                     |
| `manual_report.swap_source_picked` | User picks Camera or Gallery               | `source`                              |
| `manual_report.swap_completed`     | Photo replaced                             | `source`                              |
| `manual_report.photo_validation_failed` | Size/decode issue                     | `reason`                              |
| `manual_report.gallery_exif_flagged` | EXIF mismatch or missing                 | `flag`                                |

## Tests

- **Unit**: state updates correctly per source; EXIF inspection logic; address reverse-geocode caching.
- **Integration**: swap to camera and back; gallery flag attached.
- **A11y**: section labeled; action link announced.

## Definition of Done

- [ ] PhotoThumbnail component
- [ ] PhotoSourceSheet bottom sheet
- [ ] `usePhotoState` hook
- [ ] Camera handoff preserving partial state
- [ ] Gallery handoff with anti-fraud flag
- [ ] EXIF inspection
- [ ] Reverse geocoding for address
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Security (anti-fraud, gallery handling): `docs/engineering/security-baseline.md`
- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references
- expo-image-picker: https://docs.expo.dev/versions/latest/sdk/imagepicker/
- expo-location reverse geocode: https://docs.expo.dev/versions/latest/sdk/location/#locationreversegeocodeasyncoptions

### Project context
- Render UI base: `01-render-manual-ui-base.md`
- Camera screen: `08-camera-live/`
- Photo upload pipeline: `00-foundation/07-photo-upload-pipeline.md`
- `docs/user-stories.md` (Anti-Spoofing & GPS Validation)
- `CLAUDE.md`

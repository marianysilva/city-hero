# Camera · GPS validation on capture (anti-fraud)

> **Type:** Screen feature · Anti-fraud + state
> **Screen:** SCREEN 08 · Camera with AI (live)
> **Effort:** M (1-2 days)
> **Dependencies:** `08-camera-live/04-capture-shutter.md`, `00-foundation/06-auth-system.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `backend`, `screen`, `anti-fraud`, `geo`

## Context

GPS validation is the linchpin of anti-fraud for the entire product. A
report's value comes from being **at the location, now**: this is what
makes the data actionable and gives the prefecture confidence to dispatch
crews. The validation runs in three stages:

1. **Client-side gate** at capture: ensure a usable fix exists; reject
   gallery uploads; check the fix is fresh and reasonably accurate.
2. **Boundary check at submit**: ensure the fix is inside the user's
   active city bounding box (and inside their reasonable home/visit
   range — TBD if the product enforces strictly).
3. **Server-side cross-check at submit** (lives in the report-creation
   task `docs/tasks/10-report-confirm/` flow): verify the EXIF, the
   device-claimed coordinates, and the user's prior pattern.

This task focuses on stages 1 and 2 (the client gate around the camera).
Stage 3 is enforced when the report is created.

## User Story

**As a** Citizen,
**I want** the app to confirm I'm at the right place before letting me capture,
**In order to** trust that my report carries weight and isn't just noise.

**As a** Product owner,
**I want** anti-fraud baked in from the moment of capture,
**In order to** keep data quality high and the prefecture's trust earned.

## Acceptance Criteria

### Scenario · Fresh accurate fix available

**Given** the user has location permission and the device's last fix is fresh (<30s) and accurate (≤50m)
**When** the user taps the shutter
**Then** the capture proceeds with the fix attached (lat, lng, accuracy, timestamp)
**And** the system records the fix's "source" as `live`

### Scenario · Stale fix

**Given** the user has location permission but the last fix is older than 30s
**When** the user taps the shutter
**Then** the system requests a fresh fix before proceeding (up to 5s timeout)
**And** if a fresh fix arrives, capture proceeds normally
**And** if no fresh fix arrives, the user sees the "GPS demorando" sheet with options

### Scenario · Inaccurate fix

**Given** the only fix available has poor accuracy (>100m)
**When** the user taps the shutter
**Then** the system tries to improve the fix (e.g., switch to high-accuracy mode briefly)
**And** if accuracy can't be improved in time, the "GPS impreciso" sheet appears with options: wait a bit more, capture anyway (flagged), or Manual Report

### Scenario · Capture outside the active city

**Given** the fix is valid but the device is outside the user's active city's bounding box
**When** the user taps the shutter
**Then** a soft sheet appears: "Você está fora de {city_name}. Reportes precisam ser feitos onde estão."
**And** offers options: switch active city (if another active city contains the coordinates), Manual Report, or cancel

### Scenario · Capture inside the city but far from home

**Given** the fix is inside the active city
**When** the user taps the shutter
**Then** the capture proceeds — visiting nearby neighborhoods is normal use
**And** any anti-fraud heuristic on "implausible movement" runs at submit time, not here

### Scenario · Permission revoked between sessions

**Given** the user revoked location while the camera was backgrounded
**When** they return and tap the shutter
**Then** the "Sem GPS" sheet from `04-capture-shutter.md` appears
**And** the validation logic does not proceed

### Scenario · GPS spoofing detection (basic)

**Given** the user's reported coordinates show an implausible jump (e.g., from one city to another in a few minutes — using last-fix history kept locally)
**When** the validation runs
**Then** the capture proceeds but the fix is flagged as suspicious in the payload
**And** the server's stage-3 check (at submit) takes additional measures (per `docs/engineering/security-baseline.md` and `docs/user-stories.md`)

### Scenario · No movement since last suspicious flag

**Given** the user previously had a suspicious flag and the device has been stationary
**When** they capture from the same location
**Then** the flag persists on the payload but isn't escalated client-side
**And** the server still applies its policy (rate limits, reputation, shadowban)

### Scenario · Gallery uploads are blocked

**Given** the user attempts to insert a photo from the gallery (the platform's UI may surface such an option in some configurations)
**When** the system handles
**Then** the action is blocked or, if it must proceed, the photo is routed through the **Manual Report** flow (SCREEN 09) where it's flagged for manual moderation
**And** the user gets a clear explanation ("Foto da galeria precisa de validação · vamos te levar pro reporte manual")

### Scenario · EXIF check (client-side hint)

**Given** the captured photo's EXIF is present
**When** the system inspects
**Then** if EXIF coordinates exist and differ significantly from the device's live fix (e.g., 1+ km apart), the payload is flagged
**And** the user is informed transparently ("Vamos validar — só pra garantir")

### Scenario · Accessibility

**Given** screen reader is on
**When** any validation sheet appears
**Then** the explanation is announced
**And** the options are clearly labeled

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/Camera/
├── hooks/
│   └── useGpsValidation.ts
└── components/
    ├── GpsStaleSheet.tsx
    ├── GpsInaccurateSheet.tsx
    └── OutsideCitySheet.tsx
```

### Behavior

- `useGpsValidation` runs a series of checks before capture proceeds, returning a structured result: `{ ok, fix, flags[] }` or `{ blocked, sheet }`.
- Sheets are presented from the camera modal as nested presentations; tapping CTAs either retries, switches city, or routes to Manual Report.
- The hook keeps a small in-memory history of recent fixes for the implausible-jump check (the history is cleared on session end and is never persisted).

### Configuration

Thresholds are configurable:

| Setting               | Default | Purpose                                  |
|-----------------------|---------|------------------------------------------|
| `fresh_max_age_s`     | 30      | Max age of a "fresh" fix                 |
| `acceptable_accuracy_m` | 50    | Acceptable accuracy for live capture     |
| `marginal_accuracy_m` | 100     | Triggers "improve fix" attempt           |
| `improve_timeout_s`   | 5       | How long to wait for a better fix       |
| `implausible_speed_m_per_s` | 50  | Above this between two fixes = flag    |

## Backend (FastAPI)

This task does not change backend endpoints — the server's stage-3 validation runs at report-creation time, owned by `docs/tasks/10-report-confirm/`.

However, the captured payload carries:

- The fix (lat, lng, accuracy, timestamp, source).
- Any flags raised by client-side validation.
- A nonce / idempotency key.

These travel through the upload pipeline and the report-create endpoint.

## Database

Not applicable directly. The `reports` table will store the flags in a JSON column (defined in the report-creation task).

## Edge Cases

- **Mock locations enabled** (Android dev option): the OS marks the fix as mocked; we treat it as suspicious and route to Manual Report or flag for review.
- **Indoor capture** (low GPS accuracy by environment): we accept marginal accuracy after the improve attempt — natural variance shouldn't block legitimate reports.
- **Device clock significantly off**: we trust the OS's monotonic time for "freshness" rather than wall-clock when possible.
- **Two devices same user account**: each has its own history; not cross-device.

## Privacy / LGPD

- The recent-fix history is in memory only and is not persisted or transmitted.
- Coordinates are sent to the backend only as part of a report submission (after the user confirms).
- The fix-source metadata (live, cached, mocked) is included but doesn't identify the user.

## Analytics

| Event                              | When                                       | Props                                  |
|------------------------------------|--------------------------------------------|-----------------------------------------|
| `camera.gps_validated_ok`          | All checks passed                          | `accuracy_m_bucket`                    |
| `camera.gps_validation_blocked`    | Capture blocked at the gate                | `sheet`, `reason`                       |
| `camera.gps_flag_implausible_jump` | Implausible movement detected              | —                                       |
| `camera.gps_flag_mocked`           | Mocked location detected                   | —                                       |

## Tests

- **Unit**: each threshold check; implausible-jump math with history; sheet decision routing.
- **Integration**: stale → fresh-fix retry; inaccurate → improve attempt; outside city → switch-city option.
- **E2E**: simulate locations on a real device or emulator and assert blocked vs allowed.

## Definition of Done

- [ ] `useGpsValidation` hook
- [ ] Three sheets for stale / inaccurate / outside-city
- [ ] Recent-fix history for implausible-jump detection
- [ ] Configuration with sensible defaults
- [ ] Mocked-location detection
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Security (anti-fraud, GPS validation): `docs/engineering/security-baseline.md`
- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Architecture: `docs/engineering/architecture-patterns.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references
- expo-location accuracy modes: https://docs.expo.dev/versions/latest/sdk/location/
- iOS Core Location accuracy: https://developer.apple.com/documentation/corelocation/clmanager/desiredaccuracy
- Android FusedLocationProviderClient: https://developer.android.com/training/location

### Project context
- Capture / shutter: `04-capture-shutter.md`
- Report creation (server stage-3 validation): `docs/tasks/10-report-confirm/`
- Fallback to manual: `08-fallback-to-manual.md`
- `docs/user-stories.md` (Anti-Spoofing & GPS Validation)
- `CLAUDE.md`

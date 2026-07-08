# Camera · Capture / shutter behavior

> **Type:** Screen feature · Capture flow
> **Screen:** SCREEN 08 · Camera with AI (live)
> **Effort:** M (1-2 days)
> **Dependencies:** `08-camera-live/01-render-camera-ui-base.md`, `08-camera-live/03-live-ai-detection.md`, `00-foundation/07-photo-upload-pipeline.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `frontend`, `screen`, `ux`

## Context

What happens when the user taps the shutter (or presses the hardware
volume button as an accessibility alternative): freeze the frame, attach
the latest detection result and the device's GPS coordinates, fire a
haptic confirmation, animate a brief "shutter flash", and navigate to
the Confirmação do Reporte screen (SCREEN 10) where the user reviews
before submitting.

This task does **not** upload the photo (that's the pipeline `00-foundation/07`
triggered after confirmation); it captures the frame in memory and hands
it to the next screen.

## User Story

**As a** Citizen with the problem in frame,
**I want** a single tap to capture confidently,
**In order to** move on to the confirmation without fumbling.

## Acceptance Criteria

### Scenario · Tap shutter, capture succeeds

**Given** the user has the viewfinder active and a detection is on screen
**When** they tap the shutter
**Then** the camera grabs a still photo at full resolution
**And** a brief "shutter flash" animation runs (white opacity dip)
**And** medium haptic feedback fires
**And** the user navigates to the Confirmação do Reporte screen (SCREEN 10) with the photo, the latest detection (category + confidence), and the device GPS attached

### Scenario · Tap shutter without detection

**Given** the user taps the shutter but no detection is on screen
**When** the capture proceeds
**Then** the photo is captured anyway
**And** the navigation to Confirmação carries a `category: null` so the user picks manually
**And** a soft hint on the next screen explains "Não detectamos automaticamente — escolha a categoria"

### Scenario · Hardware volume key capture

**Given** the user is on Android
**When** they press a volume key
**Then** the same capture flow runs as if they tapped the shutter
**And** iOS behavior matches the platform's standard (volume keys may or may not be available depending on configuration)

### Scenario · GPS available

**Given** location permission was granted (per `05-onboarding-neighborhood/02-location-permission.md`)
**When** the capture fires
**Then** the latest GPS fix is attached (lat, lng, accuracy, timestamp)
**And** if the latest fix is stale (>30s), a fresh fix is requested before completing capture

### Scenario · GPS unavailable

**Given** location is not available (denied or no fix)
**When** the user attempts capture
**Then** a soft sheet appears: "Sem GPS, não conseguimos validar o local · Permitir ou reportar manualmente"
**And** the capture does not proceed until the issue is resolved
**And** the user can grant permission or open the Manual Report fallback

### Scenario · Memory pressure

**Given** the device is low on memory
**When** the capture is attempted
**Then** the camera library handles allocation gracefully
**And** if the frame can't be captured, a non-blocking toast appears and the user can try again

### Scenario · Capture while AI is loading

**Given** the AI model is still loading
**When** the user taps the shutter
**Then** the capture still proceeds (no AI category attached)
**And** the user proceeds with manual category selection on the next screen

### Scenario · Rapid taps

**Given** the user taps the shutter multiple times in quick succession
**When** the action is debounced
**Then** only the first tap fires; subsequent taps within ~500ms are ignored
**And** the navigation only happens once

### Scenario · Modal close mid-capture

**Given** the user closes the camera modal during capture
**When** the operation is in flight
**Then** the capture is canceled cleanly
**And** no orphan navigation occurs

### Scenario · Accessibility

**Given** screen reader is on
**When** the user activates the shutter (via touch or hardware key)
**Then** the capture is announced ("Capturando…" then "Foto capturada")
**And** the hardware key alternative is documented in the screen's help (or hint card)

## Frontend (React Native)

### Where it lives

```
apps/city-hero/src/screens/Camera/
├── hooks/
│   └── useCapture.ts
└── components/
    └── ShutterFlash.tsx
```

### Behavior

- `useCapture` orchestrates the flow: locks the camera briefly, grabs the still, attaches the detection result and GPS, fires the haptic and flash, and triggers navigation.
- The captured photo is held in a per-session in-memory store (or passed via navigation params if small) so the next screen can read it.
- If the camera mode is `enrich` (task 09), navigation goes to the enrichment confirmation flow instead of new-report confirmation.
- Hardware key listener is registered on screen mount and removed on unmount.

### Capture details

The still photo uses the camera's full-resolution mode (configurable per device). It's saved to a temporary file path or in-memory buffer, then handed off to the upload pipeline after user confirmation.

EXIF orientation is preserved; the photo is straightened (or the orientation flag stored) before any anonymization or display.

### Animation

- The "shutter flash" is a white overlay that fades in (50ms) and out (150ms) — quick enough to feel snappy.
- The transition to Confirmação is a slide-up modal (matches the screen's existing pattern).

## Backend

This task does not call the backend at capture time. Upload happens later (Confirmação screen, via the photo upload pipeline).

## Database

Not applicable.

## Edge Cases

- **Capture fails (camera library error)**: surface a toast and let the user retry; the viewfinder stays active.
- **GPS fix arrives during capture**: prefer the fresh fix over the cached one.
- **App backgrounded during capture**: the operation is canceled; the viewfinder is reset on return.
- **User tapped shutter then immediately changes filters / lens**: the lens stays fixed during MVP (no lens switching); future tasks could add this.
- **Permission revoked between viewfinder activation and capture**: the camera library throws; the screen catches and re-prompts.

## Privacy / LGPD

- The captured photo is held only in memory or a temporary file until the user confirms or cancels on the next screen.
- If the user cancels, the temporary file is deleted immediately.
- EXIF stripping happens at upload (per the upload pipeline) — at this stage the photo still has EXIF, but it's never transmitted from here.

## Analytics

| Event                       | When                                      | Props                             |
| --------------------------- | ----------------------------------------- | --------------------------------- |
| `camera.shutter_tapped`     | User triggers capture (touch or hardware) | `source: touch                    | volume_key` |
| `camera.capture_succeeded`  | Photo captured                            | `had_detection: bool`, `category` |
| `camera.capture_failed`     | Capture errored                           | `reason`                          |
| `camera.no_gps_sheet_shown` | GPS unavailable at capture                | —                                 |

## Tests

- **Unit**: capture orchestration; debounce on rapid taps; hardware-key listener attached/removed.
- **Integration**: capture with detection → navigation to Confirmação with payload; capture without GPS → sheet appears.
- **E2E**: open camera, tap shutter, land on Confirmação with the photo visible.

## Definition of Done

- [ ] `useCapture` hook with full orchestration
- [ ] ShutterFlash visual feedback
- [ ] Haptic feedback
- [ ] Hardware volume-key listener (Android primarily)
- [ ] GPS attached to capture payload
- [ ] GPS-unavailable sheet
- [ ] Navigation to Confirmação with attached data
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards

- Architecture: `docs/engineering/architecture-patterns.md`
- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references

- react-native-vision-camera takePhoto: https://react-native-vision-camera.com/docs/guides/taking-photos
- expo-camera takePictureAsync: https://docs.expo.dev/versions/latest/sdk/camera/
- React Native Haptics: https://docs.expo.dev/versions/latest/sdk/haptics/

### Project context

- Render UI base: `01-render-camera-ui-base.md`
- AI detection: `03-live-ai-detection.md`
- GPS validation: `05-gps-validation-on-capture.md`
- Photo upload pipeline (used after confirmation): `00-foundation/07-photo-upload-pipeline.md`
- Confirmation screen: `docs/tasks/10-report-confirm/`
- `CLAUDE.md`

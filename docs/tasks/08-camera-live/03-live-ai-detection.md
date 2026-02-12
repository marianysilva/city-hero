# Camera · Live AI detection (bounding box + YOLOv8)

> **Type:** Screen feature · AI + UI
> **Screen:** SCREEN 08 · Camera with AI (live)
> **Effort:** L (3-5 days)
> **Dependencies:** `08-camera-live/01-render-camera-ui-base.md`, `08-camera-live/02-camera-permission.md`, `00-foundation/16-yolov8-inference-service.md`
> **Status:** ⬜ Not started
> **Labels:** `mobile`, `ai`, `screen`, `performance`

## Context

The signature feature of the app: a live YOLOv8 model running on the
camera feed, drawing a cyan bounding box around detected objects and
showing a category label + confidence percentage ("BURACO · 94%",
"PICHAÇÃO · 91%"). The user sees the AI "understanding" the world in
real time — a strong differentiator that justifies the app's existence
and reduces reporting friction (no manual category selection).

Inference runs **on-device when feasible** for low latency and offline
robustness (per `features.md` § 1 "Edge AI Camera"), falling back to the
foundation backend service (`00-foundation/16`) when an on-device model
isn't viable for the platform or category.

## User Story

**As a** Citizen pointing the camera at a problem,
**I want** to see the AI recognize what I'm photographing,
**In order to** trust the system and confirm I framed the right thing.

## Acceptance Criteria

### Scenario · Detection appears for known category

**Given** the viewfinder is showing a known category (pothole, trash, lighting, sidewalk, graffiti, fallen sign, etc.)
**When** the model detects with confidence ≥ the configured threshold
**Then** a cyan bounding box appears around the object
**And** a label above the box shows the category emoji + name + confidence % ("🕳️ BURACO · 94%")
**And** the box and label smoothly track the object as the camera moves (transitions ~150ms)

### Scenario · No detection

**Given** the viewfinder shows something not in the model's vocabulary or below confidence threshold
**When** several frames pass without detection
**Then** the bounding box and label are hidden
**And** a small subtle hint replaces them: "Mire em um problema · ou reporte manualmente"
**And** the hint includes a link to the Manual Report fallback (task 08)

### Scenario · Multiple objects detected

**Given** the model detects two or more objects in the same frame
**When** the highest-confidence one is selected
**Then** only that bounding box is shown (avoids visual clutter)
**And** secondary detections are tracked internally but not rendered

### Scenario · Confidence transitions

**Given** confidence fluctuates between 80% and 95% across frames
**When** the label updates
**Then** the displayed percentage smooths over a short window (~500ms average) to avoid flickering numbers
**And** the box position smooths similarly

### Scenario · Performance budget

**Given** the camera is running
**When** the inference runs
**Then** the viewfinder frame rate stays at ≥30 fps
**And** inference runs at up to 10 fps (every ~3rd frame)
**And** detection latency P95 is ≤200ms on mid-range devices

### Scenario · On-device model loading

**Given** the user opens the camera for the first time after install
**When** the model file is loaded
**Then** initial loading takes up to 2-3 seconds (the viewfinder is active but detection is delayed)
**And** subsequent opens use the cached model with negligible load time

### Scenario · Backend fallback

**Given** the on-device model is unavailable (unsupported platform, model not loaded, low memory)
**When** the camera is running
**Then** the client batches and uploads frames at low fps (e.g., 2 fps) to the foundation AI service
**And** detections come back as before
**And** the user is unaware of the fallback (slightly higher latency is acceptable)

### Scenario · Offline mode

**Given** the device is offline and the on-device model is loaded
**When** detection runs
**Then** it continues to work on-device
**And** the bounding box and label render as normal
**And** the fallback to backend isn't attempted

### Scenario · Model versioning

**Given** the on-device model gets updated through an app update
**When** the new model is loaded
**Then** the detection event metadata includes the model version
**And** subsequent reports include the model version they were created with (for auditability and retraining)

### Scenario · Privacy

**Given** the camera is running detection
**When** frames are processed
**Then** they are processed in-memory only — never stored beyond the inference window
**And** if the backend fallback is used, uploads use signed transient URLs and a short retention (≤24h)
**And** all uploaded frames pass through anonymization before any persistence

### Scenario · Accessibility

**Given** screen reader is on
**When** a detection appears or changes
**Then** the change is announced (debounced to avoid spam)
**And** the announcement uses friendly text ("Buraco detectado, 94 por cento de confiança")

## Frontend (React Native)

### Where it lives

```
apps/mobile/src/screens/Camera/
├── components/
│   └── DetectionOverlay.tsx
└── hooks/
    ├── useOnDeviceModel.ts
    └── useDetectionStream.ts
```

### Behavior

- `useOnDeviceModel` loads and warms the YOLOv8 model on first use, caches it for subsequent sessions, and exposes a `detect(frame)` function.
- `useDetectionStream` subscribes to the camera frame stream, throttles inference to a configured fps, runs detection, applies smoothing, and emits detection events.
- `DetectionOverlay` renders the cyan bounding box and the label, animating between frames.
- The decision to use on-device vs backend lives in a small policy module that considers platform, device capability, model availability, and connectivity.

### Frame format

The camera library produces frames in a platform-native format. A small worker converts to the model's expected tensor shape, runs inference, and returns detections normalized to the screen coordinate system so the overlay can render without extra math.

### Smoothing

A simple exponential moving average smooths the box position and confidence display. Hard category changes (pothole → graffiti) snap rather than blend.

## Backend (FastAPI)

The backend role is the **fallback**: an inference request endpoint already defined by `00-foundation/16-yolov8-inference-service.md`. This task uses it via the API client; no new endpoints.

When the client uploads a frame for inference, the backend:

- Receives it via a signed transient URL (or streamed multipart).
- Runs YOLOv8.
- Returns detections.
- Discards the frame after the response (no long-term storage; subject to the anonymization pipeline if any persistence happens).

## Database

Not applicable directly. Detection events are not persisted per-frame — only the chosen frame on capture (task 04).

## Edge Cases

- **Battery saver mode**: reduce inference fps further (e.g., 3 fps) to conserve power.
- **Thermal throttling**: similarly reduce.
- **Model file corrupted at load**: gracefully fall back to backend; surface a non-blocking warning in logs (not to the user).
- **Camera library reports a bad frame**: skip; continue with next.
- **User covers the lens**: black frame → no detection; the no-detection hint is shown.
- **Confidence right at threshold**: hysteresis (0.65 to show, 0.55 to hide) avoids flickering between shown/hidden states.

## Privacy / LGPD

- Inference is done **on the device** by default — frames never leave it.
- Backend fallback is opt-in (the user can disable it in Settings; in MVP it's on by default with a clear disclosure).
- No frame is ever stored beyond the inference window.
- The detection result (category, confidence) is not PII; the bounding box coords are not either.

## Analytics

| Event                              | When                                       | Props                                  |
|------------------------------------|--------------------------------------------|-----------------------------------------|
| `camera.model_loaded`              | On-device model loaded                     | `version`, `duration_ms`, `cached: bool` |
| `camera.model_load_failed`         | On-device model load failed                | `reason`                                |
| `camera.detection_emitted`         | A detection rendered (sampled)             | `category`, `confidence_bucket`         |
| `camera.fallback_to_backend`       | Backend inference path used                | `reason`                                |
| `camera.no_detection_session`      | A session ended with no detection ever     | `duration_seconds`                      |

## Tests

- **Unit**: smoothing math; hysteresis at threshold; backend fallback policy decisions.
- **Integration**: model load → frame stream → detection events → overlay renders.
- **Performance**: P95 inference latency under budget on a target device.
- **Quality regression**: a curated set of test frames produces expected detections.
- **E2E**: simulate the camera on a real device; pan across a known scene; assert detections.

## Definition of Done

- [ ] On-device model loader with caching
- [ ] Detection stream hook with throttling and smoothing
- [ ] DetectionOverlay component
- [ ] Backend fallback policy and integration
- [ ] Performance budget verified
- [ ] Quality regression tests in CI
- [ ] Telemetry events
- [ ] Tests passing

## Standards & References

### Cross-cutting standards
- Architecture: `docs/engineering/architecture-patterns.md`
- Privacy / LGPD: `docs/engineering/security-baseline.md`
- Observability: `docs/engineering/observability.md`
- Testing: `docs/engineering/testing-strategy.md`

### Library / framework references
- react-native-vision-camera frame processors: https://react-native-vision-camera.com/docs/guides/frame-processors
- TensorFlow Lite (Android): https://www.tensorflow.org/lite
- Core ML (iOS): https://developer.apple.com/documentation/coreml
- ONNX Runtime: https://onnxruntime.ai/
- Ultralytics YOLOv8: https://docs.ultralytics.com/

### Project context
- Foundation AI inference service: `00-foundation/16-yolov8-inference-service.md`
- Render UI base: `01-render-camera-ui-base.md`
- Capture / shutter: `04-capture-shutter.md`
- Fallback to manual: `08-fallback-to-manual.md`
- `CLAUDE.md`

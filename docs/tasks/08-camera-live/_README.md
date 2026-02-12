# SCREEN 08 · Camera with AI (live)

> **Group:** 02 · App Core
> **Prototype screen:** `design/index.html` (search for `title: 'Câmera com IA (ao vivo)'`)
> **Position in navigation:** Modal — opened from the bottom nav center FAB or from the Enriquecer action

## Overview

The **wow factor** of the product. A full-screen camera viewfinder with
**live YOLOv8 detection**: a cyan bounding box and a confidence label
follow whatever the camera sees ("BURACO · 94%", "PICHAÇÃO · 91%",
"PLACA CAÍDA · 89%"). A green dot at the top reads "ANONIMIZAÇÃO
ATIVA" — a constant LGPD trust signal so the user knows faces and
plates will be blurred before going public.

Tap the white shutter to capture. GPS is validated server-side
(anti-fraud). If the AI fails to detect a known category, the user can
fall back to Manual Report (SCREEN 09). When opened from the
Enriquecer flow (SCREEN 07 task 08), the camera works in **enrich mode**
attaching the photo to an existing report rather than creating a new one.

This screen is **portrait-only**, **back-camera-only**, **no gallery
upload** (per anti-fraud — gallery uploads route through Manual Report
with a flag).

## Features (9 tasks)

| # | Task | Effort | Depends on |
|---|------|--------|-----------|
| 01 | [Render UI base · viewfinder, overlays, shutter, tip](./01-render-camera-ui-base.md) | M | `00-foundation/02-design-tokens.md`, `00-foundation/04-status-bar-component.md` |
| 02 | [Camera permission flow](./02-camera-permission.md) | S | task 01 |
| 03 | [Live AI detection · bounding box + YOLOv8 inference](./03-live-ai-detection.md) | L | task 01, `00-foundation/16-yolov8-inference-service.md` |
| 04 | [Capture / shutter behavior](./04-capture-shutter.md) | M | task 01, task 03 |
| 05 | [GPS validation on capture (anti-fraud)](./05-gps-validation-on-capture.md) | M | task 04, `00-foundation/06-auth-system.md` |
| 06 | [Flash control](./06-flash-control.md) | S | task 01 |
| 07 | [Anonymization preview indicator (LGPD)](./07-anonymization-indicator.md) | S | task 01, `00-foundation/08-anonymization-pipeline.md` |
| 08 | [Fallback to Manual Report (when AI/permission fail)](./08-fallback-to-manual.md) | S | task 01, task 02 |
| 09 | [Enrich mode integration (entered from feed)](./09-enrich-mode.md) | M | task 04, `07-civic-feed/08-enriquecer-action.md` |

## Suggested implementation order

```
01 (UI) ──┬─→ 02 (permission) ──→ 08 (fallback)
          ├─→ 03 (AI detection — runs in parallel after permission)
          ├─→ 04 (capture) ──┬─→ 05 (GPS validation)
          │                  └─→ 09 (enrich mode)
          ├─→ 06 (flash)
          └─→ 07 (anonymization indicator)
```

01, 02, and 06 can ship first as a "dumb" camera. 03 (AI) and 04 (capture)
are the heart of the experience. 05 and 09 layer on for compliance and
the secondary capture mode.

## Product notes

- **AI inference is on-device when possible** (Edge AI per `features.md` § 1) for low latency and offline robustness — falling back to the foundation YOLOv8 backend service for heavy lifts or model updates.
- **No gallery, no front camera, no video** — this is a focused capture surface. Photos from gallery would compromise anti-fraud.
- **Anonymization indicator is non-negotiable** — even if the user finds it noisy, it's required for LGPD posture and legal defensibility.
- **Performance budget**: the viewfinder must hit 30 fps minimum; AI inference up to 10 fps with smoothing.
- **Accessibility**: capture must be triggerable by hardware buttons (volume up/down on Android) for users who can't tap precisely.

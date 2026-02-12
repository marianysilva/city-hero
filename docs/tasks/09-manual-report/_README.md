# SCREEN 09 · Manual Report (AI fallback)

> **Group:** 02 · App Core
> **Prototype screen:** `design/index.html` (search for `title: 'Reporte Manual'`)
> **Position in navigation:** Routed from the Camera screen when AI fails, the user opts out, or permission/hardware unavailable

## Overview

The fallback path when the AI camera can't (or shouldn't) lead the
reporting flow. The user lands here with their photo, GPS, and a soft
"IA ficou em dúvida" framing — never a "the AI failed" framing. They
pick a category from a 9-tile grid covering the supported catalog
(pothole, trash, lighting, graffiti, traffic light, tree/pruning,
flooding, signage, other), confirm location on a mini-map (drag pin if
needed), and continue to the standard Confirmação do Reporte screen.

A small footer message frames each manual report as a training signal:
"A IA aprende com cada reporte manual". This converts a friction moment
into a contribution narrative — the user feels they're helping the model
get smarter rather than putting up with a broken AI.

## Features (6 tasks)

| # | Task | Effort | Depends on |
|---|------|--------|-----------|
| 01 | [Render UI base · header, banner, layout, CTA](./01-render-manual-ui-base.md) | S | `00-foundation/02-design-tokens.md` |
| 02 | [Category grid · 9 tiles + active state](./02-category-grid.md) | S | task 01 |
| 03 | [Photo thumbnail + replace/swap flow](./03-photo-thumbnail.md) | S | task 01, `00-foundation/07-photo-upload-pipeline.md` |
| 04 | [Mini-map · location confirm + drag pin](./04-mini-map-location.md) | M | task 01, `00-foundation/10-leaflet-map-wrapper.md` |
| 05 | [AI feedback loop · manual category as training signal](./05-ai-feedback-loop.md) | S | task 02, `00-foundation/16-yolov8-inference-service.md` |
| 06 | [Submit & continue to Confirmação](./06-submit-and-continue.md) | S | tasks 02-05 |

## Suggested implementation order

```
01 (UI) ──┬─→ 02 (category) ──┬─→ 05 (AI feedback)
          │                    └─→ 06 (submit)
          ├─→ 03 (photo) ─────────→ 06
          └─→ 04 (mini-map) ──────→ 06
```

01 first; 02–04 in parallel; 05 and 06 close the flow.

## Product notes

- **Tone**: never blame the AI. The banner says "ficou em dúvida" / "confiança baixa", not "failed". The footer credits the user for helping.
- **Gallery photos** route through this screen with an explicit flag (anti-fraud per `docs/user-stories.md`). Gallery photos always pass through here, never through the camera shutter flow.
- **Categories** map to the catalog in `features.md` § 11 (Scope Expansion). The 9th tile "Outro" surfaces additional categories (noise, abandoned animals, irregular construction, sidewalk obstruction) via a secondary list.
- **Mini-map** uses a small Leaflet preview (not the stylized illustration — this is a confirmation screen, so accuracy matters).
- **AI feedback**: the manual category + photo become training data candidates for the next model iteration (out of scope to implement the retraining itself; this task signals the data point).

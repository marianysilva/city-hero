# 00 · Foundation · Shared components and infrastructure

Tasks that must be in place **before** screen tasks — without them, the screen work either repeats
itself or breaks on integration.

## Tasks (18)

| #   | Task                                                                                          | Effort | Blocks                        |
| --- | --------------------------------------------------------------------------------------------- | ------ | ----------------------------- |
| 01  | [Monorepo setup (Yarn workspaces, ESLint, Prettier, Husky)](./01-monorepo-setup.md)           | M      | everything                    |
| 02  | [Design tokens · colors, typography, spacing, shadows](./02-design-tokens.md)                 | S      | all UI                        |
| 03  | [Bottom nav menu component (5 tabs)](./03-bottom-nav-component.md)                            | M      | screens 06, 07, 08, 16, 28    |
| 04  | [Status bar component (light/dark)](./04-status-bar-component.md)                             | S      | all screens                   |
| 05  | [API client with auth interceptor + retry](./05-api-client.md)                                | M      | all backend                   |
| 06  | [Auth system (Gov.br login + token refresh + secure store)](./06-auth-system.md)              | L      | screens 01, 16, 28            |
| 07  | [Photo upload pipeline (compress + upload + retry)](./07-photo-upload-pipeline.md)            | L      | screens 08, 09, 10            |
| 08  | [AI anonymization pipeline (face/plate blur · LGPD)](./08-anonymization-pipeline.md)          | XL     | screens 08, 09 (CRITICAL)     |
| 09  | [Offline queue (WatermelonDB + sync)](./09-offline-queue.md)                                  | L      | screens 08, 09, 10, 18        |
| 10  | [Leaflet map wrapper (OSM tiles + custom pins)](./10-leaflet-map-wrapper.md)                  | M      | screens 06, 26, 27            |
| 11  | [Push notification handler (FCM + APNs + tap routing)](./11-push-notification-handler.md)     | M      | screens 19, 14                |
| 12  | [Deep link handler (URL schemes + universal links)](./12-deep-link-handler.md)                | M      | screen 01, all share flows    |
| 13  | [i18n (pt-br + en-us)](./13-i18n.md)                                                          | M      | everything                    |
| 14  | [Analytics tracking (events + funnels)](./14-analytics-tracking.md)                           | M      | everything                    |
| 15  | [Error boundary + crash reporter (Sentry)](./15-error-boundary.md)                            | S      | everything                    |
| 16  | [YOLOv8 inference service (FastAPI + S3 + queue)](./16-yolov8-inference-service.md)           | XL     | screens 08, 09, anonymization |
| 17  | [Docker dev environment (PostGIS, Redis, MinIO, AI service)](./17-docker-dev-environment.md)  | M      | backend, AI tasks             |
| 20  | [Observability package (Sentry + structured logs + trace IDs)](./20-observability-package.md) | S      | everything (cross-cutting)    |

## Suggested implementation order

```
01-monorepo-setup       ← first
17-docker-dev-environment
02-design-tokens
04-status-bar-component
20-observability-package ← before error boundary so its Sentry/logger contract is settled
05-api-client
13-i18n
15-error-boundary
14-analytics-tracking
06-auth-system          ← unblocks profile and auth screens
03-bottom-nav-component ← unblocks main navigation
10-leaflet-map-wrapper  ← unblocks Home
12-deep-link-handler
11-push-notification-handler
07-photo-upload-pipeline
09-offline-queue
16-yolov8-inference-service ← backend only, parallelizable
08-anonymization-pipeline   ← depends on 07 and 16; LGPD-critical pipeline
```

## Notes

- **Anonymization (08) is a legal blocker**: no screen accepting a photo can ship without it.
  LGPD/GDPR is non-negotiable.
- **Offline queue (09)** is a competitive differentiator — Pôrto Belo has coastline zones with poor
  signal.
- XL items (08, 16) likely need to be split into subtasks during implementation.

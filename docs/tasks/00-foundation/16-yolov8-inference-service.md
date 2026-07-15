# YOLOv8 Inference Service · Detection API + model management

> **Type:** Foundation · AI service\
> **Screen(s):** Camera (08), Manual Report (09), Anonymization pipeline (08-foundation)\
> **Effort:** XL (1+ week)\
> **Dependencies:** `00-foundation/01-monorepo-setup.md`,
> `00-foundation/17-docker-dev-environment.md`\
> **Status:** ⬜ Not started\
> **Labels:** `backend`, `ai`, `ml`, `foundation`, `critical`

## Context

A standalone inference microservice that runs **YOLOv8** (Ultralytics) and exposes detection
endpoints over HTTP. It serves two primary use cases:

1. **Categorize a citizen's photo** during reporting (pothole, trash, graffiti, lighting, sidewalk,
   etc.) so the app can pre-fill the category.
2. **Detect sensitive content** (faces, license plates, documents) so the anonymization pipeline
   (`08-foundation`) can blur it.

Running the model in a separate process and container avoids dragging PyTorch and large model
weights into the main API. It also lets us scale inference independently and swap models without
redeploying the backend.

## User Story

**As a** Backend Developer,\
**I want** a clean inference API,\
**In order to** integrate AI capabilities without coupling the main app to ML dependencies.

**As a** Citizen,\
**I want** the app to recognize what I'm photographing,\
**In order to** spend less time filling out forms.

## Acceptance Criteria

### Scenario · Standard inference

**Given** a request to detect categories on a photo URL\
**When** the service receives the request\
**Then** it downloads the photo from the storage bucket using a signed URL\
**And** runs YOLOv8 with the configured model version\
**And** returns a list of detections (each with category, bounding box, confidence)\
**And** the P95 inference latency is under 2 seconds for a 1920×1080 photo

### Scenario · Multiple model heads

**Given** the service runs both a category-classification model and a privacy-detection model\
**When** a request specifies which task is needed (or both)\
**Then** the appropriate model(s) are invoked\
**And** a request for both runs them in parallel where possible

### Scenario · Confidence threshold per category

**Given** the configuration sets per-category confidence thresholds (e.g., faces: 0.5; potholes:
0.7)\
**When** detections are filtered\
**Then** only detections meeting their category's threshold are returned\
**And** thresholds are hot-reloadable without restarting

### Scenario · Health endpoint

**Given** a load balancer is health-checking the service\
**When** it queries the health endpoint\
**Then** the response indicates `ready: true` after the model has loaded\
**And** before the model is loaded, indicates `ready: false`

### Scenario · Model version selection

**Given** multiple model versions exist on disk\
**When** a request specifies a model version\
**Then** the service uses that version\
**And** the response includes the model version used for traceability

### Scenario · GPU vs CPU inference

**Given** the host has a GPU available\
**When** the service starts\
**Then** it loads the model onto GPU and uses it for inference\
**And** if no GPU is present, it falls back to CPU with reduced throughput\
**And** the service logs the runtime mode at startup

### Scenario · Queue mode

**Given** a long inference batch (e.g., reanonymizing thousands of historical photos)\
**When** the calling service uses the async queue interface instead of the synchronous endpoint\
**Then** the service consumes from a shared queue (e.g., Redis-backed)\
**And** writes results back to a results topic / store

### Scenario · Failure modes

**Given** an inference fails (corrupt image, OOM, model crash)\
**When** the failure occurs\
**Then** the service returns a clear error code without crashing\
**And** logs the failure with the request ID for debugging\
**And** the calling service handles the error per its retry policy

### Scenario · Local benchmark

**Given** a performance regression test set\
**When** CI runs the suite\
**Then** P95 latency stays within budget\
**And** detection recall on the test set stays above the threshold (false negatives are the bigger
risk for anonymization)

## Service architecture

### Where the service lives

```
apps/ai_service/
├── pyproject.toml
├── Dockerfile
├── src/
│   ├── main.py            ← FastAPI app
│   ├── inference.py       ← model loading + run
│   ├── postprocess.py     ← box filtering, NMS, threshold
│   ├── storage.py         ← signed URL fetch
│   ├── queue_consumer.py  ← async batch mode
│   └── settings.py        ← config + thresholds
├── models/                ← model weights (mounted volume in dev; baked into image in prod)
│   ├── yolov8-categories.pt
│   └── yolov8-privacy.pt
└── tests/
```

### Endpoints

| Method | Path               | Purpose                                               |
| ------ | ------------------ | ----------------------------------------------------- |
| GET    | `/health`          | Liveness + model load status                          |
| GET    | `/version`         | Service version + loaded model versions               |
| POST   | `/inference`       | Synchronous inference on a photo URL                  |
| POST   | `/inference/batch` | Async batch inference (results via callback or queue) |

### Request/response shape (conceptual)

A request to the synchronous endpoint provides the photo URL or bucket path, the task(s) to run
(categories, privacy, or both), and an optional model version. The response returns a list of
detections — each with category, normalized bounding box, confidence, and the model version that
produced it.

### Confidence policy

- **Privacy detections** (faces, plates) bias toward over-blur — low threshold (e.g., 0.3) so the
  pipeline blurs more rather than miss something.
- **Category detections** (pothole, trash) use a higher threshold (e.g., 0.7) so the app pre-fills
  only when confident; below threshold, the user picks manually.

### Queue mode (async)

A queue consumer subscribes to a Redis (or RabbitMQ) stream/queue and processes inference jobs in
batches. Useful for backfills and the anonymization pipeline at scale. Results are written to a
results topic or directly back to the photo record.

## Model lifecycle

### Training

Training data and notebooks live in `packages/ia_research`. Training is **not** part of this task —
this is the inference service. The output of training is the `.pt` weight file, which is mounted
(dev) or baked into the image (prod).

### Versioning

Each deployed model has a semver-like identifier (e.g., `categories@1.2.0`, `privacy@2.1.0`). The
version is logged on every inference and stored alongside detections so future audits can identify
which model produced a given result.

### Continuous improvement

The "before/after" photos validated by field teams (closing a ticket) form a continuous training
set. A separate task in `packages/ia_research` periodically retrains and produces new weights. New
weights are deployed via a canary rollout (a small percentage of traffic), and metrics are compared
before full rollout.

## Backend integration

The main FastAPI app does not own this service. It calls it via HTTP (or queue) using the API client
patterns from `05-api-client.md`. The integration is bound by the AI service URL configured at
deploy time.

## Infrastructure

- **Dev**: in `docker-compose.yml` (see `17-docker-dev-environment.md`).
- **Production**: a dedicated container (or Kubernetes deployment) with GPU nodes for cost
  efficiency, behind a load balancer, autoscaling on queue depth or request rate.
- **Cold start**: model loading is slow (~30s); minimum replica count of 2 to avoid all-instance
  cold start.

## Database

The service is stateless. All persistence happens in the calling services' DBs (anonymization
records detections in `photo_detections`).

## Edge Cases

- **Image format unsupported**: return a clear error code; calling services can convert and retry.
- **Image extremely large**: down-sample before inference; preserve original elsewhere.
- **Model file missing/corrupt at startup**: service refuses to become ready; ops alert.
- **Request bursts cause GPU saturation**: a per-instance request queue plus autoscaling handle
  bursts; if backlog grows, consider rate limiting upstream.
- **Time-of-day variance** (e.g., night-time photos): document model performance characteristics;
  supplement training data with night-time examples.

## Privacy / LGPD

- The service downloads photos from signed URLs and never persists them locally beyond the request
  lifetime.
- Detection results are returned to the caller; the service itself doesn't store them.
- Logs do not contain photo content or identifying details; only request IDs and metadata.

## Analytics / Metrics

- Latency P50/P95/P99 per endpoint and per task.
- Detections per category (volume).
- Confidence distribution (helps tune thresholds).
- GPU utilization, queue depth, error rate.
- Model version split (during canary rollouts).

These feed Grafana / Datadog dashboards (see `observability.md`).

## Tests

- **Unit**: post-processing (NMS, threshold filtering); request validation; error mapping.
- **Integration**: end-to-end with a real model on a test image set.
- **Quality regression**: maintained test set with ground-truth labels; CI fails if recall drops
  below threshold (privacy-critical).
- **Performance**: benchmark suite enforces latency budgets.
- **Load**: concurrency test confirms the service handles expected peaks without OOM or queue
  runaway.

## Definition of Done

- [ ] FastAPI service skeleton with `/health`, `/version`, `/inference`, `/inference/batch`
- [ ] Model loading at startup with readiness gating
- [ ] Two model heads loaded (categories + privacy)
- [ ] Per-category confidence thresholds
- [ ] Hot-reload of thresholds
- [ ] GPU support with CPU fallback
- [ ] Async queue consumer
- [ ] Quality regression test set in CI
- [ ] Performance benchmark in CI
- [ ] Docker image with model weights
- [ ] Healthchecks + observability metrics

## Standards & References

### Cross-cutting standards

- Architecture (microservices, async): `docs/engineering/architecture-patterns.md`
- Observability: `docs/engineering/observability.md`
- Testing (model regression): `docs/engineering/testing-strategy.md`
- Security (storage, signed URLs): `docs/engineering/security-baseline.md`

### Library / framework references

- Ultralytics YOLOv8: https://docs.ultralytics.com/
- PyTorch: https://pytorch.org/docs/
- OpenCV: https://docs.opencv.org/
- FastAPI: https://fastapi.tiangolo.com/
- BentoML (alternative serving): https://docs.bentoml.com/
- TorchServe (alternative serving): https://pytorch.org/serve/

### Project context

- Anonymization pipeline (consumer): `00-foundation/08-anonymization-pipeline.md`
- Training notebooks: `packages/ia_research/`
- `CLAUDE.md`

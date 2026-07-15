# Docker Dev Environment · PostGIS + Redis + MinIO + AI service

> **Type:** Foundation · Infrastructure\
> **Screen(s):** Backend stack (powers all screens)\
> **Effort:** M (1-2 days)\
> **Dependencies:** `00-foundation/01-monorepo-setup.md`\
> **Status:** ⬜ Not started\
> **Labels:** `infrastructure`, `foundation`, `docker`, `backend`, `postgis`

## Context

A Docker Compose dev stack that boots the full backend universe in one command:

- **PostgreSQL with PostGIS** — geographic queries are core (heatmaps, clustering, "10km radius
  feed", smart routing). Without PostGIS, every spatial query reverts to slow and incorrect raw
  lat/lng math.
- **Redis** — rate-limiting state, session cache, and async-job broker.
- **MinIO** — S3-compatible object storage for photos pre-cloud (so the full pipeline runs locally
  before AWS).
- **FastAPI backend** — the main API.
- **Next.js web admin** — the manager-facing app.
- **AI inference service** — separate FastAPI app running YOLOv8.

## User Story

**As a** Backend Developer,\
**I want** to run a single command and have the entire stack running locally,\
**In order to** develop and run integration tests without manual setup.

## Acceptance Criteria

### Scenario · One-command boot

**Given** the developer just cloned the repo and copied `.env.example` to `.env`\
**When** they run the dev-up command\
**Then** all services start in dependency order (db → redis → minio → backend → ai → web)\
**And** the backend health endpoint returns 200 within 30 seconds\
**And** the web admin is reachable on its port\
**And** the AI service is reachable on its port

### Scenario · PostGIS extension

**Given** the database container is healthy\
**When** the backend connects on first run\
**Then** an Alembic migration enables the PostGIS extension\
**And** subsequent migrations can use geometry/geography types and PostGIS functions\
**And** a query for the PostGIS version returns successfully

### Scenario · MinIO bucket bootstrap

**Given** the MinIO container is running\
**When** the backend starts\
**Then** it creates buckets for raw photos, anonymized photos, and thumbnails if missing\
**And** sets bucket policies (private with signed-URL access)

### Scenario · Redis as cache and queue

**Given** Redis is running\
**When** the backend starts\
**Then** Redis is reachable from the backend\
**And** the backend can use it as a cache (for rate limits, ephemeral data) and as a job queue
broker

### Scenario · AI service decoupled

**Given** the AI service container is running\
**When** the backend posts an inference request to the AI service\
**Then** the service responds with detected objects (or 503 if the model is still loading)\
**And** the AI service runs in a separate container (separate Python process, separate model
loading)

### Scenario · Volumes persist across restarts

**Given** the dev stops and restarts the stack\
**When** the stack restarts\
**Then** Postgres data persists (named volume)\
**And** MinIO objects persist (named volume)\
**And** Redis cache is volatile (acceptable — it's a cache)

### Scenario · Env validation

**Given** required env vars are missing\
**When** the dev starts the backend container\
**Then** the backend exits with a clear error naming the missing var\
**And** points to the example env file for reference

## Services

The compose file defines these services:

| Service      | Image                        | Ports      | Volumes                 | Healthcheck          |
| ------------ | ---------------------------- | ---------- | ----------------------- | -------------------- |
| `db`         | PostGIS-enabled Postgres 16  | 5432       | `pgdata`                | `pg_isready`         |
| `redis`      | Redis 7                      | 6379       | (volatile)              | `redis-cli ping`     |
| `minio`      | MinIO latest                 | 9000, 9001 | `miniodata`             | `/minio/health/live` |
| `backend`    | Built from `apps/backend`    | 8000       | (none)                  | `/health` HTTP       |
| `ai-service` | Built from `apps/ai_service` | 8001       | model files (read-only) | `/health` HTTP       |
| `web`        | Built from `apps/web`        | 3000       | (none)                  | (depends on backend) |

Service dependencies are declared so each service waits for its dependencies to be healthy before
starting.

## Environment variables

The `.env.example` enumerates required variables grouped by purpose:

- **Postgres**: user, password, database name.
- **Backend**: app name, secret key, JWT algorithm, token expiry, allowed CORS origins, log level,
  environment label.
- **Storage (MinIO)**: root user, root password, bucket names.
- **Inference**: AI service URL, model path, confidence thresholds.
- **Web**: public API URL.
- **Optional integrations**: Sentry DSN, SMTP credentials.

Each variable in `.env.example` has a short comment explaining its purpose and any safe default for
dev.

## Backend changes required

- A startup hook validates required env vars and fails fast if any are missing.
- A startup hook ensures the MinIO buckets exist (idempotent: create if missing).
- A startup hook verifies Redis connectivity.
- The first Alembic migration enables the PostGIS extension on the database.

## AI service skeleton

`apps/ai_service` is a separate FastAPI (or BentoML / TorchServe) application:

- It exposes inference and health endpoints.
- It loads the YOLOv8 model on startup (slow; the health endpoint reports the load status).
- It depends on MinIO for fetching input images by signed URL.

See `00-foundation/16-yolov8-inference-service.md` for the full spec.

## Edge Cases

- **Apple Silicon**: the chosen PostGIS image must be multi-arch (works on arm64).
- **Port conflict**: the host machine may already use 5432, 6379, 9000, 3000, 8000. Document how to
  override ports via env vars or a local `docker-compose.override.yml`.
- **MinIO password length**: must satisfy MinIO's minimum length (8).
- **AI service slow startup** (~30s loading model): the backend treats initial 503s with retries /
  circuit breaker, not crashes.
- **Volumes growing on disk**: documentation explains how to wipe them when needed.
- **This is dev only**: production uses managed services (RDS, S3, ElastiCache, ECS) — not Compose.

## Privacy / LGPD

- MinIO buckets are private; only signed URLs allow access.
- The raw-photos bucket has a 30-day TTL for audit purposes, then auto-delete.

## Analytics

Not applicable (infrastructure layer).

## Tests

- **Smoke**: bringing the stack up, the backend health endpoint returns 200 within 30 seconds.
- **Migration**: Alembic upgrade runs cleanly on a fresh DB.
- **PostGIS**: the version query returns a valid version.
- **MinIO bucket creation**: backend logs confirm buckets created on first run.
- **AI service**: the health endpoint returns 200 after the model loads.

## Definition of Done

- [ ] Compose file with all services and healthchecks
- [ ] `.env.example` documents every required variable
- [ ] Alembic migration enables PostGIS
- [ ] Startup hook validates env, ensures buckets, checks Redis
- [ ] AI service skeleton ready to run
- [ ] Volumes for Postgres and MinIO
- [ ] Root README documents the dev setup
- [ ] CI smoke test boots the stack and runs a basic test against it

## Standards & References

### Cross-cutting standards

- Architecture (multi-service backend): `docs/engineering/architecture-patterns.md`
- Security (secrets, network isolation): `docs/engineering/security-baseline.md`
- Observability (healthchecks): `docs/engineering/observability.md`

### Library / framework references

- PostGIS Docker image: https://registry.hub.docker.com/r/postgis/postgis
- MinIO: https://min.io/docs/minio/container/index.html
- Compose v2 healthchecks: https://docs.docker.com/compose/compose-file/05-services/#healthcheck
- Alembic: https://alembic.sqlalchemy.org/

### Project context

- `CLAUDE.md`
- Existing `docker-compose.yml` and `apps/backend/Dockerfile`

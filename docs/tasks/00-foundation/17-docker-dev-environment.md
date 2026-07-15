# Docker Dev Environment · PostGIS + Redis + MinIO + AI service

> **Type:** Foundation · Infrastructure\
> **Screen(s):** Backend stack (powers all screens)\
> **Effort:** M (1-2 days)\
> **Dependencies:** `00-foundation/01-monorepo-setup.md`\
> **Status:** 🟡 In progress — the reduced 3-service stack (`db`, `migrate`, `backend`) described
> under "Services → Live today" is built and used daily via `make start` / `./scripts/dev.sh start`.
> PostGIS, Redis, MinIO, the AI inference service, and the web admin container are not part of
> `docker-compose.yml` yet — see "Services → Planned" and the "Scenarios not yet implemented"
> Acceptance Criteria below.\
> **Labels:** `infrastructure`, `foundation`, `docker`, `backend`, `postgis`

## Context

The title and the sections below describe the **full target stack** for this task: a Docker Compose
dev environment that boots the entire backend universe (DB, cache/queue, object storage, API, AI
inference, web admin) in one command. That target has **not** been fully built yet. What exists
today, in the root `docker-compose.yml` + `docker-compose.override.yml`, is a smaller stack:

- **`db`** — plain `postgres:16-alpine` (not a PostGIS image).
- **`migrate`** — a one-shot container that runs `alembic upgrade head` and exits.
- **`backend`** — the FastAPI app, with `--reload` and a bind-mounted source tree in dev (via the
  override file) for live reload.

There is no `redis`, `minio`, `ai-service`, or `web` service in Compose today, because none of the
features that need them have been built yet:

- **PostgreSQL with PostGIS** will matter once geographic queries exist (heatmaps, clustering, "10km
  radius feed", smart routing) — no model in `apps/backend/app/models/` uses geography/geometry
  types yet (only `role.py` and `user.py` exist).
- **Redis** is needed for rate-limiting state, session cache, and as the async-job broker for photo
  anonymization — see `00-foundation/08-anonymization-pipeline.md`, which explicitly depends on "the
  Redis instance already provisioned in `00-foundation/17-docker-dev-environment.md`".
- **MinIO** is needed for the photo-upload pipeline's local S3-compatible storage — see
  `00-foundation/07-photo-upload-pipeline.md`.
- **AI inference service** is a separate FastAPI app running YOLOv8 — see
  `00-foundation/16-yolov8-inference-service.md`. `apps/ai_service` does not exist in the repo yet.
- **Next.js web admin** in Compose: `apps/web` exists as code but the Operational Panel product is
  paused (see `docs/tasks/README.md`, "Coverage by features.md section") and is run locally via
  `npm run dev`/`make web`, not as a Compose service.

This task's Acceptance Criteria below are therefore split into scenarios that pass **today** against
the current 3-service Compose stack, and scenarios that describe the **planned** full stack, each
tagged with which future task will land the missing piece.

## User Story

**As a** Backend Developer,\
**I want** to run a single command and have the entire stack running locally,\
**In order to** develop and run integration tests without manual setup.

## Acceptance Criteria

### Scenarios that pass today

#### Scenario · One-command boot (reduced stack)

**Given** the developer just cloned the repo and copied `.env.sample` to `.env`\
**When** they run `make start` (macOS) or `./scripts/dev.sh start` (Windows/Linux)\
**Then** `db` starts and becomes healthy (`pg_isready`)\
**And** `migrate` runs `alembic upgrade head` once `db` is healthy and exits 0\
**And** `backend` starts once `migrate` completes successfully\
**And** the backend health endpoint (`GET /health`) returns 200 within 30 seconds

> This is the real dependency order today: `db → migrate → backend`. The original
> `db → redis → minio → backend → ai → web` order is the **planned** order once those services exist
> — see the "Scenarios not yet implemented" below.

#### Scenario · Volumes persist across restarts (Postgres only)

**Given** the dev stops and restarts the stack\
**When** the stack restarts\
**Then** Postgres data persists in the named volume `pgdata` (declared in `docker-compose.yml`)

#### Scenario · Env validation (partial)

**Given** `SECRET_KEY` is missing or shorter than 32 characters\
**When** the backend container starts\
**Then** `pydantic-settings` (`apps/backend/app/core/config.py`) raises a validation error at
startup naming the field and explaining how to generate a valid value (`openssl rand -hex 32`)

> This only covers `SECRET_KEY` today (the one setting with no safe default and an explicit
> `field_validator`). `DATABASE_URL` and the other settings have defaults and are not yet validated
> for presence. Extending this to "every required var, backend exits with a clear error" per the
> original scenario is still open work.

### Scenarios not yet implemented (planned)

#### Scenario · Full one-command boot — **blocked on Redis/MinIO/AI-service existing**

**Given** the developer just cloned the repo and copied `.env.sample` to `.env` (with the future
Storage/Inference/Web variable groups filled in)\
**When** they run the dev-up command\
**Then** all services start in dependency order (db → redis → minio → backend → ai → web)\
**And** the backend health endpoint returns 200 within 30 seconds\
**And** the web admin is reachable on its port\
**And** the AI service is reachable on its port

#### Scenario · PostGIS extension — **blocked on the first spatial feature (no geography model exists yet)**

**Given** the database container is healthy\
**When** the backend connects on first run\
**Then** an Alembic migration enables the PostGIS extension\
**And** subsequent migrations can use geometry/geography types and PostGIS functions\
**And** a query for the PostGIS version returns successfully

#### Scenario · MinIO bucket bootstrap — **blocked on `00-foundation/07-photo-upload-pipeline.md`**

**Given** the MinIO container is running\
**When** the backend starts\
**Then** it creates buckets for raw photos, anonymized photos, and thumbnails if missing\
**And** sets bucket policies (private with signed-URL access)

#### Scenario · Redis as cache and queue — **blocked on `00-foundation/08-anonymization-pipeline.md`**

**Given** Redis is running\
**When** the backend starts\
**Then** Redis is reachable from the backend\
**And** the backend can use it as a cache (for rate limits, ephemeral data) and as a job queue
broker

#### Scenario · AI service decoupled — **blocked on `00-foundation/16-yolov8-inference-service.md`**

**Given** the AI service container is running\
**When** the backend posts an inference request to the AI service\
**Then** the service responds with detected objects (or 503 if the model is still loading)\
**And** the AI service runs in a separate container (separate Python process, separate model
loading)

#### Scenario · MinIO volume persists across restarts — **blocked on MinIO existing**

**Given** the dev stops and restarts the stack\
**When** the stack restarts\
**Then** MinIO objects persist (named volume)\
**And** Redis cache is volatile (acceptable — it's a cache, no persistence requirement)

#### Scenario · Full env validation — **blocked on the Storage/Inference/Web env groups existing**

**Given** any required env var is missing (not just `SECRET_KEY`)\
**When** the dev starts the backend container\
**Then** the backend exits with a clear error naming the missing var\
**And** points to the example env file for reference

## Services

### Live today (`docker-compose.yml` + `docker-compose.override.yml`)

| Service   | Image                                        | Ports  | Volumes                      | Healthcheck                                                    |
| --------- | -------------------------------------------- | ------ | ---------------------------- | -------------------------------------------------------------- |
| `db`      | `postgres:16-alpine` (plain, not PostGIS)    | 5432   | `pgdata`                     | `pg_isready -U cityhero`                                       |
| `migrate` | Built from `apps/backend`, `target: migrate` | (none) | source bind-mount (dev only) | none — one-shot, runs `alembic upgrade head` and exits         |
| `backend` | Built from `apps/backend`, `target: app`     | 8000   | source bind-mount (dev only) | none declared in Compose; the app itself exposes `GET /health` |

`migrate` waits on `db` being healthy; `backend` waits on `db` healthy **and** `migrate` completing
successfully (`condition: service_completed_successfully`). The override file adds
`WATCHFILES_FORCE_POLLING=true` and `--reload` so editing a `.py` file restarts the API without a
rebuild.

### Planned (not in Compose yet)

| Service      | Image                                                                     | Ports      | Volumes                 | Healthcheck          | Landed by                                                                                 |
| ------------ | ------------------------------------------------------------------------- | ---------- | ----------------------- | -------------------- | ----------------------------------------------------------------------------------------- |
| `redis`      | Redis 7                                                                   | 6379       | (volatile)              | `redis-cli ping`     | `00-foundation/08-anonymization-pipeline.md`                                              |
| `minio`      | MinIO, pinned `RELEASE.*` tag (not `latest` — see Standards & References) | 9000, 9001 | `miniodata`             | `/minio/health/live` | `00-foundation/07-photo-upload-pipeline.md`                                               |
| `ai-service` | Built from `apps/ai_service` (doesn't exist yet)                          | 8001       | model files (read-only) | `/health` HTTP       | `00-foundation/16-yolov8-inference-service.md`                                            |
| `web`        | Built from `apps/web`                                                     | 3000       | (none)                  | (depends on backend) | Not scheduled — Operational Panel is paused per product decision (`docs/tasks/README.md`) |

The `db` image also needs to change from `postgres:16-alpine` to a PostGIS-enabled image (e.g.
`postgis/postgis:16-3.4-alpine`, which is what CI already uses for the backend test job — see
`.github/workflows/ci.yml`) once the first spatial feature needs it. Until then, staying on plain
Postgres avoids an unused extension and a heavier image.

## Environment variables

`.env.sample` (root) documents what's needed for the services that exist today:

- **Postgres**: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`.
- **Backend**: `APP_NAME`, `DATABASE_URL`, `SECRET_KEY`, `ACCESS_TOKEN_EXPIRE_MINUTES`,
  `ALLOWED_ORIGINS`, plus `APP_ADMIN` / `APP_ADMIN_PASSWORD` / `APP_USERS_PASSWORD` for the
  seed-user migration.

Groups that are **not yet in `.env.sample`** because the services don't exist yet (add them when the
corresponding task lands):

- **Storage (MinIO)**: root user, root password, bucket names — with
  `00-foundation/07-photo-upload-pipeline.md`.
- **Inference**: AI service URL, model path, confidence thresholds — with
  `00-foundation/16-yolov8-inference-service.md`.
- **Web**: public API URL — if/when the web admin resumes and gets a Compose service.
- **Optional integrations**: Sentry DSN — with `00-foundation/20-observability-package.md`; SMTP
  credentials — no task filed yet.

Each variable in `.env.sample` already has a short comment explaining its purpose and, where one
exists, a safe default for dev (see the file for the exact text).

## Frontend

Not applicable — this task is backend/infrastructure only (Docker Compose + the FastAPI container
images it builds). It has no UI surface. The eventual `web` row in the planned services table above
is about running the existing `apps/web` Next.js app as a Compose service, not about building any
frontend code.

## Backend

- [x] **Done** — `apps/backend/app/core/config.py` validates `SECRET_KEY` (required, ≥32 chars) via
      a pydantic `field_validator` and fails fast with a clear message at startup.
- [ ] A startup hook ensures the MinIO buckets exist (idempotent: create if missing) — blocked on
      MinIO existing.
- [ ] A startup hook verifies Redis connectivity — blocked on Redis existing.
- [ ] The first Alembic migration enables the PostGIS extension on the database — blocked on the
      first spatial feature/model. Today's 5 migrations (`001`-`005` in
      `apps/backend/alembic/versions/`) only cover users and RBAC, no geometry/geography columns.

## Database

- **Today**: `db` is plain `postgres:16-alpine`. `apps/backend/alembic/versions/` has 5 migrations
  (`001_baseline_users`, `002_create_rbac_tables`, `003_seed_rbac_data`, `004_users_add_role_id_fk`,
  `005_seed_default_users`) — all relational (users/roles), no PostGIS, no geometry/geography
  columns.
- **Planned**: switch the `db` image to a PostGIS-enabled Postgres 16 (matching what CI's test job
  already uses, `postgis/postgis:16-3.4-alpine`) and add a migration that runs
  `CREATE EXTENSION IF NOT EXISTS postgis` before any migration defines a geometry/geography column.
  No task currently owns "first model with a geography column" — whichever screen/feature needs it
  first (e.g. the map/heatmap work) should add that migration and flip this item to done.

## AI service skeleton

`apps/ai_service` does not exist in the repo yet. When built, per
`00-foundation/16-yolov8-inference-service.md`, it will be a separate FastAPI application that:

- Exposes inference and health endpoints.
- Loads the YOLOv8 model on startup (slow; the health endpoint reports the load status).
- Depends on MinIO for fetching input images by signed URL.

See `00-foundation/16-yolov8-inference-service.md` for the full spec — this task only owns wiring
that service into Compose once it exists, not building the service itself.

## Edge Cases

- **Apple Silicon / arm64**: whichever PostGIS image replaces `postgres:16-alpine` must be
  multi-arch. `postgis/postgis:16-3.4-alpine` (already used in CI) satisfies this.
- **Port conflict**: the host machine may already use 5432 (today) and, later, 6379/9000/9001/8001
  once Redis/MinIO/AI-service are added. Document how to override ports via env vars or a local
  Compose override (the pattern already exists in `docker-compose.override.yml` for dev reload).
- **MinIO password length**: must satisfy MinIO's minimum length (8) — applies once MinIO is added.
- **AI service slow startup** (~30s loading model): the backend should treat initial 503s with
  retries / a circuit breaker, not crash — applies once the AI service is added.
- **Volumes growing on disk**: `pgdata` already needs this documented (`docker volume rm` or
  `./scripts/dev.sh destroy` / `make destroy-environment`); repeat for `miniodata` once it exists.
- **This is dev only**: production uses managed services (RDS, S3, ElastiCache, ECS) — not Compose.
  Nothing in this task's scope touches production infra.

## Privacy / LGPD

- Today's stack stores no photos and has no object storage, so the "signed URLs only" and "30-day
  TTL" requirements below are **not yet applicable** — they become relevant only once MinIO lands.
- What **is** applicable today: `SECRET_KEY`, `POSTGRES_PASSWORD`, and the seed-user passwords
  (`APP_ADMIN_PASSWORD`, `APP_USERS_PASSWORD`) are read from `.env` (gitignored, never committed) —
  consistent with `docs/engineering/security-baseline.md`.
- Planned, once MinIO exists: buckets are private; only signed URLs allow access. The raw-photos
  bucket has a 30-day TTL for audit purposes, then auto-delete.

## Analytics

Not applicable — this is infrastructure/tooling, not a user-facing or business-metric feature.

## Tests

Passing today:

- **Smoke**: `docker-compose up` (or `make start` / `./scripts/dev.sh start`) brings up `db` →
  `migrate` → `backend`; the backend `/health` endpoint returns 200 within 30 seconds.
- **Migration**: `alembic upgrade head` (run via the `migrate` service) completes cleanly against a
  fresh `db` volume.

Planned, blocked on the corresponding service landing:

- **PostGIS**: a version query (`SELECT PostGIS_Version();`) returns a valid version — blocked on
  the `db` image switching to a PostGIS-enabled one.
- **MinIO bucket creation**: backend logs confirm buckets created on first run — blocked on MinIO.
- **AI service**: the health endpoint returns 200 after the model loads — blocked on
  `apps/ai_service` existing.

## Definition of Done

- [x] Compose file with the `db` + `migrate` + `backend` services and a `db` healthcheck (no
      healthcheck on `migrate`/`backend` themselves — `migrate` is one-shot and `backend` is only
      probed externally via `/health`)
- [x] `.env.sample` documents every variable the current 3 services need
- [ ] Alembic migration enables PostGIS — deferred until a feature needs geometry/geography columns
- [ ] Startup hook validates all required env vars (today only `SECRET_KEY` is validated), ensures
      MinIO buckets exist, checks Redis connectivity — MinIO/Redis parts blocked on those services
      existing
- [ ] AI service skeleton ready to run — owned by `00-foundation/16-yolov8-inference-service.md`,
      this task only wires it into Compose afterward
- [ ] Volumes for MinIO (`pgdata` for Postgres already exists and works)
- [x] Root `README.md` documents the dev setup (macOS `make` workflow and Windows/Linux
      `scripts/dev.sh` workflow, with a service/URL table)
- [ ] CI smoke test boots the stack and runs a basic test against it — CI currently starts Postgres
      as a GitHub Actions service container for the pytest job, not via `docker-compose up`; a true
      Compose-based CI smoke test is still open work

## Standards & References

### Cross-cutting standards

- Architecture (multi-service backend): `docs/engineering/architecture-patterns.md`
- Security (secrets, network isolation): `docs/engineering/security-baseline.md`
- Observability (healthchecks): `docs/engineering/observability.md`

### Library / framework references

- PostGIS Docker image: https://registry.hub.docker.com/r/postgis/postgis — when adopted, prefer the
  same tag CI already uses (`postgis/postgis:16-3.4-alpine`, multi-arch) over
  `postgis/postgis:latest` for reproducibility.
- MinIO: https://min.io/docs/minio/container/index.html — current MinIO guidance pins the container
  to an explicit `RELEASE.<timestamp>` tag (e.g. `RELEASE.2024-11-07T00-52-20Z`), not `:latest`;
  update the table above with the pinned tag chosen at implementation time.
- Compose v2 healthchecks: https://docs.docker.com/compose/compose-file/05-services/#healthcheck
- Alembic: https://alembic.sqlalchemy.org/ — `op.execute("CREATE EXTENSION IF NOT EXISTS postgis")`
  is the current, still-valid way to enable an extension from a migration.

### Project context

- `CLAUDE.md`
- Existing `docker-compose.yml`, `docker-compose.override.yml`, and `apps/backend/Dockerfile`
  (multi-stage: `base` → `migrate` target running `alembic upgrade head`, `app` target running
  `uvicorn`) — these are what "Live today" above describes.

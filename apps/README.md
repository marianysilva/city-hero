# Apps — Architecture & Infrastructure

This directory contains the three applications that compose the CityHero platform. Each app is an
independent unit with its own Dockerfile, dependencies, and deployment lifecycle, but they share
types via `packages/types` and communicate through a REST API.

## Why Three Apps?

CityHero serves three fundamentally different audiences with different needs:

| App         | Audience               | Purpose                                                                     |
| ----------- | ---------------------- | --------------------------------------------------------------------------- |
| **backend** | All clients            | Single source of truth: data, business rules, AI inference, and Open311 API |
| **web**     | City Hall managers     | Operational dashboard for triage, dispatch, routing, and BI                 |
| **mobile**  | Citizens & field teams | On-the-ground reporting with camera AI, offline support, and gamification   |

Separating them gives us:

- **Independent deploy cycles** — a hotfix to the dashboard doesn't require a new mobile release
  through app store review.
- **Right tool for the job** — Python for AI/data on the backend, React Native for native device
  access on mobile, Next.js for a fast server-rendered dashboard on web.
- **Team scalability** — frontend and backend teams can work in parallel with the API contract as
  the boundary.
- **Resource isolation** — in production each service scales independently. The backend can scale
  horizontally behind a load balancer without touching the frontend containers.

## Architecture Overview

```
                    ┌─────────────┐
                    │  PostgreSQL  │
                    │   + PostGIS  │
                    └──────┬──────┘
                           │
                    ┌──────┴──────┐
                    │   Backend   │
                    │   (FastAPI) │
                    │  port 8000  │
                    └──┬───────┬──┘
                       │       │
              ┌────────┘       └────────┐
              │                         │
       ┌──────┴──────┐          ┌──────┴──────┐
       │     Web     │          │   Mobile    │
       │  (Next.js)  │          │   (Expo)    │
       │  port 3000  │          │  port 8081  │
       └─────────────┘          └─────────────┘
```

All client-to-server communication goes through the backend REST API. The web and mobile apps never
access the database directly.

## `apps/backend` — FastAPI (Python)

The backend is the **single source of truth** for the entire platform. It handles all business
logic, AI inference, database access, and exposes the Open311-compliant REST API consumed by the web
and mobile apps.

Key design decisions:

- All queries are scoped by `city_id` (multi-tenant from day one)
- AI inference runs on the backend, not on the client — the mobile app sends raw photos
- Photos go through automatic anonymization (face/plate blur) before becoming public (LGPD/GDPR)

For full details on dependencies, project structure, API endpoints, migrations, and local setup, see
[`apps/backend/README.md`](./backend/README.md).

## `apps/web` — Next.js 15 (TypeScript)

The manager dashboard for City Hall operators.

- **Framework:** Next.js 15 with App Router
- **Styling:** Tailwind CSS v4
- **Auth:** JWT issued by the backend, stored in an `httpOnly` cookie, injected server-side via API
  route handlers
- **Data:** REST (`app/lib/api.ts`) and GraphQL (`app/lib/apollo.ts`)

This app will grow to include the War Room (heatmap), Smart Routing, and embedded Superset
dashboards for BI, alongside the Kanban board and user management already in place.

See [`apps/web/README.md`](./web/README.md) for the full structure, scripts, and env vars.

## `apps/mobile` — React Native + Expo (TypeScript)

> **Note:** the directory on disk is currently `apps/city-hero/`, not `apps/mobile/` — this doc and
> the root `CLAUDE.md` describe it by its intended role. If you can't find `apps/mobile/`, look in
> `apps/city-hero/`.

The citizen-facing app for urban problem reporting.

- **Framework:** React Native with Expo (Expo Router, file-based navigation)
- **Current state:** still the default Expo Router tabs template — login, AI camera, civic feed, and
  gamification haven't been built out yet

This app will grow to include the AI Camera (YOLOv8 on-device preview), Civic Feed, Gamification
(XP/levels/badges), offline-first report queueing, and push notifications.

See [`apps/city-hero/README.md`](./city-hero/README.md) for the full structure and how to run it.

## Infrastructure

`db`, `migrate`, and `backend` run in Docker, orchestrated by `docker-compose.yml` at the repository
root. `web` and `mobile` run **locally** (`npm run dev` / `npx expo start --web`) — they are not
Docker services, they just talk to the backend over HTTP.

### Services

| Service   | How it runs                                  | Port | Description                                |
| --------- | -------------------------------------------- | ---- | ------------------------------------------ |
| `db`      | Docker (`postgres:16-alpine`)                | 5432 | PostgreSQL database with persistent volume |
| `migrate` | Docker, built from `apps/backend/Dockerfile` | —    | Runs Alembic migrations, exits on success  |
| `backend` | Docker, built from `apps/backend/Dockerfile` | 8000 | FastAPI server                             |
| `web`     | Local process (`npm run dev`)                | 3000 | Next.js dev server                         |
| `mobile`  | Local process (`npx expo start --web`)       | 8081 | Expo web preview                           |

### Environment Configuration

The root `.env` (gitignored, copy from `.env.sample`) feeds `db`/`migrate`/`backend` via Docker
Compose's `${VAR}` interpolation — each service's `environment:` block only lists what it needs.
`web` reads its own `apps/web/.env.local` (Next.js convention); `mobile` doesn't need one yet. See
each app's README for details.

### Quick Start

The tested path (macOS, via Colima) is documented in the
[root README](../README.md#getting-started):

```bash
make setup   # generates .env secrets, npm install, starts everything
```

If you're not on macOS or don't use Colima, start the pieces manually instead — see each app's own
README:

```bash
cp .env.sample .env   # fill in POSTGRES_PASSWORD, SECRET_KEY, APP_ADMIN_PASSWORD, APP_USERS_PASSWORD
docker-compose up --build db migrate backend   # backend stack
cd apps/web && npm install && npm run dev       # in another shell
cd apps/city-hero && npm install && npx expo start --web   # in another shell
```

| URL                        | What you'll see                             |
| -------------------------- | ------------------------------------------- |
| http://localhost:8000/docs | Backend — Swagger UI (interactive API docs) |
| http://localhost:3000      | Web — Manager dashboard                     |
| http://localhost:8081      | Mobile — Expo web preview                   |

### Dependency Chain

```
db (healthy?) → migrate → backend → web (local)
                                   → mobile (local)
```

`backend` waits for Postgres to pass its healthcheck; `migrate` must complete before `backend`
starts. `web` and `mobile` wait for the backend's `/docs` or `/health` endpoint to respond before
starting.

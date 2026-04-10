# Apps — Architecture & Infrastructure

This directory contains the three applications that compose the CityHero platform. Each app is an independent unit with its own Dockerfile, dependencies, and deployment lifecycle, but they share types via `packages/types` and communicate through a REST API.

## Why Three Apps?

CityHero serves three fundamentally different audiences with different needs:

| App | Audience | Purpose |
|---|---|---|
| **backend** | All clients | Single source of truth: data, business rules, AI inference, and Open311 API |
| **web** | City Hall managers | Operational dashboard for triage, dispatch, routing, and BI |
| **mobile** | Citizens & field teams | On-the-ground reporting with camera AI, offline support, and gamification |

Separating them gives us:

- **Independent deploy cycles** — a hotfix to the dashboard doesn't require a new mobile release through app store review.
- **Right tool for the job** — Python for AI/data on the backend, React Native for native device access on mobile, Next.js for a fast server-rendered dashboard on web.
- **Team scalability** — frontend and backend teams can work in parallel with the API contract as the boundary.
- **Resource isolation** — in production each service scales independently. The backend can scale horizontally behind a load balancer without touching the frontend containers.

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

All client-to-server communication goes through the backend REST API. The web and mobile apps never access the database directly.

## `apps/backend` — FastAPI (Python)

The backend is the **single source of truth** for the entire platform.

- **Framework:** FastAPI with async SQLAlchemy (`asyncpg`)
- **Database:** PostgreSQL 16 + PostGIS for geographic queries
- **Auth:** JWT-based authentication with bcrypt password hashing
- **API standard:** Open311 GeoReport v2 for civic system interoperability
- **AI:** Receives raw photos from mobile, runs YOLOv8 inference server-side
- **Migrations:** Alembic (never modify the DB schema manually)

Key design decisions:
- All queries are scoped by `city_id` (multi-tenant from day one)
- AI inference runs on the backend, not on the client — the mobile app sends raw photos
- Photos go through automatic anonymization (face/plate blur) before becoming public (LGPD/GDPR)

```
apps/backend/
├── main.py                  # FastAPI app, CORS, lifespan, router registration
├── app/
│   ├── core/
│   │   ├── config.py        # pydantic-settings (reads env vars)
│   │   ├── database.py      # async engine, session factory, Base
│   │   └── security.py      # JWT creation/validation, bcrypt, get_current_user
│   ├── models/
│   │   └── user.py          # SQLAlchemy User model (UUID, email, name, etc.)
│   ├── schemas/
│   │   └── auth.py          # Pydantic v2 request/response schemas
│   └── routers/
│       ├── auth.py          # POST /auth/register, POST /auth/login
│       └── users.py         # GET /users/me, GET /users/{id}
├── requirements.txt
├── Dockerfile
└── .dockerignore
```

**Endpoints (current):**

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Create account, returns JWT |
| POST | `/auth/login` | No | Authenticate, returns JWT |
| GET | `/users/me` | Yes | Current user profile |
| GET | `/users/{id}` | No | Public user profile |
| GET | `/health` | No | Health check |

## `apps/web` — Next.js 15 (TypeScript)

The manager dashboard for City Hall operators.

- **Framework:** Next.js 15 with App Router
- **Styling:** Tailwind CSS v4
- **Auth:** JWT stored in `localStorage`, injected via API client
- **Types:** Shared from `@city-hero/types` workspace package

This app will grow to include the War Room (heatmap), Kanban board, Smart Routing, team management, and embedded Superset dashboards for BI.

```
apps/web/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (Inter font, metadata)
│   │   ├── page.tsx                # Landing page
│   │   ├── globals.css             # Tailwind v4 import
│   │   ├── login/
│   │   │   └── page.tsx            # Login form (client component)
│   │   └── (dashboard)/
│   │       ├── layout.tsx          # Auth guard + header with logout
│   │       └── page.tsx            # Dashboard with user info
│   └── lib/
│       └── api.ts                  # HTTP client (fetch + Bearer token)
├── next.config.ts                  # transpilePackages, standalone output
├── postcss.config.mjs
├── tsconfig.json                   # strict mode, @/* path alias
├── package.json
├── Dockerfile
└── .env.sample
```

## `apps/mobile` — React Native + Expo (TypeScript)

The citizen-facing app for urban problem reporting.

- **Framework:** React Native with Expo SDK 52
- **Navigation:** Expo Router (file-based) with tabs
- **Styling:** StyleSheet.create (NativeWind available for future use)
- **Auth:** JWT stored in AsyncStorage, `useAuth` hook redirects to login
- **Types:** Shared from `@city-hero/types` workspace package
- **Offline:** Designed for offline-first — reports queue locally and sync when online

This app will grow to include the AI Camera (YOLOv8 on-device preview), Civic Feed, Gamification (XP/levels/badges), and push notifications.

```
apps/mobile/
├── app/
│   ├── _layout.tsx                 # Root Stack navigator
│   ├── login.tsx                   # Login screen
│   └── (tabs)/
│       ├── _layout.tsx             # Tab bar (Home + Profile)
│       ├── index.tsx               # Home screen
│       └── profile.tsx             # User profile (fetches /users/me)
├── hooks/
│   └── useAuth.ts                  # Token check + auto-redirect
├── lib/
│   └── api.ts                      # HTTP client (fetch + AsyncStorage token)
├── assets/                         # App icons and splash screen
├── app.json                        # Expo config (scheme, plugins, bundle IDs)
├── package.json
├── Dockerfile                      # Expo web mode for browser preview
└── .env.sample
```

## Infrastructure

Everything runs in Docker containers orchestrated by `docker-compose.yml` at the repository root.

### Services

| Service | Image | Port | Description |
|---|---|---|---|
| `db` | `postgres:16-alpine` | 5432 | PostgreSQL database with persistent volume |
| `backend` | Built from `apps/backend/Dockerfile` | 8000 | FastAPI server |
| `web` | Built from `apps/web/Dockerfile` | 3000 | Next.js dev server |
| `mobile` | Built from `apps/mobile/Dockerfile` | 8081 | Expo web preview |

### Environment Configuration

All services read from a single `.env` file at the repository root:

```
.env                ← real values (gitignored, never committed)
.env.sample         ← placeholder template (committed, safe to share)
```

Each service receives **only the environment variables it needs** — no leaking across services. Docker Compose interpolates `${VAR}` from the root `.env` into per-service `environment:` blocks.

For web and mobile, public env vars (`NEXT_PUBLIC_*`, `EXPO_PUBLIC_*`) are passed both as **build args** (baked into the JS bundle at build time) and **runtime env vars**.

### Quick Start

```bash
# 1. Copy the sample env and adjust if needed
cp .env.sample .env

# 2. Build and start all services
docker compose up --build
# or with Podman:
podman compose up --build
```

| URL | What you'll see |
|---|---|
| http://localhost:8000/docs | Backend — Swagger UI (interactive API docs) |
| http://localhost:3000 | Web — Manager dashboard |
| http://localhost:8081 | Mobile — Expo web preview |

### Dependency Chain

```
db (healthy?) → backend → web
                        → mobile
```

The backend waits for Postgres to pass its healthcheck before starting. Web and mobile wait for the backend to be up.

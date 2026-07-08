# Architecture Patterns

Preferred patterns across CityHero. Deviate only with a documented reason.

## Backend (FastAPI)

### Layered architecture

Three layers, top-down dependency only:

1. **API layer** (`api/v1/...`) — FastAPI routers. Parses request, calls service, returns response. No business logic. No DB access.
2. **Service layer** (`services/...`) — Business logic. Orchestrates repositories and domain rules. Returns domain objects, not ORM models.
3. **Repository layer** (`repositories/...`) — Data access. SQLAlchemy queries. Returns domain entities (Pydantic models or dataclasses), not raw rows.

Domain models (`domain/...`) are pure data classes/Pydantic models, no I/O.

### Dependency injection

Use FastAPI's `Depends` to inject services and repositories. This makes testing trivial (override deps with mocks) and avoids global singletons.

### Multi-tenant scoping

Every request has a `city_id` from the `X-City-Id` header (validated against the JWT's `city_id` claim — they must match). All queries are scoped by `city_id` at the repository layer. **No global queries**; the only exception is admin endpoints behind a separate role check.

### Async

FastAPI handlers are `async def`. SQLAlchemy uses the async engine (`sqlalchemy[asyncio]` + `asyncpg`). HTTP calls to external services use `httpx.AsyncClient`. CPU-bound work goes to a separate worker (Celery/arq) — never block the event loop.

### Background jobs

Long-running or scheduled work uses **Celery** (with Redis broker) or **arq** (lighter, Redis-only). Jobs:

- Photo processing pipelines (compress, anonymize, upload)
- Push notification dispatch
- NPS email trigger after ticket close
- Daily aggregations
- Webhook retries to legacy ERPs

Choose Celery if the team is familiar; otherwise arq for simplicity. Document the choice in an ADR.

### Open311 compliance

All citizen-report endpoints follow the **Open311 GeoReport v2** spec for interoperability with other civic systems. Internal extensions are added as additional fields without breaking the spec.

## Frontend — mobile (React Native)

### Folder structure per screen

Co-locate screen, sub-components, styles, types, tests, and stories. Hooks specific to the screen live in a `hooks/` subfolder. Shared hooks go in `apps/city-hero/src/hooks/`.

### Frontend component architecture

This section is normative for any React UI work. See
[`design-system.md`](./design-system.md) for the full rules and
[`component-inventory.md`](./component-inventory.md) for the canonical
catalog of shared components.

**Tiered placement**: components live by tier in
`packages/design_system/` — tokens, atoms, molecules, organisms,
templates. Concrete screens live in `apps/city-hero/src/screens/<Screen>/`
and **compose** the design-system pieces. Screen folders never define
generic primitives (buttons, chips, badges, etc.).

**Reuse rule**: a component used by 2+ screens (or plausibly will be)
lives in the design system. Single-use screen-specific compositions are
fine in the screen folder.

**Storybook is mandatory** for every shared component. Stories live
next to the component (`Foo.stories.tsx`) and cover all variants,
states, and edge cases. They're part of the component's Definition of
Done — no story, not merged.

**Patterns**:

- Composition over configuration. Prefer compound components (`Card.Header`, `Card.Body`) over giant prop APIs.
- Headless components for behavior (gestures, focus traps, popovers); UI wrappers layer the styling.
- Hooks for stateful logic; components stay declarative.
- Variants via discriminated unions, not boolean flags.
- `React.forwardRef` on atoms and molecules.
- `React.memo` + stable callbacks for components rendered in long lists.

### Container vs Presentational

- **Container components** own state and side effects. They fetch data via React Query hooks, manage forms, and pass props down. They live in screen folders.
- **Presentational components** are stateless: take props, render JSX. They live in `packages/design_system` and never fetch data or know about navigation.

### Hooks for logic

Business logic lives in custom hooks (`useReports`, `useGeolocation`).
Hooks for behavior (`useSwipeable`, `useFocusTrap`) live in the design
system. Hooks for data (`useReports`, `useFeedItems`) live in screen
folders close to their consumers. Components call hooks and render.

### State management

- **Local state**: `useState`/`useReducer` for component-scoped state.
- **Server state**: React Query (TanStack Query) for everything fetched from the API. No manual caching.
- **Global client state**: Zustand for cross-screen state (auth user, app settings, offline queue summary). Avoid Redux unless complexity grows.

### Navigation

React Navigation with typed routes. Stack navigator wraps the bottom tab navigator. Modals (Camera, Auth) are stack-level, not tab-level.

## Frontend — web (Next.js)

### Server vs Client components

- Default to **Server Components** (Next 13+ app router). Fetch data on the server, render HTML.
- Use Client Components only when needed (interactivity, browser APIs, state).
- Mark explicitly with `'use client'` directive.

### Data fetching

- Server: direct DB-or-API calls in async Server Components.
- Client: React Query for the few interactive surfaces (admin dashboard).

### Routing

App Router (`app/` directory). Layouts, error.tsx, loading.tsx per route segment.

## API design

### REST baseline

Use RESTful conventions:

- `GET /resources` (list, paginated)
- `GET /resources/:id` (single)
- `POST /resources` (create)
- `PATCH /resources/:id` (partial update)
- `DELETE /resources/:id` (soft delete)

### Error response shape

All non-2xx responses return JSON with this shape:

| Field      | Type   | Description                                            |
|------------|--------|--------------------------------------------------------|
| `code`     | string | Machine-readable identifier (e.g., `validation_error`) |
| `message`  | string | i18n key (not literal text). Frontend translates.      |
| `details`  | object | Optional. Field-level errors or extra context.         |
| `traceId`  | string | UUID for cross-system correlation.                     |

### Pagination

Cursor-based for high-volume lists (reports, feed). Offset-based acceptable for small lists (cities, achievements).

### Idempotency

POST endpoints that can be retried (create report, send notification) accept an `Idempotency-Key` header. The backend deduplicates within a 24h window.

## Patterns to AVOID

- **God services / God components.** Split when a file exceeds ~300 lines.
- **Anemic domain models.** If a domain object has only data and no behavior, that's a sign business logic leaked into services that should belong with the data.
- **Implicit globals.** Pass dependencies explicitly (DI). Avoid module-level singletons that hold state.
- **Magic strings.** Constants and enums for status values, event names, role names, etc.
- **Premature abstraction.** Don't generalize until there are at least 2-3 concrete use cases.

## References

- Repository pattern: https://martinfowler.com/eaaCatalog/repository.html
- React Query: https://tanstack.com/query/latest
- FastAPI: https://fastapi.tiangolo.com/
- Next.js App Router: https://nextjs.org/docs/app
- Open311 GeoReport v2: https://wiki.open311.org/GeoReport_v2/

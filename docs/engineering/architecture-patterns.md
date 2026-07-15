# Architecture Patterns

Preferred patterns across CityHero. Deviate only with a documented reason.

## Backend (FastAPI)

### Layered architecture

Two layers, top-down dependency only — this is the actual shape of `apps/backend/app/` today, and it
matches FastAPI's own "Bigger Applications" guidance (routers + a shared `dependencies`/`core`
module, no prescribed data-access layer):

1. **API layer** (`app/routers/...`) — FastAPI routers. Parses the request, calls a service
   function, returns the response. No business logic, no direct DB queries.
2. **Service layer** (`app/services/...`) — Business logic. Talks to the database directly via
   SQLAlchemy's async `select()`/`AsyncSession` (2.0 style) against the ORM models in
   `app/models/...`. Returns Pydantic schemas (`app/schemas/...`), not raw ORM instances, across the
   API boundary.

There is **no separate repository or domain-entity layer**. For a solo project at this scale, an
extra abstraction between services and SQLAlchemy buys nothing — it's the kind of premature layering
called out below. Introduce a repository layer only if/when the same query logic needs to be reused
across 3+ services or swapped for a different persistence backend; until then, services querying
SQLAlchemy directly (as `auth_service.py` and `user_service.py` already do) is the standard.

### Dependency injection

Use FastAPI's `Depends` to inject the DB session (`get_db`) and the current user
(`get_current_user`) into route handlers. This makes testing trivial (override deps with
mocks/fixtures) and avoids global singletons.

### Multi-tenant scoping

Every request has a `city_id` from the `X-City-Id` header (validated against the JWT's `city_id`
claim — they must match). All queries are scoped by `city_id` at the service layer. **No global
queries**; the only exception is admin endpoints behind a separate role check.

### Async

FastAPI handlers are `async def`. SQLAlchemy uses the async engine (`sqlalchemy[asyncio]` +
`asyncpg`). HTTP calls to external services use `httpx.AsyncClient`. CPU-bound work goes to a
separate worker (see Background jobs below) — never block the event loop.

### Background jobs

Not implemented yet (no job runner is in `requirements.txt` at the time of writing). When the first
job is needed, default to **arq** (Redis-only, no separate broker/result-backend config, small API
surface) over Celery — the project's Redis instance is already planned in
`00-foundation/17-docker-dev-environment.md`, and Celery's extra operational surface (broker +
backend + worker pools) isn't worth it for a solo project. Expected first jobs:

- Photo processing pipelines (compress, anonymize, upload)
- Push notification dispatch
- NPS email trigger after ticket close
- Daily aggregations
- Webhook retries to legacy ERPs

### API style: REST (Open311) + GraphQL

`apps/backend` actually exposes two API styles side by side (see `apps/backend/main.py`):

- **REST**, mounted directly on the FastAPI app (`/auth`, `/users`, and future citizen-report
  endpoints). Citizen-report endpoints follow the **Open311 GeoReport v2** spec for interoperability
  with other civic systems; internal extensions are added as additional fields without breaking the
  spec. Non-Open311 endpoints (auth, users, RBAC) don't need to follow Open311 shapes — only the
  citizen-report domain does.
- **GraphQL** (Strawberry, mounted at `/graphql`), consumed by `apps/web`'s Apollo Client.
  Introspection and GraphiQL are disabled in non-dev environments (see `app/graphql/schema.py`). Use
  GraphQL for the manager dashboard's flexible, nested-query needs; keep the mobile app and external
  Open311 integrations on REST.

## Frontend — mobile (React Native, Expo Router)

### Routes vs. screen implementation

`apps/city-hero` uses **Expo Router** (file-based routing) — confirmed by the actual `app/`
directory (`app/_layout.tsx`, `app/(tabs)/`, `app/modal.tsx`, etc.), not a manually-wired React
Navigation tree. Per Expo Router's own rules, the `app/` directory is reserved for routes and
layouts only — non-navigation code (components, hooks, business logic) must live outside it or Expo
Router will try to treat those files as routes.

Convention used across `docs/tasks/`: keep each `app/**` route file thin (a few lines that import
and render the screen), and put the actual screen implementation in
`apps/city-hero/src/screens/<Screen>/` — co-locating sub-components, styles, types, tests, and
stories there. Hooks specific to a screen live in that screen's `hooks/` subfolder; shared hooks go
in `apps/city-hero/src/hooks/`. This keeps route files matching Expo Router's file-based conventions
while still giving every screen a stable, framework-agnostic home for its code.

### Frontend component architecture

This section is normative for any React UI work. See [`design-system.md`](./design-system.md) for
the full rules and [`component-inventory.md`](./component-inventory.md) for the canonical catalog of
shared components.

**Tiered placement**: components live by tier in `packages/design_system/` — tokens, atoms,
molecules, organisms, templates. Concrete screens live in `apps/city-hero/src/screens/<Screen>/` and
**compose** the design-system pieces. Screen folders never define generic primitives (buttons,
chips, badges, etc.).

**Reuse rule**: a component used by 2+ screens (or plausibly will be) lives in the design system.
Single-use screen-specific compositions are fine in the screen folder.

**Storybook is mandatory** for every shared component. Stories live next to the component
(`Foo.stories.tsx`) and cover all variants, states, and edge cases. They're part of the component's
Definition of Done — no story, not merged.

**Patterns**:

- Composition over configuration. Prefer compound components (`Card.Header`, `Card.Body`) over giant
  prop APIs.
- Headless components for behavior (gestures, focus traps, popovers); UI wrappers layer the styling.
- Hooks for stateful logic; components stay declarative.
- Variants via discriminated unions, not boolean flags.
- `React.forwardRef` on atoms and molecules.
- `React.memo` + stable callbacks for components rendered in long lists.

### Container vs Presentational

- **Container components** own state and side effects. They fetch data via React Query hooks, manage
  forms, and pass props down. They live in screen folders.
- **Presentational components** are stateless: take props, render JSX. They live in
  `packages/design_system` and never fetch data or know about navigation.

### Hooks for logic

Business logic lives in custom hooks (`useReports`, `useGeolocation`). Hooks for behavior
(`useSwipeable`, `useFocusTrap`) live in the design system. Hooks for data (`useReports`,
`useFeedItems`) live in screen folders close to their consumers. Components call hooks and render.

### State management

- **Local state**: `useState`/`useReducer` for component-scoped state.
- **Server state**: React Query (TanStack Query) for everything fetched from the API. No manual
  caching.
- **Global client state**: Zustand for cross-screen state (auth user, app settings, offline queue
  summary). Avoid Redux unless complexity grows.

### Navigation

**Expo Router** (file-based; built on React Navigation internally, so its primitives — `Stack`,
screen `options`, etc. — are familiar if you've used React Navigation directly). Concretely, per the
actual root layout (`apps/city-hero/app/_layout.tsx`):

- `app/_layout.tsx` defines the root `<Stack>` and wraps it with the design system's
  `ThemeProvider`.
- Route groups in parentheses (`app/(tabs)/`) organize the bottom tab navigator without adding a URL
  segment; `app/(tabs)/_layout.tsx` defines the tabs themselves.
- Modals (Camera, Auth) are separate top-level routes under `app/` with
  `options={{ presentation: 'modal' }}` on their `<Stack.Screen>` — stack-level, not tab-level.
- Typed routes come from Expo Router's built-in TypeScript support (generated route types); avoid
  hand-rolling a separate route-typing layer.

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

| Field     | Type   | Description                                            |
| --------- | ------ | ------------------------------------------------------ |
| `code`    | string | Machine-readable identifier (e.g., `validation_error`) |
| `message` | string | i18n key (not literal text). Frontend translates.      |
| `details` | object | Optional. Field-level errors or extra context.         |
| `traceId` | string | UUID for cross-system correlation.                     |

### Pagination

Cursor-based for high-volume lists (reports, feed). Offset-based acceptable for small lists (cities,
achievements).

### Idempotency

POST endpoints that can be retried (create report, send notification) accept an `Idempotency-Key`
header. The backend deduplicates within a 24h window.

## Patterns to AVOID

- **God services / God components.** Split when a file exceeds ~300 lines.
- **Anemic domain models.** If a domain object has only data and no behavior, that's a sign business
  logic leaked into services that should belong with the data.
- **Implicit globals.** Pass dependencies explicitly (DI). Avoid module-level singletons that hold
  state.
- **Magic strings.** Constants and enums for status values, event names, role names, etc.
- **Premature abstraction.** Don't generalize until there are at least 2-3 concrete use cases.

## References

- FastAPI bigger applications (routers/dependencies structure):
  https://fastapi.tiangolo.com/tutorial/bigger-applications/
- SQLAlchemy 2.0 async ORM: https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html
- arq: https://arq-docs.helpmanual.io/
- React Query: https://tanstack.com/query/latest
- Expo Router core concepts: https://docs.expo.dev/router/basics/core-concepts/
- Next.js App Router: https://nextjs.org/docs/app
- Open311 GeoReport v2: https://wiki.open311.org/GeoReport_v2/

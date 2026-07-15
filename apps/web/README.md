# CityHero — Web (Manager Dashboard)

Next.js 15 (App Router) dashboard for City Hall operators — War Room, Kanban, Smart Routing, user
management, and analytics. Talks to the FastAPI [`backend`](../backend/README.md) over REST and
GraphQL.

---

## Structure

**`app/lib/`** — the three shared clients every route builds on: `api.ts` (REST fetch wrapper with
the session cookie attached), `apollo.ts` (GraphQL client setup), and `session.ts` (reads/writes the
`httpOnly` auth cookie). `ApolloWrapper.tsx` wires the Apollo client into the React tree from
`layout.tsx`.

**`app/api/`** — Next.js route handlers that proxy to the FastAPI backend: `auth/login` and
`auth/logout` (set/clear the session cookie), `graphql/` (forwards GraphQL operations), and `users/`
(REST CRUD, including `[id]/reset-password` and `[id]/restore`).

**`app/(auth)/login/`** — the login screen, the only route outside the auth guard.

**`app/(dashboard)/`** — the auth-guarded layout (redirects to login if there's no valid session).
`users/` is the one fully built-out feature here — list/search/create/edit/reset-password/restore,
with its own `_components/`, `_hooks/` (`useUsers`, `useCurrentUser`), `_api.ts`, and `_types.ts`.
`kanban/`, `routing/`, and `analytics/` are currently placeholder pages, staged for the Kanban
board, Smart Routing, and BI dashboards described in the [product docs](../../docs/features.md).

**`components/`** — shared UI kit organized atomic-design style: `atoms/` (`Button`, `Input`,
`Select`, `Badge`, `Checkbox`, `Tabs`, `Tooltip`, `Label`), `molecules/` (`FormField`,
`AlertMessage`), `organisms/` (`DataTable`, `Modal`, `ConfirmDialog`, `Pagination`).

**`e2e/`** — Playwright end-to-end tests (`auth.spec.ts`, `users.spec.ts`) plus `global-setup.ts`.

## Running locally

The default, tested way to run this app is through the repo-root Makefile — see the
[root README](../../README.md#getting-started) (`make start` or `make setup`). That path starts
`db` + `backend` in Docker first, then runs this app's dev server locally.

To run it standalone (backend already reachable at `http://localhost:8000`):

```bash
cd apps/web
cp .env.sample .env.local   # default BACKEND_URL=http://localhost:8000 works out of the box
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev        # dev server with hot reload
npm run build       # production build
npm run start        # serve the production build
npm run lint          # ESLint
npm run test:e2e       # Playwright end-to-end tests (see e2e/)
```

## Environment Variables

See [`.env.sample`](./.env.sample). `BACKEND_URL` is server-side only (not `NEXT_PUBLIC_`-prefixed)
— it's read by the `app/api/*` route handlers that proxy requests to the FastAPI backend, and never
bundled into client-side JS.

## Auth

JWT issued by the backend, stored in an `httpOnly` cookie (`app/lib/session.ts`), attached to
outgoing requests by `app/lib/api.ts` (REST) and `app/lib/apollo.ts` (GraphQL). The `(dashboard)`
route group layout enforces the auth guard.

# Web BFF routes → @city-hero/api-client migration

**Date:** 2026-07-17 **Branch:** `feat/api-client-package` (follow-up on open PR #34) **Depends
on:** `docs/tasks/00-foundation/05-api-client.md` (merged into this same PR —
`@city-hero/api-client` package + `apps/web`'s `GET /api/users/me` route already migrated as the
initial smoke test)

## Context

PR #34 introduced `@city-hero/api-client` and migrated one BFF route (`GET /api/users/me`) as an
end-to-end smoke test. The task file explicitly flagged the remaining 6 BFF routes as a natural
follow-up:

- `POST /api/auth/login`
- `GET /api/users`, `POST /api/users`
- `GET /api/users/:id`, `PATCH /api/users/:id`, `DELETE /api/users/:id`
- `POST /api/users/:id/reset-password`
- `POST /api/users/:id/restore`

All six still call the backend through the old ad-hoc `apps/web/lib/api-proxy.ts` helper
(`backendFetch` + `getAuthHeaders`), which forwards the raw backend response body/status through
unchanged.

## Findings from investigation

1. **`sort` query param gap.** `GET /api/users` forwards a repeatable `sort` param
   (`sort=field:dir`, multiple values) that the backend genuinely uses
   (`apps/backend/app/routers/users.py`, `sort: list[str] = Query(default=[])`) to drive the users
   table's column sorting. `@city-hero/api-client`'s `RequestOptions.query` only supports single
   scalar values (`buildUrl` uses `URLSearchParams.set()`), and `ListUsersParams` has no `sort`
   field at all. Migrating this route as-is would silently break table sorting.
2. **Wire-format casing is not a simple "JS=camelCase / backend=snake_case" split.** The backend's
   JSON _bodies_ already use camelCase on the wire: `apps/backend/app/schemas/base.py`'s `CamelBase`
   sets `alias_generator=to_camel` and routers use `response_model_by_alias=True`, so responses
   serialize as `isActive`, `authProvider`, etc. `populate_by_name=True` additionally lets the
   backend _accept_ snake_case on input as Pydantic leniency, which is why the old ad-hoc routes
   (sending `is_active`, `new_password`) happen to still work today — but camelCase is the
   canonical/documented wire format per `CLAUDE.md`. `@city-hero/api-client`'s `client.ts` does no
   body key translation at all (`JSON.stringify`/`response.json()` pass-through) because none is
   needed for bodies. Query string params are the one genuine exception: they're plain FastAPI
   `Query()` params, never routed through `CamelBase`, so they stay snake_case on the wire
   (`page_size`, `status`). The package handles this today with **manual, per-field mapping inside
   each `endpoints/*.ts` file** (see `users.ts`'s existing
   `query: { page, page_size: params.pageSize, ... }`) — there is no generic camelCase↔snake_case
   converter utility in the package, and this migration keeps it that way rather than introducing
   one for a handful of fields.
3. **`X-Forwarded-For` on login is already a no-op.** The old login route sets this header, but the
   backend's rate limiter (`apps/backend/app/core/limiter.py`, `key_func=get_remote_address`) reads
   `request.client.host`, never `X-Forwarded-For` — confirmed no reference to that header anywhere
   in `apps/backend`. Dropping it during migration (the new client has no custom-header passthrough)
   has zero functional effect today.
4. **`restore`'s dead 204 branch.** The old route special-cases a 204 response for
   `POST /users/:id/restore`, but the backend endpoint (`apps/backend/app/routers/users.py`) returns
   `200` with a `UserOut` body, matching `@city-hero/api-client`'s `restore(): Promise<UserOut>`
   signature. The 204 branch in the old code was unreachable defensive code, not a real behavior to
   preserve.
5. **Error-shape divergence.** The old routes proxy the raw backend response body (`res.text()`)
   verbatim, including FastAPI's 422 validation array. The `users/me` pattern instead normalizes to
   `{ detail: error.message }` via `ApiClientError` — but for the `validation_error` code,
   `error.message` is a fixed string (`"validation_error"`), with the real per-field array living in
   `error.details`. The frontend's `apiFetch` (`apps/web/app/(dashboard)/users/_api.ts`) only ever
   reads `body.detail` as the error text, so this migration special-cases the 422 case to return
   `{ detail: error.details }` instead of `{ detail: error.message }`, preserving today's behavior
   exactly.

## Design

### 1. `packages/api_client` extension (minimal, scoped to `users`)

- `src/types.ts`: `RequestOptions.query` value type widens to accept arrays:
  `Record<string, string | number | boolean | undefined | (string | number | boolean)[]>`.
- `src/client.ts`: `buildUrl` appends one `searchParams` entry per array item (`.append()`) instead
  of a single `.set()`, for query values that are arrays.
- `src/endpoints/users.ts`: `ListUsersParams` gains `sort?: string[]`;
  `createUsersEndpoints().list()` adds `sort: params.sort` to the existing manually-built query
  object (same pattern as `page`/`page_size`/`q`/`status` today — no generic query-key transformer
  introduced).
- No changes to `auth.ts`, `reports.ts`, `comments.ts`, `notifications.ts`, or any other
  interceptor.
- New/updated tests: `buildUrl`/query-array behavior, and `users.list()` sending multiple `sort`
  values correctly.

### 2. BFF route migrations (`apps/web/app/api/...`)

All six routes switch to `createServerApiClient()` (from `@/lib/api-client`, already established by
the `users/me` route in PR #34) and adopt this shared error-handling shape:

```ts
try {
  const result = await createServerApiClient().<endpoint>(...);
  return NextResponse.json(result /* or NextResponse(null, {status:204}) for void results */);
} catch (error) {
  if (error instanceof ApiClientError && error.status > 0) {
    const detail = error.code === "validation_error" ? error.details : error.message;
    return NextResponse.json({ detail }, { status: error.status });
  }
  return NextResponse.json({ error: "Backend unavailable" }, { status: 503 });
}
```

| Route                                | `api-client` call                                        | Response shape                                                                                                                                                                                                  |
| ------------------------------------ | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /api/auth/login`               | `client.auth.login({ email, password })`                 | Unchanged: sets `access_token` httpOnly cookie manually, returns `{ user }`. `X-Forwarded-For` dropped (confirmed no-op, see Findings #3).                                                                      |
| `GET /api/users`                     | `client.users.list({ page, pageSize, q, status, sort })` | `NextResponse.json(result)`. Query allowlisting becomes implicit (typed params only).                                                                                                                           |
| `POST /api/users`                    | `client.users.create({ email, name, password, role })`   | `NextResponse.json(result)`, status 201 preserved via `response.ok` passthrough in the client (`NextResponse.json` defaults to 200 — route must set `{ status: 201 }` explicitly to preserve current behavior). |
| `GET /api/users/:id`                 | `client.users.get(id)`                                   | `NextResponse.json(result)`                                                                                                                                                                                     |
| `PATCH /api/users/:id`               | `client.users.update(id, { name, isActive, role })`      | Body now read as camelCase from the request (see §3). `NextResponse.json(result)`                                                                                                                               |
| `DELETE /api/users/:id`              | `client.users.remove(id)`                                | `new NextResponse(null, { status: 204 })`                                                                                                                                                                       |
| `POST /api/users/:id/reset-password` | `client.users.resetPassword(id, { newPassword })`        | `new NextResponse(null, { status: 204 })`                                                                                                                                                                       |
| `POST /api/users/:id/restore`        | `client.users.restore(id)`                               | `NextResponse.json(result)` (200; dead 204 branch removed, see Findings #4)                                                                                                                                     |

### 3. Frontend form updates (`apps/web/app/(dashboard)/users/_components/`)

- `UserFormModal.tsx`: edit payload changes from `{ name, is_active: isActive }` to
  `{ name, isActive }`.
- `ResetPasswordModal.tsx`: payload changes from `{ new_password: password }` to
  `{ newPassword: password }`.
- No other logic changes; both still go through `apiFetch`/`_api.ts` unchanged — only the JSON body
  shape sent to the BFF routes changes, aligning with the backend's canonical camelCase wire format
  (Findings #2) instead of relying on Pydantic's `populate_by_name` leniency.

### 4. Tests

- One test file per migrated route (Vitest + MSW, same pattern as `packages/api_client`'s own
  tests), covering: success path, 401 with no cookie, normalized 4xx/422 error (asserting `detail`
  carries the validation array, not the generic string), and backend-unavailable (`status: 0` →
  503).
- Exact file layout (co-located `route.test.ts` next to each route vs. a centralized test directory)
  is left to the implementation plan.

### 5. Cleanup

- Delete `apps/web/lib/api-proxy.ts` once no route imports it (confirmed today only these 5 files +
  `.env.sample`'s documentation comment reference it).

### 6. Commit plan (same branch `feat/api-client-package`, same PR #34)

1. `feat(api-client): support array query params (sort)` — package extension + tests.
2. `refactor(web): migrate login BFF route to @city-hero/api-client`
3. `refactor(web): migrate users BFF routes to @city-hero/api-client` — all 6 users endpoints,
   camelCase form payloads, `lib/api-proxy.ts` removal, and the new route tests.

## Out of scope

- No generic camelCase↔snake_case query-param converter utility (Findings #2 / explicit decision —
  not worth it for a handful of fields).
- No changes to `apps/city-hero` (mobile) — untouched by this follow-up.
- No changes to `reports`/`comments`/`notifications` endpoints (still provisional, no real backend
  routes).
- No re-introduction of `X-Forwarded-For` forwarding (confirmed dead today; revisit only if the
  backend's rate limiter is ever made proxy-aware).

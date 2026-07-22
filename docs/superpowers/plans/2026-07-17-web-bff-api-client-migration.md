# Web BFF Routes → @city-hero/api-client Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the 6 remaining `apps/web` BFF routes (login, users list/create/get/update/delete,
reset-password, restore) from the old ad-hoc `lib/api-proxy.ts` helper to `@city-hero/api-client`,
matching the pattern already established by `GET /api/users/me` in PR #34.

**Architecture:** Each BFF route calls `createServerApiClient()` (already exists at
`apps/web/lib/api-client.ts`) instead of raw `fetch`. A new shared `apiErrorResponse()` helper
centralizes the `ApiClientError → NextResponse` mapping used by every users-related route (login
keeps its own inline mapping — its frontend contract uses a different JSON key).
`packages/api_client` gains array-valued query param support so `GET /api/users`' `sort` param
(currently unsupported by the package) doesn't regress.

**Tech Stack:** Next.js 16 App Router route handlers, `@city-hero/api-client`, Vitest + MSW v2 (new
to `apps/web`, already used in `packages/api_client`).

**Spec:** `docs/superpowers/specs/2026-07-17-web-bff-api-client-migration-design.md`

## Global Constraints

- Stay on branch `feat/api-client-package` (PR #34 already open from it) — do not create a new
  branch, do not commit to `main`.
- Commit messages follow Conventional Commits (`feat:`, `refactor:`, `test:`, `chore:`) per
  `CLAUDE.md`.
- Run `npx eslint .` and `npx tsc --noEmit` (or the workspace-scoped equivalents) before each commit
  that touches a workspace's source; run the workspace's `npm test` for any task that adds/changes
  tests.
- JSON request/response bodies are camelCase on the wire (backend's `CamelBase` Pydantic config) —
  no snake_case in new/changed body shapes. Query string params stay snake_case (plain FastAPI
  `Query()` params) — mapped manually field-by-field, no generic converter.
- No changes to `apps/city-hero`, `reports`/`comments`/`notifications` endpoints, or
  `X-Forwarded-For` handling (all explicitly out of scope per the spec).

---

### Task 1: Support array-valued query params in `packages/api_client`

**Files:**

- Modify: `packages/api_client/src/types.ts:8`
- Modify: `packages/api_client/src/client.ts:42-50`
- Test: `packages/api_client/tests/client.test.ts`

**Interfaces:**

- Consumes: nothing new.
- Produces: `RequestOptions.query` accepts `(string | number | boolean)[]` per key; `buildUrl`
  appends one `searchParams` entry per array item instead of overwriting. Consumed by Task 2.

- [ ] **Step 1: Write the failing test**

Add to `packages/api_client/tests/client.test.ts`, after the existing
`describe("createApiClient — cancellation", ...)` block (before the file's closing):

```ts
describe("createApiClient — query serialization", () => {
  it("appends one query entry per array value instead of overwriting", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const client = createApiClient({
      baseUrl: BASE_URL,
      getToken: vi.fn().mockResolvedValue(null),
      onAuthFailure: vi.fn(),
      fetchImpl,
    });

    await client.request("/users", { query: { sort: ["name:asc", "email:desc"], page: 1 } });

    const calledUrl = new URL(fetchImpl.mock.calls[0][0] as string);
    expect(calledUrl.searchParams.getAll("sort")).toEqual(["name:asc", "email:desc"]);
    expect(calledUrl.searchParams.get("page")).toBe("1");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
`cd packages/api_client && npx vitest run tests/client.test.ts -t "appends one query entry per array value"`
Expected: FAIL — `calledUrl.searchParams.getAll("sort")` returns `["email:desc"]` (only the last
value), not both, because `buildUrl` currently calls `.set()` unconditionally.

- [ ] **Step 3: Widen the query type**

In `packages/api_client/src/types.ts`, change line 8:

```ts
  query?: Record<string, string | number | boolean | undefined>;
```

to:

```ts
  query?: Record<string, string | number | boolean | undefined | (string | number | boolean)[]>;
```

- [ ] **Step 4: Implement array-aware `buildUrl`**

In `packages/api_client/src/client.ts`, replace the `buildUrl` function (lines 42-50):

```ts
function buildUrl(baseUrl: string, path: string, query?: RequestOptions["query"]): string {
  const url = new URL(path, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}
```

with:

```ts
function buildUrl(baseUrl: string, path: string, query?: RequestOptions["query"]): string {
  const url = new URL(path, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined) continue;
      if (Array.isArray(value)) {
        for (const item of value) url.searchParams.append(key, String(item));
      } else {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd packages/api_client && npx vitest run tests/client.test.ts` Expected: PASS (all tests in
the file, including the new one)

- [ ] **Step 6: Typecheck and lint**

Run: `cd packages/api_client && npx tsc --noEmit && npx eslint .` Expected: no errors

- [ ] **Step 7: Commit**

```bash
git add packages/api_client/src/types.ts packages/api_client/src/client.ts packages/api_client/tests/client.test.ts
git commit -m "feat(api-client): support array-valued query params"
```

---

### Task 2: Add `sort` support to `users.list()`

**Files:**

- Modify: `packages/api_client/src/endpoints/users.ts:56-89`
- Test: `packages/api_client/tests/endpoints/users.test.ts`

**Interfaces:**

- Consumes: `RequestOptions.query` array support from Task 1.
- Produces: `ListUsersParams.sort?: string[]`; `users.list({ sort })` sends repeated `sort=` query
  params. Consumed by Task 5 (`GET /api/users` route).

- [ ] **Step 1: Write the failing test**

Add to `packages/api_client/tests/endpoints/users.test.ts`, inside the existing
`describe("users endpoints", ...)` block, right after the
`"lists users with page/page_size/status as query params"` test:

```ts
it("lists users with repeated sort query params", async () => {
  server.use(
    http.get(`${BASE_URL}/users`, ({ request }) => {
      const url = new URL(request.url);
      expect(url.searchParams.getAll("sort")).toEqual(["name:asc", "email:desc"]);
      return HttpResponse.json({ users: [], total: 0, page: 1, pageSize: 20 });
    }),
  );

  await makeClient().users.list({ sort: ["name:asc", "email:desc"] });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/api_client && npx vitest run tests/endpoints/users.test.ts -t "repeated sort"`
Expected: FAIL with a TypeScript error (`sort` doesn't exist on `ListUsersParams`) or, if run via
`vitest run` (which transpiles without full type-checking), a runtime assertion failure since `sort`
is silently dropped by `list()`.

- [ ] **Step 3: Add `sort` to `ListUsersParams` and wire it into `list()`**

In `packages/api_client/src/endpoints/users.ts`, change the `ListUsersParams` interface (lines
56-61):

```ts
export interface ListUsersParams {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: "active" | "inactive" | "deleted";
}
```

to:

```ts
export interface ListUsersParams {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: "active" | "inactive" | "deleted";
  sort?: string[];
}
```

And change the `list` implementation inside `createUsersEndpoints` (lines 80-89):

```ts
    list: (params = {}, signal) =>
      client.request<UsersListResponse>("/users", {
        query: {
          page: params.page,
          page_size: params.pageSize,
          q: params.q,
          status: params.status,
        },
        signal,
      }),
```

to:

```ts
    list: (params = {}, signal) =>
      client.request<UsersListResponse>("/users", {
        query: {
          page: params.page,
          page_size: params.pageSize,
          q: params.q,
          status: params.status,
          sort: params.sort,
        },
        signal,
      }),
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/api_client && npx vitest run tests/endpoints/users.test.ts` Expected: PASS (all
tests in the file)

- [ ] **Step 5: Typecheck, lint, full package suite**

Run: `cd packages/api_client && npx tsc --noEmit && npx eslint . && npx vitest run --coverage`
Expected: no errors; coverage stays ≥90% (per the package's existing DoD)

- [ ] **Step 6: Commit**

```bash
git add packages/api_client/src/endpoints/users.ts packages/api_client/tests/endpoints/users.test.ts
git commit -m "feat(api-client): add sort param support to users.list()"
```

---

### Task 3: apps/web test infrastructure + shared error-response helper

**Files:**

- Modify: `apps/web/package.json` (add `msw` devDependency)
- Create: `apps/web/app/api/__test-utils__/server.ts`
- Create: `apps/web/lib/api-error-response.ts`
- Modify: `apps/web/app/api/users/me/route.ts`
- Test: `apps/web/app/api/users/me/route.test.ts`

**Interfaces:**

- Consumes: `ApiClientError` from `@city-hero/api-client` (already a dependency).
- Produces: `apiErrorResponse(error: unknown): NextResponse` — consumed by Tasks 5-8. `server` (MSW
  `setupServer()` instance) at `apps/web/app/api/__test-utils__/server.ts` — consumed by Tasks 4-8's
  tests.

- [ ] **Step 1: Add `msw` as a dev dependency**

In `apps/web/package.json`, add to `devDependencies` (matching the version already used by
`packages/api_client`):

```json
    "msw": "^2.7.3",
```

Run from repo root: `npm install` Expected: `package-lock.json` updates, `apps/web/node_modules/msw`
exists.

- [ ] **Step 2: Create the shared MSW server helper**

Create `apps/web/app/api/__test-utils__/server.ts`:

```ts
import { setupServer } from "msw/node";

export const server = setupServer();
```

- [ ] **Step 3: Create the shared error-response helper**

Create `apps/web/lib/api-error-response.ts`:

```ts
import { ApiClientError } from "@city-hero/api-client";
import { NextResponse } from "next/server";

// Shared by every BFF route whose frontend contract reads `body.detail` as
// the error string (apps/web/app/(dashboard)/users/_api.ts's apiFetch).
// apps/web/app/api/auth/login/route.ts is the one exception — its frontend
// reads `body.error` instead, so it builds its own response inline.
export function apiErrorResponse(error: unknown): NextResponse {
  if (error instanceof ApiClientError && error.status > 0) {
    const detail = error.code === "validation_error" ? error.details : error.message;
    return NextResponse.json({ detail }, { status: error.status });
  }
  return NextResponse.json({ error: "Backend unavailable" }, { status: 503 });
}
```

- [ ] **Step 4: Refactor `users/me/route.ts` to use the shared helper**

Replace the full contents of `apps/web/app/api/users/me/route.ts`:

```ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createServerApiClient } from "@/lib/api-client";
import { apiErrorResponse } from "@/lib/api-error-response";

export async function GET() {
  const store = await cookies();
  const token = store.get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  try {
    const me = await createServerApiClient().users.me();
    return NextResponse.json(me);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
```

- [ ] **Step 5: Write the test for `users/me` (validates the whole harness)**

Create `apps/web/app/api/users/me/route.test.ts`:

```ts
// @vitest-environment node
import { HttpResponse, http } from "msw";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { server } from "../../__test-utils__/server";
import { GET } from "./route";

const mockCookies = vi.hoisted(() => vi.fn());
vi.mock("next/headers", () => ({ cookies: mockCookies }));

const BACKEND_URL = "http://localhost:8000";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function mockToken(token: string | undefined) {
  mockCookies.mockResolvedValue({
    get: (name: string) => (name === "access_token" && token ? { value: token } : undefined),
  });
}

describe("GET /api/users/me", () => {
  it("returns 401 without calling the backend when there is no access_token cookie", async () => {
    mockToken(undefined);

    const response = await GET();

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.detail).toBe("Unauthorized");
  });

  it("returns the current user on success", async () => {
    mockToken("valid-token");
    server.use(
      http.get(`${BACKEND_URL}/users/me`, () =>
        HttpResponse.json({
          id: "u1",
          email: "admin@cityhero.app",
          name: "Admin",
          role: "admin",
          authProvider: "password",
          isActive: true,
          avatarUrl: null,
          createdAt: "2026-01-01T00:00:00Z",
          deletedAt: null,
          roleInfo: { name: "admin", rank: 10, isSuperuser: true },
          capabilities: { permissions: [], assignableRoles: [], manageableRoles: [] },
        }),
      ),
    );

    const response = await GET();

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.email).toBe("admin@cityhero.app");
  });

  it("returns 401 with the normalized detail when the backend rejects the token", async () => {
    mockToken("expired-token");
    server.use(
      http.get(`${BACKEND_URL}/users/me`, () =>
        HttpResponse.json({ detail: "Could not validate credentials" }, { status: 401 }),
      ),
    );

    const response = await GET();

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.detail).toBe("Could not validate credentials");
  });

  it("returns 503 when the backend is unreachable", async () => {
    mockToken("valid-token");
    server.use(http.get(`${BACKEND_URL}/users/me`, () => HttpResponse.error()));

    const response = await GET();

    expect(response.status).toBe(503);
    const data = await response.json();
    expect(data.error).toBe("Backend unavailable");
  });
});
```

- [ ] **Step 6: Run test to verify it passes**

Run: `cd apps/web && npx vitest run app/api/users/me/route.test.ts` Expected: PASS (4 tests). If the
`next/headers` mock doesn't take effect, verify `vi.mock` is present at module scope (Vitest hoists
it above the `import { GET } from "./route"` line automatically regardless of source order).

- [ ] **Step 7: Typecheck and lint**

Run: `cd apps/web && npx tsc --noEmit && npx eslint .` Expected: no errors

- [ ] **Step 8: Commit**

```bash
git add apps/web/package.json package-lock.json apps/web/app/api/__test-utils__/server.ts apps/web/lib/api-error-response.ts apps/web/app/api/users/me/route.ts apps/web/app/api/users/me/route.test.ts
git commit -m "test(web): add MSW test infra and shared BFF error-response helper"
```

---

### Task 4: Migrate `POST /api/auth/login`

**Files:**

- Modify: `apps/web/app/api/auth/login/route.ts`
- Test: `apps/web/app/api/auth/login/route.test.ts`

**Interfaces:**

- Consumes: `createServerApiClient()` from `apps/web/lib/api-client.ts`; `ApiClientError` from
  `@city-hero/api-client`; `server` test helper from Task 3.
- Produces: nothing consumed by later tasks (login has no downstream route dependents).

- [ ] **Step 1: Write the failing test**

Create `apps/web/app/api/auth/login/route.test.ts`:

```ts
// @vitest-environment node
import { HttpResponse, http } from "msw";
import { NextRequest } from "next/server";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { server } from "../../__test-utils__/server";
import { POST } from "./route";

const BACKEND_URL = "http://localhost:8000";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function loginRequest(body: unknown) {
  return new NextRequest("http://localhost/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/login", () => {
  it("sets the access_token cookie and returns the user on success", async () => {
    server.use(
      http.post(`${BACKEND_URL}/auth/login`, () =>
        HttpResponse.json({
          accessToken: "fresh-token",
          tokenType: "bearer",
          user: { id: "u1", email: "admin@cityhero.app", name: "Admin", role: "admin" },
        }),
      ),
    );

    const response = await POST(loginRequest({ email: "admin@cityhero.app", password: "correct" }));

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.user.email).toBe("admin@cityhero.app");
    const cookie = response.cookies.get("access_token");
    expect(cookie?.value).toBe("fresh-token");
    expect(cookie?.httpOnly).toBe(true);
  });

  it("returns a 401 with the backend's error message under the `error` key on wrong credentials", async () => {
    server.use(
      http.post(`${BACKEND_URL}/auth/login`, () =>
        HttpResponse.json({ detail: "Incorrect email or password" }, { status: 401 }),
      ),
    );

    const response = await POST(loginRequest({ email: "admin@cityhero.app", password: "wrong" }));

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe("Incorrect email or password");
  });

  it("returns 503 when the backend is unreachable", async () => {
    server.use(http.post(`${BACKEND_URL}/auth/login`, () => HttpResponse.error()));

    const response = await POST(loginRequest({ email: "admin@cityhero.app", password: "x" }));

    expect(response.status).toBe(503);
    const data = await response.json();
    expect(data.error).toBe("Backend unavailable");
  });

  it("returns 400 on invalid JSON body", async () => {
    const request = new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/web && npx vitest run app/api/auth/login/route.test.ts` Expected: FAIL — the current
route imports `@/lib/api-proxy` and hits a real `fetch` (unmocked by MSW's
`onUnhandledRequest: "error"` unless it happens to match `${BACKEND_URL}/auth/login`, which it does
— but the response shape it returns for success doesn't set `data.user` in the way the test expects
and, more importantly, the route still works against `X-Forwarded-For` logic and its own body
assembly, so at minimum the "backend unavailable" test will fail since the current route doesn't use
`createServerApiClient`/MSW-intercepted `fetchImpl` — verify actual failure output and proceed).

- [ ] **Step 3: Migrate the route**

Replace the full contents of `apps/web/app/api/auth/login/route.ts`:

```ts
import { ApiClientError } from "@city-hero/api-client";
import { NextRequest, NextResponse } from "next/server";

import { createServerApiClient } from "@/lib/api-client";

export async function POST(request: NextRequest) {
  let email: unknown, password: unknown;
  try {
    const body = await request.json();
    email = body.email;
    password = body.password;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const result = await createServerApiClient().auth.login({
      email: email as string,
      password: password as string,
    });

    if (typeof result.accessToken !== "string") {
      return NextResponse.json({ error: "Invalid auth response from backend" }, { status: 502 });
    }

    const response = NextResponse.json({ user: result.user });
    response.cookies.set("access_token", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60,
      path: "/",
    });
    return response;
  } catch (error) {
    if (error instanceof ApiClientError && error.status > 0) {
      const message = error.code === "validation_error" ? error.details : error.message;
      return NextResponse.json({ error: message }, { status: error.status });
    }
    return NextResponse.json({ error: "Backend unavailable" }, { status: 503 });
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/web && npx vitest run app/api/auth/login/route.test.ts` Expected: PASS (4 tests)

- [ ] **Step 5: Typecheck and lint**

Run: `cd apps/web && npx tsc --noEmit && npx eslint .` Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add apps/web/app/api/auth/login/route.ts apps/web/app/api/auth/login/route.test.ts
git commit -m "refactor(web): migrate login BFF route to @city-hero/api-client"
```

---

### Task 5: Migrate `GET /api/users` and `POST /api/users`

**Files:**

- Modify: `apps/web/app/api/users/route.ts`
- Test: `apps/web/app/api/users/route.test.ts`

**Interfaces:**

- Consumes: `apiErrorResponse` from Task 3; `ListUsersParams.sort` from Task 2.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Write the failing test**

Create `apps/web/app/api/users/route.test.ts`:

```ts
// @vitest-environment node
import { HttpResponse, http } from "msw";
import { NextRequest } from "next/server";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { server } from "../__test-utils__/server";
import { GET, POST } from "./route";

const mockCookies = vi.hoisted(() => vi.fn());
vi.mock("next/headers", () => ({ cookies: mockCookies }));

const BACKEND_URL = "http://localhost:8000";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
beforeEach(() => mockCookies.mockResolvedValue({ get: () => ({ value: "valid-token" }) }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function listRequest(query: string) {
  return new NextRequest(`http://localhost/api/users${query}`);
}

describe("GET /api/users", () => {
  it("forwards page/page_size/q/status and repeats sort for each value", async () => {
    server.use(
      http.get(`${BACKEND_URL}/users`, ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("page")).toBe("2");
        expect(url.searchParams.get("page_size")).toBe("10");
        expect(url.searchParams.get("q")).toBe("ana");
        expect(url.searchParams.get("status")).toBe("inactive");
        expect(url.searchParams.getAll("sort")).toEqual(["name:asc", "email:desc"]);
        return HttpResponse.json({ users: [], total: 0, page: 2, pageSize: 10 });
      }),
    );

    const response = await GET(
      listRequest("?page=2&page_size=10&q=ana&status=inactive&sort=name:asc&sort=email:desc"),
    );

    expect(response.status).toBe(200);
  });

  it("returns 401 with the backend's detail when the token is rejected", async () => {
    server.use(
      http.get(`${BACKEND_URL}/users`, () =>
        HttpResponse.json({ detail: "Could not validate credentials" }, { status: 401 }),
      ),
    );

    const response = await GET(listRequest(""));

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.detail).toBe("Could not validate credentials");
  });
});

describe("POST /api/users", () => {
  function createRequest(body: unknown) {
    return new NextRequest("http://localhost/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  it("creates a user and returns 201", async () => {
    server.use(
      http.post(`${BACKEND_URL}/users`, async ({ request }) => {
        const body = (await request.json()) as { email: string };
        return HttpResponse.json(
          {
            id: "new-id",
            email: body.email,
            name: "Someone",
            role: "field_team",
            authProvider: "password",
            isActive: true,
            avatarUrl: null,
            createdAt: "2026-01-01T00:00:00Z",
            deletedAt: null,
          },
          { status: 201 },
        );
      }),
    );

    const response = await POST(
      createRequest({
        email: "new@example.com",
        name: "Someone",
        password: "Sup3rSecret!",
        role: "field_team",
      }),
    );

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.email).toBe("new@example.com");
  });

  it("returns the validation array as detail on a 422", async () => {
    server.use(
      http.post(`${BACKEND_URL}/users`, () =>
        HttpResponse.json(
          { detail: [{ loc: ["body", "email"], msg: "field required", type: "missing" }] },
          { status: 422 },
        ),
      ),
    );

    const response = await POST(createRequest({ name: "Someone" }));

    expect(response.status).toBe(422);
    const data = await response.json();
    expect(data.detail).toEqual([
      { loc: ["body", "email"], msg: "field required", type: "missing" },
    ]);
  });

  it("returns 400 on invalid JSON body", async () => {
    const request = new NextRequest("http://localhost/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/web && npx vitest run app/api/users/route.test.ts` Expected: FAIL — the current route
uses `@/lib/api-proxy`'s `backendFetch`, not `createServerApiClient`, so `next/headers`'s mocked
`cookies()` is never consulted and behavior around `detail`/validation-array won't match.

- [ ] **Step 3: Migrate the route**

Replace the full contents of `apps/web/app/api/users/route.ts`:

```ts
import type { ListUsersParams } from "@city-hero/api-client";
import { NextRequest, NextResponse } from "next/server";

import { createServerApiClient } from "@/lib/api-client";
import { apiErrorResponse } from "@/lib/api-error-response";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = searchParams.get("page");
  const pageSize = searchParams.get("page_size");
  const q = searchParams.get("q");
  const status = searchParams.get("status");
  const sort = searchParams.getAll("sort");

  try {
    const result = await createServerApiClient().users.list({
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      q: q ?? undefined,
      status: (status ?? undefined) as ListUsersParams["status"],
      sort: sort.length > 0 ? sort : undefined,
    });
    return NextResponse.json(result);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  let email: unknown, name: unknown, password: unknown, role: unknown;
  try {
    const body = await request.json();
    ({ email, name, password, role } = body);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const result = await createServerApiClient().users.create({
      email: email as string,
      name: name as string,
      password: password as string,
      role: role as string | undefined,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/web && npx vitest run app/api/users/route.test.ts` Expected: PASS (5 tests)

- [ ] **Step 5: Typecheck and lint**

Run: `cd apps/web && npx tsc --noEmit && npx eslint .` Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add apps/web/app/api/users/route.ts apps/web/app/api/users/route.test.ts
git commit -m "refactor(web): migrate users list/create BFF route to @city-hero/api-client"
```

---

### Task 6: Migrate `GET`/`PATCH`/`DELETE /api/users/:id`

**Files:**

- Modify: `apps/web/app/api/users/[id]/route.ts`
- Test: `apps/web/app/api/users/[id]/route.test.ts`

**Interfaces:**

- Consumes: `apiErrorResponse` from Task 3.
- Produces: `PATCH` now reads `isActive` (camelCase) from the request body instead of `is_active` —
  consumed by Task 9 (`UserFormModal.tsx` must send that shape for the edit flow to keep working).

- [ ] **Step 1: Write the failing test**

Create `apps/web/app/api/users/[id]/route.test.ts`:

```ts
// @vitest-environment node
import { HttpResponse, http } from "msw";
import { NextRequest } from "next/server";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { server } from "../../__test-utils__/server";
import { DELETE, GET, PATCH } from "./route";

const mockCookies = vi.hoisted(() => vi.fn());
vi.mock("next/headers", () => ({ cookies: mockCookies }));

const BACKEND_URL = "http://localhost:8000";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
beforeEach(() => mockCookies.mockResolvedValue({ get: () => ({ value: "valid-token" }) }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function paramsFor(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe("GET /api/users/:id", () => {
  it("returns the user", async () => {
    server.use(
      http.get(`${BACKEND_URL}/users/u1`, () =>
        HttpResponse.json({
          id: "u1",
          email: "citizen@example.com",
          name: "Citizen One",
          role: "citizen",
          authProvider: "password",
          isActive: true,
          avatarUrl: null,
          createdAt: "2026-01-01T00:00:00Z",
          deletedAt: null,
        }),
      ),
    );

    const response = await GET(new NextRequest("http://localhost/api/users/u1"), paramsFor("u1"));

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.id).toBe("u1");
  });

  it("returns 404 with detail when the user doesn't exist", async () => {
    server.use(
      http.get(`${BACKEND_URL}/users/missing`, () =>
        HttpResponse.json({ detail: "User not found" }, { status: 404 }),
      ),
    );

    const response = await GET(
      new NextRequest("http://localhost/api/users/missing"),
      paramsFor("missing"),
    );

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.detail).toBe("User not found");
  });
});

describe("PATCH /api/users/:id", () => {
  function patchRequest(body: unknown) {
    return new NextRequest("http://localhost/api/users/u1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  it("sends isActive to the backend as camelCase and returns the updated user", async () => {
    server.use(
      http.patch(`${BACKEND_URL}/users/u1`, async ({ request }) => {
        const body = (await request.json()) as { isActive?: boolean };
        expect(body).toEqual({ name: "New Name", isActive: false });
        return HttpResponse.json({
          id: "u1",
          email: "citizen@example.com",
          name: "New Name",
          role: "citizen",
          authProvider: "password",
          isActive: false,
          avatarUrl: null,
          createdAt: "2026-01-01T00:00:00Z",
          deletedAt: null,
        });
      }),
    );

    const response = await PATCH(
      patchRequest({ name: "New Name", isActive: false }),
      paramsFor("u1"),
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.isActive).toBe(false);
  });

  it("returns 400 on invalid JSON body", async () => {
    const request = new NextRequest("http://localhost/api/users/u1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });

    const response = await PATCH(request, paramsFor("u1"));

    expect(response.status).toBe(400);
  });
});

describe("DELETE /api/users/:id", () => {
  it("returns 204 on success", async () => {
    server.use(
      http.delete(`${BACKEND_URL}/users/u1`, () => new HttpResponse(null, { status: 204 })),
    );

    const response = await DELETE(
      new NextRequest("http://localhost/api/users/u1", { method: "DELETE" }),
      paramsFor("u1"),
    );

    expect(response.status).toBe(204);
  });

  it("returns 403 with detail when the caller lacks permission", async () => {
    server.use(
      http.delete(`${BACKEND_URL}/users/u1`, () =>
        HttpResponse.json({ detail: "Not enough permissions" }, { status: 403 }),
      ),
    );

    const response = await DELETE(
      new NextRequest("http://localhost/api/users/u1", { method: "DELETE" }),
      paramsFor("u1"),
    );

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.detail).toBe("Not enough permissions");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/web && npx vitest run "app/api/users/[id]/route.test.ts"` Expected: FAIL — current
route reads `is_active` (snake_case) from the body and uses `@/lib/api-proxy`.

- [ ] **Step 3: Migrate the route**

Replace the full contents of `apps/web/app/api/users/[id]/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";

import { createServerApiClient } from "@/lib/api-client";
import { apiErrorResponse } from "@/lib/api-error-response";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const result = await createServerApiClient().users.get(id);
    return NextResponse.json(result);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let name: unknown, isActive: unknown, role: unknown;
  try {
    const body = await request.json();
    ({ name, isActive, role } = body);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const result = await createServerApiClient().users.update(id, {
      name: name as string | undefined,
      isActive: isActive as boolean | undefined,
      role: role as string | undefined,
    });
    return NextResponse.json(result);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    await createServerApiClient().users.remove(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/web && npx vitest run "app/api/users/[id]/route.test.ts"` Expected: PASS (5 tests)

- [ ] **Step 5: Typecheck and lint**

Run: `cd apps/web && npx tsc --noEmit && npx eslint .` Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add "apps/web/app/api/users/[id]/route.ts" "apps/web/app/api/users/[id]/route.test.ts"
git commit -m "refactor(web): migrate single-user BFF route to @city-hero/api-client"
```

---

### Task 7: Migrate `POST /api/users/:id/reset-password`

**Files:**

- Modify: `apps/web/app/api/users/[id]/reset-password/route.ts`
- Test: `apps/web/app/api/users/[id]/reset-password/route.test.ts`

**Interfaces:**

- Consumes: `apiErrorResponse` from Task 3.
- Produces: route now reads `newPassword` (camelCase) from the request body instead of
  `new_password` — consumed by Task 9 (`ResetPasswordModal.tsx`).

- [ ] **Step 1: Write the failing test**

Create `apps/web/app/api/users/[id]/reset-password/route.test.ts`:

```ts
// @vitest-environment node
import { HttpResponse, http } from "msw";
import { NextRequest } from "next/server";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { server } from "../../../__test-utils__/server";
import { POST } from "./route";

const mockCookies = vi.hoisted(() => vi.fn());
vi.mock("next/headers", () => ({ cookies: mockCookies }));

const BACKEND_URL = "http://localhost:8000";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
beforeEach(() => mockCookies.mockResolvedValue({ get: () => ({ value: "valid-token" }) }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function paramsFor(id: string) {
  return { params: Promise.resolve({ id }) };
}

function resetRequest(body: unknown) {
  return new NextRequest("http://localhost/api/users/u1/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/users/:id/reset-password", () => {
  it("sends newPassword as camelCase and returns 204 on success", async () => {
    server.use(
      http.post(`${BACKEND_URL}/users/u1/reset-password`, async ({ request }) => {
        const body = (await request.json()) as { newPassword?: string };
        expect(body).toEqual({ newPassword: "Sup3rSecret!" });
        return new HttpResponse(null, { status: 204 });
      }),
    );

    const response = await POST(resetRequest({ newPassword: "Sup3rSecret!" }), paramsFor("u1"));

    expect(response.status).toBe(204);
  });

  it("returns 400 on invalid JSON body", async () => {
    const request = new NextRequest("http://localhost/api/users/u1/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });

    const response = await POST(request, paramsFor("u1"));

    expect(response.status).toBe(400);
  });

  it("returns 422 with the validation array as detail", async () => {
    server.use(
      http.post(`${BACKEND_URL}/users/u1/reset-password`, () =>
        HttpResponse.json(
          { detail: [{ loc: ["body", "newPassword"], msg: "too short", type: "value_error" }] },
          { status: 422 },
        ),
      ),
    );

    const response = await POST(resetRequest({ newPassword: "x" }), paramsFor("u1"));

    expect(response.status).toBe(422);
    const data = await response.json();
    expect(data.detail).toEqual([
      { loc: ["body", "newPassword"], msg: "too short", type: "value_error" },
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/web && npx vitest run "app/api/users/[id]/reset-password/route.test.ts"` Expected:
FAIL — current route reads `new_password` (snake_case) and uses `@/lib/api-proxy`.

- [ ] **Step 3: Migrate the route**

Replace the full contents of `apps/web/app/api/users/[id]/reset-password/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";

import { createServerApiClient } from "@/lib/api-client";
import { apiErrorResponse } from "@/lib/api-error-response";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let newPassword: unknown;
  try {
    const body = await request.json();
    ({ newPassword } = body);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    await createServerApiClient().users.resetPassword(id, { newPassword: newPassword as string });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/web && npx vitest run "app/api/users/[id]/reset-password/route.test.ts"` Expected:
PASS (3 tests)

- [ ] **Step 5: Typecheck and lint**

Run: `cd apps/web && npx tsc --noEmit && npx eslint .` Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add "apps/web/app/api/users/[id]/reset-password/route.ts" "apps/web/app/api/users/[id]/reset-password/route.test.ts"
git commit -m "refactor(web): migrate reset-password BFF route to @city-hero/api-client"
```

---

### Task 8: Migrate `POST /api/users/:id/restore`

**Files:**

- Modify: `apps/web/app/api/users/[id]/restore/route.ts`
- Test: `apps/web/app/api/users/[id]/restore/route.test.ts`

**Interfaces:**

- Consumes: `apiErrorResponse` from Task 3.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Write the failing test**

Create `apps/web/app/api/users/[id]/restore/route.test.ts`:

```ts
// @vitest-environment node
import { HttpResponse, http } from "msw";
import { NextRequest } from "next/server";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { server } from "../../../__test-utils__/server";
import { POST } from "./route";

const mockCookies = vi.hoisted(() => vi.fn());
vi.mock("next/headers", () => ({ cookies: mockCookies }));

const BACKEND_URL = "http://localhost:8000";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
beforeEach(() => mockCookies.mockResolvedValue({ get: () => ({ value: "valid-token" }) }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function paramsFor(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe("POST /api/users/:id/restore", () => {
  it("restores the user and returns it", async () => {
    server.use(
      http.post(`${BACKEND_URL}/users/u1/restore`, () =>
        HttpResponse.json({
          id: "u1",
          email: "citizen@example.com",
          name: "Citizen One",
          role: "citizen",
          authProvider: "password",
          isActive: true,
          avatarUrl: null,
          createdAt: "2026-01-01T00:00:00Z",
          deletedAt: null,
        }),
      ),
    );

    const response = await POST(
      new NextRequest("http://localhost/api/users/u1/restore", { method: "POST" }),
      paramsFor("u1"),
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.deletedAt).toBeNull();
  });

  it("returns 403 with detail when the caller lacks permission", async () => {
    server.use(
      http.post(`${BACKEND_URL}/users/u1/restore`, () =>
        HttpResponse.json({ detail: "Not enough permissions" }, { status: 403 }),
      ),
    );

    const response = await POST(
      new NextRequest("http://localhost/api/users/u1/restore", { method: "POST" }),
      paramsFor("u1"),
    );

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.detail).toBe("Not enough permissions");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/web && npx vitest run "app/api/users/[id]/restore/route.test.ts"` Expected: FAIL —
current route uses raw `fetch`/`@/lib/api-proxy`, not `createServerApiClient`, so the mocked
`next/headers` cookie is never read.

- [ ] **Step 3: Migrate the route**

Replace the full contents of `apps/web/app/api/users/[id]/restore/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";

import { createServerApiClient } from "@/lib/api-client";
import { apiErrorResponse } from "@/lib/api-error-response";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const result = await createServerApiClient().users.restore(id);
    return NextResponse.json(result);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/web && npx vitest run "app/api/users/[id]/restore/route.test.ts"` Expected: PASS (2
tests)

- [ ] **Step 5: Typecheck and lint**

Run: `cd apps/web && npx tsc --noEmit && npx eslint .` Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add "apps/web/app/api/users/[id]/restore/route.ts" "apps/web/app/api/users/[id]/restore/route.test.ts"
git commit -m "refactor(web): migrate restore BFF route to @city-hero/api-client"
```

---

### Task 9: Update the users forms to send camelCase payloads

**Files:**

- Modify: `apps/web/app/(dashboard)/users/_components/UserFormModal.tsx:56`
- Modify: `apps/web/app/(dashboard)/users/_components/ResetPasswordModal.tsx:38`

**Interfaces:**

- Consumes: the `isActive`/`newPassword` body shapes the routes in Tasks 6 and 7 now expect.
- Produces: nothing consumed by later tasks.

There is no existing test file for either component (confirmed: no `*.test.tsx` under
`apps/web/app/(dashboard)/users/`), and this task only changes an object literal's key name, not
logic — Tasks 6 and 7's route tests already assert the exact camelCase shape the backend receives.
No new test is added here; this task is edit-only.

- [ ] **Step 1: Update `UserFormModal.tsx`'s edit payload**

In `apps/web/app/(dashboard)/users/_components/UserFormModal.tsx`, change line 56:

```ts
const payload: Record<string, unknown> = { name, is_active: isActive };
```

to:

```ts
const payload: Record<string, unknown> = { name, isActive };
```

- [ ] **Step 2: Update `ResetPasswordModal.tsx`'s payload**

In `apps/web/app/(dashboard)/users/_components/ResetPasswordModal.tsx`, change line 38:

```ts
        body: JSON.stringify({ new_password: password }),
```

to:

```ts
        body: JSON.stringify({ newPassword: password }),
```

- [ ] **Step 3: Typecheck and lint**

Run: `cd apps/web && npx tsc --noEmit && npx eslint .` Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/\(dashboard\)/users/_components/UserFormModal.tsx apps/web/app/\(dashboard\)/users/_components/ResetPasswordModal.tsx
git commit -m "refactor(web): send camelCase payloads from user edit/reset-password forms"
```

---

### Task 10: Remove the dead `api-proxy.ts` helper and final verification

**Files:**

- Delete: `apps/web/lib/api-proxy.ts`

**Interfaces:**

- Consumes: nothing (verification-only task).
- Produces: nothing.

- [ ] **Step 1: Confirm no remaining imports**

Run: `grep -rl "api-proxy" apps/web --include="*.ts" --include="*.tsx"` Expected: no output (all 5
previous importers were migrated in Tasks 4-8)

- [ ] **Step 2: Delete the dead helper**

```bash
rm apps/web/lib/api-proxy.ts
```

- [ ] **Step 3: Full workspace verification**

Run from repo root: `npx turbo run lint typecheck test` Expected: green across all workspaces
(`@city-hero/api-client`, `@city-hero/design-system`, `@city-hero/types`, `@city-hero/web`,
`city-hero`), matching PR #34's own test plan.

- [ ] **Step 4: Update the task doc**

In `docs/tasks/00-foundation/05-api-client.md`, replace the "Consumption" paragraph (lines 32-38):

```
> **Consumption**: `apps/web`'s `GET /api/users/me` BFF route handler now calls this package
> server-side (the actual FastAPI-calling boundary in this app's architecture), and `useCurrentUser`
> runs on TanStack Query — that's the "used by a screen end-to-end" smoke test, exercised on every
> dashboard page load. The other 6 `apps/web` BFF routes (`login`, `users` list/create, `users/:id`,
> `reset-password`, `restore`) still use the old ad-hoc `lib/api-proxy.ts` helper — migrating them
> is a natural follow-up, not required for this smoke test. The dead, already-unused
> `app/lib/api.ts` (one of the three ad-hoc clients this task replaces) was deleted.
```

with:

```
> **Consumption**: all 7 `apps/web` BFF routes (`users/me`, `login`, `users` list/create,
> `users/:id`, `reset-password`, `restore`) now call this package server-side (the actual
> FastAPI-calling boundary in this app's architecture), and `useCurrentUser` runs on TanStack
> Query — that's the "used by a screen end-to-end" smoke test, exercised on every dashboard page
> load. The old ad-hoc `lib/api-proxy.ts` helper has been removed now that nothing imports it. The
> dead, already-unused `app/lib/api.ts` (one of the three ad-hoc clients this task replaces) was
> also deleted.
```

If other work has since changed this section's surrounding line numbers, locate the paragraph by its
`**Consumption**:` prefix instead of by line number.

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/api-proxy.ts docs/tasks/00-foundation/05-api-client.md
git commit -m "chore(web): remove dead api-proxy.ts helper now that all BFF routes use @city-hero/api-client"
```

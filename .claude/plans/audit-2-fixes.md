# Fix Plan — Audit #2

## Context

The second post-fix audit found 3 critical, 8 high, 13 medium, 10 low issues and 6 compliance gaps. This plan organizes fixes in phases, prioritizing security and quick wins first.

---

## Phase 1: Critical + Quick Fixes (C-1, C-2, C-3, L-1, L-3, L-10)

All fixes below are standalone with no dependencies.

### 1.1 — Tests must use a separate database (C-1)
- **File:** `apps/backend/tests/conftest.py:13`
- Create a required `TEST_DATABASE_URL` environment variable
- Raise `RuntimeError` if not set or if equal to `DATABASE_URL`
- Update `apps/backend/.env.sample` with `TEST_DATABASE_URL`
- Update `ci.yml` with a separate `TEST_DATABASE_URL`

### 1.2 — DATABASE_URL must be required with no default (C-2)
- **File:** `apps/backend/app/core/config.py:6`
- Remove default value: `DATABASE_URL: str` (no fallback)
- App crashes on startup if not defined

### 1.3 — SECRET_KEY minimum entropy validation (C-3)
- **File:** `apps/backend/app/core/config.py`
- Add `@field_validator("SECRET_KEY")` requiring `len(v) >= 32`
- Update dev `.env` with a 32+ char key

### 1.4 — LoginRequest.password max_length (L-1)
- **File:** `apps/backend/app/schemas/auth.py:14`
- Add `password: str = Field(max_length=128)` to `LoginRequest`

### 1.5 — ALGORITHM must not be configurable via env (L-3)
- **File:** `apps/backend/app/core/config.py:8`
- Remove `ALGORITHM` from Settings
- Define as a class constant or add a validator rejecting values outside `{"HS256", "RS256"}`

### 1.6 — Recursive .dockerignore for *.md (L-10)
- **File:** `.dockerignore`
- Replace `*.md` with `**/*.md`

---

## Phase 2: Backend Hardening (H-2, H-3, M-1 to M-7, L-2, L-6, L-9)

### 2.1 — Role as Enum (H-2)
- **File:** `apps/backend/app/models/user.py`
- Create `enum.Enum` in `app/core/enums.py`:
```python
class UserRole(str, enum.Enum):
    CITIZEN = "citizen"
    MANAGER = "manager"
    ADMIN = "admin"
    FIELD_TEAM = "field_team"
    DISPATCHER = "dispatcher"
```
- Replace `String(50)` with `SQLAlchemy Enum(UserRole)` in the model
- Update `schemas/auth.py` to use the enum
- Update `security.py require_role()` to accept `UserRole`

### 2.2 — Unconditional multi-tenant scoping (H-3)
- **File:** `apps/backend/app/routers/users.py:38-39`
- Remove the `if current_user.city_id is not None` bypass
- Users without `city_id` (new registrations) can only see themselves
- Admin/superadmin use `require_role("admin")` for cross-tenant access
- Logic:
```python
if current_user.role not in (UserRole.ADMIN,):
    if current_user.city_id is None:
        query = query.where(User.id == current_user.id)
    else:
        query = query.where(User.city_id == current_user.city_id)
```

### 2.3 — avatar_url validation (M-1)
- **File:** `apps/backend/app/schemas/auth.py`
- For future profile update endpoints, use `HttpUrl` with a domain allowlist
- Keep `String(512)` in the model — validation belongs in the schema layer

### 2.4 — Password complexity (M-2)
- **File:** `apps/backend/app/schemas/auth.py:10`
- Add `@field_validator("password")` to `RegisterRequest`:
  - Require at least 1 letter and 1 digit
  - Reject obvious passwords (inline top-100 blocklist)

### 2.5 — Rate limiter with trusted proxy (M-3)
- **File:** `apps/backend/main.py`
- Add `TRUSTED_PROXIES` to config
- Use a custom key function that validates `X-Forwarded-For` only from trusted proxies
- Simple alternative: add Starlette's `TrustedHostMiddleware`

### 2.6 — Soft delete and LGPD compliance (M-4 + M-5)
- **File:** `apps/backend/app/models/user.py`
- Add fields:
```python
is_active: Mapped[bool] = mapped_column(default=True)
updated_at: Mapped[datetime] = mapped_column(
    DateTime(timezone=True),
    default=lambda: datetime.now(timezone.utc),
    onupdate=lambda: datetime.now(timezone.utc),
)
```
- Update `security.py get_current_user()` to filter by `User.is_active == True`
- Generate Alembic migration

### 2.7 — Stricter backend .dockerignore (M-6)
- **File:** `apps/backend/.dockerignore`
- Add: `tests/`, `requirements-dev.txt`, `pytest.ini`, `.env.sample`, `alembic/versions/`

### 2.8 — Gunicorn timeout (M-7)
- **File:** `apps/backend/Dockerfile`
- Add `--timeout 120` to the gunicorn CMD

### 2.9 — Test isolation with SAVEPOINT (L-2)
- **File:** `apps/backend/tests/conftest.py`
- Refactor the `db` fixture to use nested transactions (SAVEPOINT):
```python
@pytest.fixture
async def db():
    async with engine.connect() as conn:
        trans = await conn.begin()
        session = AsyncSession(bind=conn)
        yield session
        await trans.rollback()
```

### 2.10 — Security headers on backend (L-6)
- **File:** `apps/backend/main.py`
- Add custom middleware:
```python
@app.middleware("http")
async def security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response
```

### 2.11 — Unified healthcheck (L-9)
- **File:** `apps/backend/Dockerfile`
- Remove `HEALTHCHECK` from Dockerfile (manage exclusively via compose)
- Compose already has `interval: 10s` — keep as-is

---

## Phase 3: Web Hardening (H-4 to H-8, M-8 to M-11, M-13, L-4, L-5)

### 3.1 — Nonce-based CSP (H-4 + L-4)
- **Files:** `apps/web/src/middleware.ts`, `apps/web/next.config.ts`
- Generate a crypto nonce in middleware:
```ts
import { randomUUID } from "crypto";
const nonce = Buffer.from(randomUUID()).toString("base64");
```
- Set `x-nonce` header on the request
- In `next.config.ts`, replace `'unsafe-inline' 'unsafe-eval'` with `'nonce-${nonce}' 'strict-dynamic'`
- Remove deprecated `X-XSS-Protection` header
- **Note:** Next.js App Router may require `<Script nonce={nonce}>` — verify with manual testing

### 3.2 — CSRF protection (H-5)
- **Files:** `apps/web/src/app/api/auth/login/route.ts`, `logout/route.ts`
- Change `sameSite: "lax"` to `sameSite: "strict"` (also fixes M-9)
- No legitimate cross-site flow exists for the management panel

### 3.3 — Input validation in the proxy (H-6)
- **File:** `apps/web/src/app/api/auth/login/route.ts`
- Validate and allowlist fields before forwarding:
```ts
try {
  const { email, password } = await request.json();
  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ detail: "Invalid input" }, { status: 400 });
  }
  // forward only { email, password }
} catch {
  return NextResponse.json({ detail: "Invalid JSON" }, { status: 400 });
}
```

### 3.4 — Cookie cleanup on 401 (H-7)
- **File:** `apps/web/src/app/api/auth/me/route.ts`
- On backend 401, delete the cookie in the response:
```ts
if (!res.ok) {
  const response = NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  response.cookies.delete("token");
  return response;
}
```
- **File:** `apps/web/src/app/(dashboard)/page.tsx`
- In `.catch()`, redirect to login instead of swallowing the error:
```ts
.catch(() => { router.replace("/login"); })
```

### 3.5 — Rate limiting on the Next.js proxy (H-8)
- Simple option (no Redis): in-memory rate limiter in the route handler
- Robust option: `@upstash/ratelimit` with Upstash Redis
- For MVP, use an in-memory Map with IP as key and a sliding window:
```ts
const attempts = new Map<string, number[]>();
// Limit to 10 attempts per minute per IP
```

### 3.6 — Do not proxy raw backend errors (M-8)
- **File:** `apps/web/src/app/api/auth/login/route.ts:17-18`
- Replace raw forwarding with a generic message:
```ts
if (!res.ok) {
  return NextResponse.json({ detail: "Invalid credentials" }, { status: 401 });
}
```

### 3.7 — Cookie secure flag without NODE_ENV dependency (M-10)
- **File:** `apps/web/src/app/api/auth/login/route.ts:25`
- Add env var `COOKIE_SECURE`:
```ts
secure: process.env.COOKIE_SECURE !== "false",
```
- Defaults to `true`; override with `false` only in local development

### 3.8 — Remove NEXT_PUBLIC_API_URL from compose environment (M-11)
- **File:** `docker-compose.yml:53`
- Remove `NEXT_PUBLIC_API_URL` from the web service `environment` block
- Keep it only in `args` (build time) — `API_URL` already handles runtime

### 3.9 — Healthcheck for the web service (M-13)
- **File:** `docker-compose.yml`
- Add to the `web` service:
```yaml
healthcheck:
  test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"]
  interval: 15s
  timeout: 5s
  retries: 3
```

### 3.10 — public/ with --chown in Dockerfile (L-5)
- **File:** `apps/web/Dockerfile:51`
- Change to `COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public`

---

## Phase 4: Docker & CI (H-1 partial, M-12, L-7, L-8)

### 4.1 — Separate migrations from entrypoint (M-12)
- **Files:** `apps/backend/entrypoint.sh`, `docker-compose.yml`
- Remove `alembic upgrade head` from `entrypoint.sh`
- Create a one-off service in compose:
```yaml
migrate:
  build:
    context: ./apps/backend
  command: ["alembic", "upgrade", "head"]
  environment: ...
  depends_on:
    db:
      condition: service_healthy
  networks:
    - cityhero-internal
```
- Backend depends on `migrate` having completed (or verifies schema version on startup)

### 4.2 — CI secrets via GitHub Secrets (L-7)
- **File:** `.github/workflows/ci.yml`
- Replace hardcoded values:
```yaml
env:
  DATABASE_URL: ${{ secrets.CI_DATABASE_URL }}
  SECRET_KEY: ${{ secrets.CI_SECRET_KEY }}
```
- Document that secrets must be created in repo settings

### 4.3 — Container vulnerability scanning in CI (L-8)
- **File:** `.github/workflows/ci.yml`
- Add a step after each docker build:
```yaml
- uses: aquasecurity/trivy-action@master
  with:
    image-ref: cityhero-backend
    format: table
    exit-code: 1
    severity: CRITICAL,HIGH
```

### 4.4 — Token blocklist (H-1, planning)
- Requires architectural decision: Redis vs Postgres table
- For MVP: use a `revoked_tokens` table in Postgres with `jti` (JWT ID)
  - Add `jti` claim to `create_access_token()`
  - Create `POST /auth/logout` endpoint that inserts `jti` into the table
  - In `get_current_user()`, check if `jti` is revoked
  - Create a cron job that cleans up expired tokens
- For scale: migrate to Redis with automatic TTL

---

## Phase 5: LGPD / Compliance (AC-1 through AC-6)

These are architectural gaps requiring new features. Plan now, implement when building the respective features.

### 5.1 — Photo anonymization pipeline (AC-1 + AC-4)
- When the upload endpoint is created:
  - Step 1: Strip EXIF metadata (`Pillow` or `piexif`)
  - Step 2: Detect and blur faces/plates (pretrained model or API)
  - Step 3: Set `is_anonymized = True` in the database
  - Step 4: Never return `photo_url` where `is_anonymized = False`
- Mandatory gate: photos cannot be public without anonymization

### 5.2 — GPS anti-spoofing validation (AC-2)
- Server-side validation that coordinates fall within a plausible city radius
- Flag gallery uploads for manual review
- Reject coordinates >1km away if sourced from camera

### 5.3 — Idempotency keys for offline sync (AC-3)
- Accept a client-generated `report_uuid`
- Use `ON CONFLICT DO NOTHING` on INSERT
- Prevents duplicates from sync retries

### 5.4 — DELETE /users/me endpoint (AC-5)
- Soft delete: set `is_active = False`, anonymize PII fields
- Cascade: reports, comments, upvotes, gamification, push tokens
- Return 202 Accepted with a 30-day grace period (LGPD requirement)

### 5.5 — Auth event logging (AC-6)
- Log on each login/logout: timestamp, hashed IP, user_id, outcome
- Use structured logging (JSON) for SIEM integration

---

## Execution Order

| Step | Items | Dependencies | Effort |
|------|-------|-------------|--------|
| 1 | Phase 1 (C-1, C-2, C-3, L-1, L-3, L-10) | None | ~30min |
| 2 | Phase 2.1-2.2 (Enum role, multi-tenant) | None | ~1h |
| 3 | Phase 2.6 (is_active, updated_at) | Alembic | ~30min |
| 4 | Phase 2.3-2.5, 2.7-2.11 (backend hardening) | None | ~1h |
| 5 | Phase 3.2-3.3, 3.6-3.7 (CSRF, proxy validation) | None | ~30min |
| 6 | Phase 3.4, 3.8-3.10 (cookie cleanup, compose, Dockerfile) | None | ~30min |
| 7 | Phase 3.1 (CSP nonce) | Requires manual testing | ~1h |
| 8 | Phase 3.5 (proxy rate limit) | None | ~30min |
| 9 | Phase 4.1-4.3 (migrations, CI) | None | ~1h |
| 10 | Phase 4.4 (token blocklist) | Redis or Postgres decision | ~2h |
| 11 | Phase 5 (compliance) | New features | Backlog |

## Verification

After each phase:
1. `docker compose build` — no errors
2. `docker compose up` — services start, healthchecks pass
3. Test full login/logout flow in the browser
4. `cd apps/backend && ruff check .`
5. `cd apps/web && npx tsc --noEmit`
6. Run tests: `cd apps/backend && pytest -v`

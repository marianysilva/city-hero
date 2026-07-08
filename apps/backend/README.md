# CityHero — Backend

Async REST API built with FastAPI + PostgreSQL. Serves the mobile app (Expo), the web dashboard (Next.js), and future Open311 integrations with city hall systems.

---

## Structure

**`app/core/`** — application-wide singletons: environment config (Pydantic Settings), the async SQLAlchemy engine and session factory, and security utilities (bcrypt hashing, JWT generation/validation).

**`app/models/`** — SQLAlchemy ORM classes, one per database table. Each file defines the table schema as a typed Python class that Alembic uses to generate migrations.

**`app/schemas/`** — Pydantic models that define the exact shape of every API request body and response. Nothing from the database is returned to clients without going through one of these.

**`app/routers/`** — FastAPI route handlers grouped by domain. Each file is a self-contained API module that gets mounted in `main.py` with its own URL prefix.

**`main.py`** — the application entry point: instantiates FastAPI, registers routers, configures CORS, and wires up the startup lifecycle.

---

## Dependencies

### HTTP Server

| Package             | Role                                                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `fastapi`           | Web framework. Defines routes, injects dependencies, validates I/O, and auto-generates `/docs` (Swagger).                       |
| `uvicorn[standard]` | ASGI server that listens on the port and forwards requests to FastAPI. `[standard]` adds WebSocket support and dev auto-reload. |

### Database

| Package               | Role                                                                                                                       |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `sqlalchemy[asyncio]` | ORM that maps Python classes to SQL tables. `[asyncio]` enables non-blocking queries.                                      |
| `asyncpg`             | TCP driver that connects SQLAlchemy to PostgreSQL. The `postgresql+asyncpg://...` URL is the contract between the two.     |
| `alembic`             | Schema versioning: generates migration scripts (`ALTER TABLE`, `CREATE INDEX`) instead of modifying the database manually. |

### Validation & Configuration

| Package             | Role                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------- |
| `pydantic`          | Validates and converts data at runtime. Rejects malformed requests before touching the database.        |
| `pydantic[email]`   | Adds the `EmailStr` type — validates email format without manual regex.                                 |
| `pydantic-settings` | Reads environment variables (or `.env`) and exposes them as typed fields via `Settings` in `config.py`. |

### Security

| Package         | Role                                                                                                             |
| --------------- | ---------------------------------------------------------------------------------------------------------------- |
| `bcrypt`        | Password hashing with configurable CPU cost — brute force is impractical even with a database dump.              |
| `pyjwt[crypto]` | Creates and validates JWTs signed with `SECRET_KEY`. `[crypto]` adds future support for asymmetric keys (RS256). |

---

## How the layers interact

```
HTTP Request
      │
      ▼
  Uvicorn           ← listens on the port, ASGI protocol
      │
      ▼
  FastAPI           ← routing, dependency injection (Depends)
      │
      ├── Pydantic  ← validates and converts body/params before any business logic
      │
      ├── security  ← bcrypt (passwords) · PyJWT (tokens)
      │
      └── SQLAlchemy + asyncpg ← async queries to PostgreSQL
                │
                └── Alembic manages the schema (outside the request lifecycle)
```

### Login flow

```
POST /auth/login  { email, password }
  │
  ├─ Pydantic validates → LoginRequest(email: EmailStr, password: str)
  ├─ SQLAlchemy: SELECT * FROM users WHERE email = ?   (via asyncpg)
  ├─ bcrypt.checkpw(sent_password, stored_hash)
  ├─ PyJWT: generates token → { "sub": user_id, "exp": now + 30d }
  └─ Pydantic serializes → AuthResponse(access_token, user)
```

### Authenticated route flow (`GET /users/me`)

```
GET /users/me  Authorization: Bearer <token>
  │
  ├─ FastAPI injects get_current_user() via Depends
  ├─ PyJWT decodes the token → extracts user_id
  ├─ SQLAlchemy: SELECT * FROM users WHERE id = ?
  └─ Pydantic serializes → UserOut(id, email, name, …)
```

---

## Running locally

> The default, tested way to run the backend is through the repo-root Makefile (`make start` / `make setup`, macOS + Colima) — see the [root README](../../README.md#getting-started). It runs this service in Docker, migrations included. The steps below are for running it standalone, outside Docker (e.g. to use `--reload` against a local interpreter).

**Prerequisite:** PostgreSQL running with a `cityhero` database created.

```bash
# 1. Install dependencies
cd apps/backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# 2. Set environment variables
cp .env.sample .env
# edit .env with your DATABASE_URL and SECRET_KEY

# 3. Start the server (with auto-reload)
uvicorn main:app --reload --port 8000
```

Interactive docs available at `http://localhost:8000/docs`.

---

## Migrations (Alembic)

```bash
# Create a new migration after changing a model
alembic revision --autogenerate -m "add reports table"

# Apply pending migrations
alembic upgrade head

# View migration history
alembic history
```

> Never modify the database directly. All schema changes go through an Alembic migration to keep a versioned history.

---

## Tests & Lint

```bash
pytest                  # run all tests
ruff check .            # Python lint (PEP 8 + extra rules)
```

---

## Environment Variables

See [`.env.sample`](./.env.sample) — every variable is documented there (what it configures, how it's used, and how to fill it in).

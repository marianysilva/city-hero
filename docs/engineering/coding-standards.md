# Coding Standards

Language-specific conventions used across CityHero. The goal is consistency and readability, not
novelty.

## Python (backend, AI service, data pipelines)

### Style and formatting

- Follow **PEP 8** strictly. Line length: 120 characters (per `apps/backend/pyproject.toml`'s
  `[tool.ruff]` `line-length`).
- Format with **`ruff format`** (the project standardizes on Ruff over Black for speed).
- Lint with **`ruff check`** using the rules described in the project's `pyproject.toml` (currently
  `E`, `F`, `I`, `W` — pyflakes, pycodestyle, isort, warnings).

### Type hints

- All public function signatures (any function exported from a module or used outside its file) must
  have type hints on parameters and return type.
- Internal helpers may omit hints when the type is obvious, but prefer hints when in doubt.
- Use PEP 604 (`X | None`) over `Optional[X]`. The project targets Python 3.11+
  (`target-version = "py311"` in `pyproject.toml`), where `X | None` and `list[X]`/`dict[X, Y]` work
  natively at runtime — a `from __future__ import annotations` import is not needed and isn't used
  anywhere in `apps/backend`.
- Pydantic v2 models for all DTOs and API contracts.

### Documentation

- Public functions, classes, and modules require docstrings (Google or NumPy style — pick one and
  stick to it).
- Docstrings explain **why** and edge cases, not just **what** the code does.
- Module-level docstrings explain the module's purpose in 1-3 lines.

### Naming

- Modules and packages: `snake_case`.
- Classes: `PascalCase`.
- Functions, methods, variables: `snake_case`.
- Constants: `SCREAMING_SNAKE_CASE`.
- Private with leading underscore: `_internal_helper`.
- No "Hungarian notation" prefixes.

### Imports

- Order: standard library → third-party → first-party (project) → relative. Separated by blank
  lines.
- Absolute imports for cross-package; relative imports only within a package.
- One import per line; no `from x import *`.

### Async

- Async by default for I/O (DB, HTTP, file reads).
- Don't mix sync and async — if a function awaits, it's async all the way up.
- Long-running CPU work: offload to a thread or worker, never block the event loop.

## TypeScript (mobile, web, packages)

### Style and formatting

- Format with **Prettier** (config in repo root).
- Lint with **ESLint** (config in repo root, extends recommended + project rules).
- Line length: 100 chars.

### Type system

- `tsconfig.base.json` enables `strict: true` (`noImplicitAny`, `strictNullChecks`, etc.).
- **No `any`.** Use `unknown` and narrow, or write a proper type.
- Prefer `interface` for object shapes when extension is likely; `type` for unions, intersections,
  and aliases.
- Prefer `as const` for literal arrays/objects.
- Avoid type assertions (`x as T`); use type guards or narrowing instead.

### Naming

- Files: `kebab-case.ts` for utilities, `PascalCase.tsx` for React components.
- Components: `PascalCase`.
- Hooks: prefix `use*`.
- Functions, variables: `camelCase`.
- Constants: `SCREAMING_SNAKE_CASE` for primitive constants; `PascalCase` for typed constant
  objects.
- Booleans: prefix with `is`, `has`, `can`, `should`.

### React conventions

- Functional components only (no class components).
- Hooks for stateful logic; avoid hooks inside conditionals.
- Props interfaces named `<ComponentName>Props`, defined inline at the top of the component file
  (`export type FooProps = ...`) — see `Button.tsx`/`Badge.tsx` in `packages/design_system`. Extract
  to a separate `Foo.types.ts` only if the type surface grows large enough that it hurts the
  component file's readability.
- Co-locate component, tests, and stories: `Foo.tsx`, `Foo.test.tsx`, `Foo.stories.tsx`. There's no
  separate styles file — styling is inline (`className` for layout, `style` objects sourced from
  tokens for colors/spacing/radius; see "Known limitations" in `design-system.md`).
- Default exports only for screens (where convention demands); named exports otherwise.

### Imports

- Auto-organized by ESLint rule.
- Order: external → workspace packages (`@city-hero/*`) → relative.

## SQL / Database

### Naming

- Tables: `snake_case`, plural (`users`, `reports`, `comments`).
- Columns: `snake_case`, singular.
- Primary keys: `id` (UUID v4). Generated application-side via SQLAlchemy's `default=uuid.uuid4` on
  the mapped column (see `app/models/user.py`), not a Postgres `gen_random_uuid()` server default —
  keeps ID generation testable without hitting the DB.
- Foreign keys: `<referenced_table_singular>_id` (e.g., `user_id`, `city_id`).
- Indexes: `idx_<table>_<columns>` (e.g., `idx_reports_city_status`).
- Unique constraints: `uq_<table>_<columns>`.
- Timestamps: `created_at`, `updated_at`, `deleted_at` (UTC, `TIMESTAMPTZ`).

### Migrations (Alembic)

- One migration per logical change. Don't batch unrelated schema edits.
- Always write `downgrade()` (even if a no-op with explanation).
- Never modify a merged migration; create a new one.
- Migration filenames use timestamp prefix + descriptive slug.

### Queries

- Always use **parameterized queries** (SQLAlchemy core or ORM). Never concatenate user input.
- Always scope by `city_id` for multi-tenant safety.
- Geographic queries: use **PostGIS functions** (`ST_DWithin`, `ST_Distance`, etc.). Never raw
  lat/lng math.
- Index every foreign key.
- Index columns frequently used in `WHERE` and `ORDER BY`.

## API conventions (cross-cutting)

- URL paths: `kebab-case` (e.g., `/api/v1/sync-queue/count`).
- JSON property names: `camelCase` (mobile/web friendly; backend serializes from `snake_case`
  Python).
- Resource paths: pluralized nouns (`/reports`, not `/report`).
- Versioning: prefix `/api/v1/`.
- All list endpoints support pagination (`?page=`, `?limit=`).
- Error responses follow the shape defined in `architecture-patterns.md`.

## Comments

- Comments explain **why**, not **what**. The code says what.
- Hard cases get a comment with a link to issue, doc, or ticket where the decision was made.
- TODOs include an owner and a linked ticket: `// TODO(@user): refactor when X — see CIT-123`.
- Avoid commented-out code. If it might come back, use a feature flag or VCS history.

## Error handling

- Exceptions in Python and JS/TS for exceptional flows. Don't use exceptions for control flow.
- Always prefer typed errors (custom exception classes) over generic `Error`/`Exception`.
- At API boundaries, normalize errors to the standard shape (see `architecture-patterns.md`).
- Catch only what you can handle. Let unexpected errors bubble to the global handler.

## Logging

See `observability.md` for structured logging requirements.

## References

- PEP 8: https://peps.python.org/pep-0008/
- Ruff: https://docs.astral.sh/ruff/
- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/intro.html
- React docs: https://react.dev/
- PostGIS reference: https://postgis.net/docs/reference.html

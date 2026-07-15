# Monorepo Setup · Workspaces + tooling

> **Type:** Foundation · Infrastructure\
> **Screen(s):** All\
> **Effort:** M (2 days)\
> **Dependencies:** none (first task)\
> **Status:** ✅ Done\
> **Labels:** `infrastructure`, `foundation`, `tooling`, `ci-cd`

## Context

Set up the monorepo structure per `CLAUDE.md`: backend, web, mobile, shared packages, analytics
pipelines, and docs. Define shared tooling (lint, format, type-check, hooks) and base CI/CD
pipelines. Without this, no other code task can start.

## User Story

**As a** Developer,\
**I want** a standardized monorepo structure with shared tooling,\
**In order to** avoid configuration drift and get fast feedback before commits.

## Acceptance Criteria

### Scenario · Initial structure

**Given** the repo is empty\
**When** the setup completes\
**Then** the folder structure matches the layout below\
**And** the root workspace declares cross-package dependencies for `apps/*` and `packages/*`\
**And** a shared TypeScript base config is referenced by all TS packages

### Scenario · Lint and format on commit

**Given** the developer runs `git commit`\
**When** the pre-commit hook runs\
**Then** code formatting runs on staged files\
**And** lint runs on staged files only\
**And** if there's a lint error, the commit aborts

### Scenario · Conventional commits

**Given** the developer writes a commit message that doesn't follow the convention\
**When** the commit-msg hook runs\
**Then** the commit aborts with a message indicating which prefixes are allowed (feat, fix, docs,
refactor, test, chore, perf, ci)

### Scenario · Base CI

**Given** a PR is opened\
**When** the CI pipeline runs\
**Then** lint, type-check, and test jobs run in parallel\
**And** if any fails, the PR cannot be merged (branch protection)

### Scenario · Cross-package dependencies

**Given** a shared package exports a component\
**When** another app imports from that package\
**Then** TypeScript resolves the type correctly\
**And** the host app's build includes the package without manual rebuild steps

## Folder structure (output)

```
city-hero/
├── apps/
│   ├── backend/                 # FastAPI (Python) — real
│   ├── web/                     # Next.js — real (code exists; product paused, see docs/tasks/README.md)
│   ├── city-hero/               # Expo — real (stock Expo Router scaffold + design-system wired in)
│   └── ai_service/              # YOLOv8 inference (FastAPI, separate) — PLANNED, not yet created
│                                 # (see 00-foundation/16-yolov8-inference-service.md)
├── packages/
│   ├── design_system/           # Shared RN+Web components — real
│   ├── types/                   # Shared TypeScript types (@city-hero/types) — real
│   ├── ia_research/             # Notebooks + YOLOv8 training (Python) — real
│   ├── api_client/              # Shared HTTP client — PLANNED, not yet created
│   │                             # (see 00-foundation/05-api-client.md)
│   └── i18n/                    # Translation catalogs and helpers — PLANNED, not yet created
│                                 # (see 00-foundation/13-i18n.md)
├── analytics/
│   ├── pipelines/               # Airflow DAGs
│   ├── transformations/         # dbt
│   └── visualizations/          # Superset
├── docs/
│   ├── tasks/                   # Implementation tasks (this folder)
│   ├── engineering/             # Cross-cutting standards
│   ├── features.md
│   └── user-stories.md
├── .github/
│   ├── workflows/                # ci.yml, codeql.yml, security.yml
│   └── PULL_REQUEST_TEMPLATE.md
├── .husky/                       # pre-commit, commit-msg
├── package.json                  # root workspace (npm workspaces: apps/*, packages/*)
├── tsconfig.base.json
├── turbo.json
├── eslint.config.base.js + .prettierrc.json
├── commitlint.config.js
├── .lintstagedrc.js
├── docker-compose.yml + docker-compose.override.yml
└── .gitignore
```

> `packages/types` was added after this task's original write-up and isn't part of the original plan
> — it ships real shared TS types and is kept here rather than removed since the doc must reflect
> the actual tree. `apps/ai_service`, `packages/api_client`, and `packages/i18n` remain
> aspirational: their own task files exist and specify what they'll contain, but the
> folders/packages themselves are not yet created.

## Tooling decisions

- **JS package manager**: npm workspaces + Turborepo (already in place before this task started —
  kept as-is rather than migrating to Yarn Berry; the original Yarn recommendation is superseded).
- **Linter**: ESLint with the project's shared config; rules cover style, accessibility (jsx-a11y),
  and import order.
- **Formatter**: Prettier shared at root.
- **Pre-commit**: Husky + lint-staged for fast feedback on staged files only.
- **Commit messages**: commitlint with the conventional-commits config.
- **TypeScript**: a single base config inherited by all TS packages.
- **Python**: each Python app has its own pyproject.toml; Yarn does not manage them. Linting via
  Ruff.

## CI baseline

`.github/workflows/ci.yml` runs on every push to `main` and every pull request into `main`. Its jobs
have no `needs:` between them, so they all run in parallel:

| Job (`name:` shown as a check)      | Purpose                                                                                   |
| ----------------------------------- | ----------------------------------------------------------------------------------------- |
| `Format (prettier --check)`         | `npm run format:check` at the repo root                                                   |
| `Backend · Lint (ruff)`             | `ruff check .` in `apps/backend`                                                          |
| `Backend · Tests (pytest)`          | `pytest -v` in `apps/backend` against a `postgis/postgis:16-3.4-alpine` service container |
| `Web · Lint + Type Check`           | `tsc --noEmit` + `npx eslint .` in `apps/web`                                             |
| `Web · Build (next build)`          | `npm run build --workspace=apps/web`                                                      |
| `Mobile · Type Check`               | `tsc --noEmit --project apps/city-hero/tsconfig.json`                                     |
| `Mobile · Lint (eslint)`            | `npx eslint .` in `apps/city-hero`                                                        |
| `Mobile · Tests (jest-expo)`        | `npx jest --ci` in `apps/city-hero`                                                       |
| `Design System · Lint + Type Check` | `npm run typecheck` + `npm run lint` in `packages/design_system`                          |
| `Docker · Backend image builds`     | `docker build ./apps/backend`                                                             |

`apps/ai_service` does not exist yet (see the folder structure note above), so there is no Python
job scoped to it — Ruff and pytest run only against `apps/backend` today. There's also no single
generic `lint`/`typecheck`/`test` job; every app/package gets its own named job, and that list is
exactly what's required in branch protection below.

Caches: `actions/setup-node` (npm) and `actions/setup-python` (pip) cache dependencies in every job
that needs them.

## Branch protection

`main` requires:

- A pull request (no direct pushes), with all 9 required CI checks green
  (`Format (prettier --check)`, `Backend · Lint (ruff)`, `Backend · Tests (pytest)`,
  `Web · Lint + Type Check`, `Web · Build (next build)`, `Mobile · Type Check`,
  `Mobile · Lint (eslint)`, `Mobile · Tests (jest-expo)`, `Docker · Backend image builds`).
- 0 required approving reviews — solo project, no second developer to review.
- No force pushes, no deletions.
- Linear history (squash or rebase merge only).

## Frontend

Not applicable as a standalone deliverable — this task produces the shared tooling that every
frontend package/app consumes (root `tsconfig.base.json`, `eslint.config.base.js`, Prettier config),
not a UI itself. See "Tooling decisions" above for what `apps/web` and `apps/city-hero` inherit.

## Backend

Not applicable as a standalone deliverable — this task doesn't add API endpoints. Its
backend-relevant output is Ruff wiring and the `Backend · Lint (ruff)` / `Backend · Tests (pytest)`
CI jobs scoped to `apps/backend` (its own `pyproject.toml` holds the Ruff config; see "CI baseline"
above).

## Database

Not applicable — this task introduces no schema or migrations.

## Edge Cases

- **Wrong package manager version**: a config file in the repo pins the version. Without it, a new
  dev pulls a different version and breaks things.
- **Backend Python is not in JS workspaces**: the Python apps have their own pyproject and are not
  part of the JS dependency resolution.
- **Slow CI from dependency install**: the JS dependency cache is enabled in CI for fast cold
  starts.
- **TS path mapping breaks in dev**: the dev script uses a runtime that respects the base TS
  config's paths.
- **Husky in CI**: hooks are disabled in CI to avoid double-running them.

## Privacy / LGPD

Not applicable — this task provisions build tooling and CI only; no user or citizen data passes
through it.

## Analytics

Not applicable — there is no runtime/product surface here to instrument; tooling has no user-facing
events.

## Tests

- **Smoke test**: clone the repo fresh, install dependencies, run lint — it must pass.
- **Pre-commit hook**: create a file with a known lint error, attempt to commit — the hook must
  block.
- **Conventional commit check**: attempt a commit with a wrong prefix — the hook must block.

## Definition of Done

- [x] Folder structure per the layout above (`apps/city-hero` instead of `apps/mobile` — folder name
      decision, see `docs/superpowers/specs/2026-07-06-monorepo-setup-design.md`)
- [x] npm workspaces + Turborepo functional (superseding the original Yarn plan)
- [x] ESLint (shared root `eslint.config.base.js` spread into each app's Next.js/Expo config) +
      Prettier (shared root config) configured
- [x] Husky pre-commit and commit-msg hooks
- [x] CI pipeline running the 10 named jobs listed under "CI baseline" above (format, backend
      lint/test, web lint+typecheck/build, mobile typecheck/lint/test, design-system lint+typecheck,
      Docker image build) — already existed before this task
- [x] Branch protection enabled on `main`
- [x] PR template
- [x] Root README with setup instructions (already existed)
- [x] Comprehensive `.gitignore` (already existed)
- [x] Conventional commits enforced

## Standards & References

### Cross-cutting standards

- Coding: `docs/engineering/coding-standards.md`
- Testing: `docs/engineering/testing-strategy.md`
- Security (secret scanning hooks): `docs/engineering/security-baseline.md`

### Library / framework references

- npm workspaces: https://docs.npmjs.com/cli/v10/using-npm/workspaces
- Turborepo: https://turborepo.com/docs
- Husky: https://typicode.github.io/husky/
- Conventional Commits: https://conventionalcommits.org/
- ESLint: https://eslint.org/
- Prettier: https://prettier.io/

### Project context

- `CLAUDE.md`

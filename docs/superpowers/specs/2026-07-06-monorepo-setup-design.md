# Design: Task 00-foundation/01 — Monorepo Setup (reconciled with current state)

**Date:** 2026-07-06
**Source task:** `docs/tasks/00-foundation/01-monorepo-setup.md`
**Status of this design:** approved for planning

## Context

`docs/tasks/` contains a fully pre-planned implementation catalog for the
CityHero **mobile citizen app** (32 screens + 18 foundation tasks), written
2026-06-19/28. The web admin panel is explicitly paused/out of MVP scope. The
first foundation task, `01-monorepo-setup`, is marked "Not started" and blocks
everything else.

In practice, part of the monorepo already exists and works:

- npm workspaces + Turborepo (root `package.json`), **not** Yarn Berry as the
  original spec assumed.
- CI (`​.github/workflows/ci.yml`, `codeql.yml`, `security.yml`) already runs
  backend lint/tests, web lint/typecheck/build, mobile typecheck/lint/tests,
  Docker image build, CodeQL, and security scans (pip-audit, npm audit,
  bandit, gitleaks) — all green on the current `main`.
- The mobile app already exists as `apps/city-hero/` — an **untouched Expo
  Router (`create-expo-app`) template**, not `apps/city-hero/` as `CLAUDE.md` and
  every task spec assume. Decision (confirmed): **keep the folder name
  `apps/city-hero`**, not rename it to `apps/city-hero`.
- `packages/design_system`, `packages/ia_research`, and `packages/types`
  already exist. `packages/api_client`, `packages/i18n`, and `apps/ai_service`
  do not — they belong to later foundation tasks (05, 13, 16) and are **not**
  created here (YAGNI).

This design captures only the gap between the original task spec and this
reality, so the task can be closed out without redoing working infrastructure
or duplicating scope owned by later tasks.

## Decisions already confirmed with the user

1. Keep npm workspaces + Turborepo. Do not migrate to Yarn Berry.
2. Keep the `apps/city-hero` folder name. Do not rename to `apps/city-hero`.
3. Because of (2), every reference to `apps/city-hero` across `CLAUDE.md` and
   `docs/` (184 files) must be corrected to `apps/city-hero` so the docs match
   reality. This is a mechanical path rename, not a scope change to any
   individual screen task.

## Scope of this task

### In scope

1. **Global path rename**: `apps/city-hero` → `apps/city-hero` in `CLAUDE.md` and
   every file under `docs/` (currently 184 files matched). Plain string/path
   substitution — no content/requirements changes beyond the path itself.
2. **Root ESLint + Prettier**: a shared root config that `apps/web` and
   `apps/city-hero` extend (each already has its own config; this adds the
   shared root layer, it doesn't replace per-app rules that are
   framework-specific, e.g. `eslint-config-expo`, `jsx-a11y`).
3. **`tsconfig.base.json`** at the repo root, with strict mode and shared
   compiler options, referenced by `apps/web`, `apps/city-hero`, and
   `packages/*` TS configs.
4. **Husky + lint-staged**: pre-commit hook runs Prettier + ESLint (and Ruff
   for staged Python files) on staged files only; aborts the commit on lint
   errors.
5. **commitlint**: commit-msg hook enforcing Conventional Commits
   (`feat|fix|docs|refactor|test|chore|perf|ci`), matching the Git
   Conventions section already in `CLAUDE.md`. Hooks are disabled in CI
   (`HUSKY=0` or equivalent) to avoid double-running.
6. **PR template**: `.github/PULL_REQUEST_TEMPLATE.md` (doesn't exist yet).
7. **Branch protection on `main`** (currently **unprotected** — confirmed via
   `gh api repos/.../branches/main/protection` → 404): require 1 approving
   review, require the existing CI jobs to pass (`Backend · Lint (ruff)`,
   `Backend · Tests (pytest)`, `Web · Lint + Type Check`, `Web · Build (next
build)`, `Mobile · Type Check`, `Mobile · Lint (eslint)`, `Mobile · Tests
(jest-expo)`, `Docker · Backend image builds`), disallow force pushes,
   require linear history.
8. **Update `docs/tasks/00-foundation/01-monorepo-setup.md` itself**: mark
   the parts that are already done (npm/Turbo instead of Yarn, CI baseline,
   folder structure minus the renamed mobile path) as done, and narrow the
   remaining Definition of Done to items 2–7 above.

### Out of scope (deferred to their own foundation tasks)

- `packages/api_client` → task `05-api-client`
- `packages/i18n` → task `13-i18n`
- `apps/ai_service` → task `16-yolov8-inference-service`
- Any change to `docs/engineering/*` content beyond the path rename in (1)

## Risks / edge cases

- **Rename sweep false positives**: `apps/city-hero` must be replaced only as a
  path segment, not inside unrelated prose. A dry-run diff will be reviewed
  before committing.
- **Husky in CI**: must be a no-op in CI runners (already-passing CI jobs must
  stay green) — set via `husky` skip mechanism, not by disabling hooks
  project-wide.
- **Branch protection required-checks names must match exactly** the current
  job `name:` fields in the workflows, or the check never reports and blocks
  merges forever.

## Testing / verification

- Fresh clone smoke test: install deps, `npm run lint`, `npm run typecheck`
  still pass after adding root ESLint/Prettier/tsconfig layers.
- Pre-commit hook test: introduce a deliberate lint error in a staged file,
  confirm the commit is blocked; fix it, confirm the commit succeeds.
- Commit-msg hook test: attempt a commit message without a valid prefix,
  confirm it's rejected.
- Confirm branch protection via `gh api repos/.../branches/main/protection`
  returns the configured rules (no more 404).
- Grep confirms zero remaining `apps/city-hero` references outside of this
  design doc's own history/changelog mentions.

## Definition of Done

- [ ] `apps/city-hero` renamed to `apps/city-hero` across `CLAUDE.md` + `docs/`
- [ ] Root ESLint + Prettier config in place, `apps/web` and `apps/city-hero`
      extend it
- [ ] `tsconfig.base.json` created and referenced by all TS packages/apps
- [ ] Husky + lint-staged pre-commit hook working, no-op in CI
- [ ] commitlint commit-msg hook working, no-op in CI
- [ ] `.github/PULL_REQUEST_TEMPLATE.md` added
- [ ] Branch protection enabled on `main` per the rules above
- [ ] `docs/tasks/00-foundation/01-monorepo-setup.md` updated to match this
      design (status, tooling decisions, Definition of Done)

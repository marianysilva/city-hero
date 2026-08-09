---
name: new-feature
description: Scaffold and implement a new feature following CityHero patterns
disable-model-invocation: true
---

Implement the following feature: $ARGUMENTS.

## Workflow

1. **Understand the requirement:**
   - Check `docs/features.md` and `docs/user-stories.md` for related specs
   - Identify which app(s) are affected (backend, web, mobile)

2. **Plan the implementation:**
   - List all files that need to be created or modified
   - Identify database schema changes (if any)
   - Check for existing patterns in the codebase to follow, and check
     `packages/design_system/` for a reusable component before planning a new one — extend a
     close-but-not-quite match rather than forking it, and never duplicate a pattern that already
     exists in another screen

3. **Backend (if applicable):**
   - Create/update models in the appropriate module
   - Generate Alembic migration: `alembic revision --autogenerate -m "description"`
   - Create API endpoint following Open311 conventions (see `/api-conventions` skill)
   - Ensure all queries are scoped by `city_id` (multi-tenant)
   - Add PostGIS functions for any geographic queries
   - Write pytest tests covering happy path, error/failure paths (invalid input, auth failure,
     not-found, conflict), and documented edge cases — "tests pass" isn't the bar, exemplary
     coverage is

4. **React Native (if applicable):**
   - Follow existing component patterns in `packages/design_system/`
   - Use TypeScript with proper type definitions
   - Add unit tests covering happy path, error/failure paths, and edge cases — not just the
     success case

5. **Verify:**
   - Run `pytest` for backend changes
   - Run `npx tsc --noEmit` for TypeScript changes
   - Run linters (`ruff check .` / `npx eslint .`)
   - Ensure the anonymization pipeline is included if handling photos

6. **Review before committing.** Run the `code-reviewer` subagent against the diff — not optional
   for a non-trivial change, per `CLAUDE.md`'s Code Quality & Review Standards. Escalate to
   `code-reviewer-deep` and/or `security-reviewer` for auth, PII, GPS, migrations, or an
   unfamiliar/version-sensitive library. Address what it flags before moving on to commit.

7. **Commit and PR:**
   - Use conventional commits format
   - Create a descriptive PR linking to the feature spec

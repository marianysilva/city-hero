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
   - Check for existing patterns in the codebase to follow

3. **Backend (if applicable):**
   - Create/update models in the appropriate module
   - Generate Alembic migration: `alembic revision --autogenerate -m "description"`
   - Create API endpoint following Open311 conventions (see `/api-conventions` skill)
   - Ensure all queries are scoped by `city_id` (multi-tenant)
   - Add PostGIS functions for any geographic queries
   - Write pytest tests covering happy path and edge cases

4. **Frontend (if applicable):**
   - Follow existing component patterns in `packages/design_system/`
   - Use TypeScript with proper type definitions
   - Add unit tests

5. **Verify:**
   - Run `pytest` for backend changes
   - Run `npx tsc --noEmit` for TypeScript changes
   - Run linters (`ruff check .` / `npx eslint .`)
   - Ensure the anonymization pipeline is included if handling photos

6. **Commit and PR:**
   - Use conventional commits format
   - Create a descriptive PR linking to the feature spec

# CityHero - Claude Code Instructions

See @README.md for full project overview and @docs/features.md for the feature catalog.

## Project Overview

CityHero is an intelligent urban maintenance and citizen engagement platform. It connects citizens (who see problems) with City Halls (who have limited resources to fix them) using AI (Computer Vision), Gamification, and Data Prediction.

**Monorepo structure:**

- `apps/backend/` — Python backend (FastAPI), AI models, Open311-compliant API
- `apps/web/` — React.js / Next.js manager dashboard (War Room, Kanban, Smart Routing)
- `apps/mobile/` — React Native (Expo) citizen app (AI Camera, Civic Feed, Gamification)
- `packages/design_system/` — Shared UI component library
- `packages/ia_research/` — AI/ML research and model training (YOLOv8)
- `analytics/pipelines/` — Apache Airflow DAGs for data orchestration
- `analytics/transformations/` — dbt models (fact/dimension tables)
- `analytics/visualizations/` — Apache Superset dashboard configs
- `docs/` — Product documentation (features, user stories)

## Tech Stack

- **Backend:** Python 3.11+, FastAPI, SQLAlchemy, Alembic (migrations)
- **Database:** PostgreSQL + PostGIS (geographic data is core to the product)
- **Mobile:** React Native with Expo
- **Web Dashboard:** React.js / Next.js, TypeScript
- **AI/Vision:** YOLOv8 (custom-trained for pothole/trash/graffiti detection)
- **ETL:** dbt for transformations, Apache Airflow for orchestration
- **BI:** Apache Superset with Embedded SDK
- **API Standard:** Open311 (GeoReport v2) for civic system interoperability
- **Maps:** OpenStreetMap

## Code Style & Conventions

- Python: follow PEP 8, use type hints on all function signatures, docstrings on public functions
- TypeScript/React: use ES modules (import/export), destructure imports, functional components with hooks
- All API endpoints MUST follow Open311 GeoReport v2 spec
- Use kebab-case for URL paths, camelCase for JSON properties
- All list endpoints must include pagination
- All geographic queries must use PostGIS functions, never raw lat/lng math
- Database migrations go through Alembic — never modify the DB schema manually

## Privacy & Compliance (LGPD/GDPR)

IMPORTANT: Every photo upload pipeline MUST include the automatic anonymization step (face/plate blur) BEFORE the image becomes publicly visible. Never skip or defer this step. This is a legal requirement.

## Workflow

- Run backend tests: `cd apps/backend && pytest`
- Run web tests: `cd apps/web && npm test`
- Run mobile tests: `cd apps/mobile && npx expo test`
- Lint Python: `ruff check .`
- Lint TypeScript: `npx eslint .`
- Type-check web: `cd apps/web && npx tsc --noEmit`
- Run dbt models: `cd analytics/transformations && dbt run`
- Prefer running single test files over the full suite for speed
- Always typecheck after making a series of code changes
- Always run the relevant linter before committing

## Git Conventions

- Branch naming: `feat/short-description`, `fix/short-description`, `chore/short-description`
- Commit messages: conventional commits format (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`)
- Keep commits atomic — one logical change per commit
- Always write a descriptive PR body summarizing changes and linking relevant issues

## Architecture Decisions

- Multi-tenant design from day one — all queries must be scoped by `city_id`
- Backend is the single source of truth for AI inference — mobile sends raw photos, backend runs YOLOv8
- Superset dashboards read from analytical tables (dbt output), never from the transactional DB directly
- Offline-first mobile: reports queue locally (SQLite/WatermelonDB) and sync when online
- Anti-fraud: GPS validation is mandatory — gallery uploads are flagged for manual review

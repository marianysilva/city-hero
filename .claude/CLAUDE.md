# CityHero Claude Configuration

## Architecture Overview
- This is a monorepo.
- **Backend:** Python (FastAPI). Main entry: `apps/backend/main.py`.
- **Database:** PostgreSQL + PostGIS.
- **Data:** dbt for transformations in `analytics/transformations/`.
- **Visualizations:** superset for data visualization in `analytics/visualizations/`.

## Operational Commands


## AI & Data Research
- `packages/ia_research` contains YOLOv8 training scripts and computer vision experiments.
- When working here, prioritize performance and model weight optimization for mobile deployment.

## Rules for CLI Agent
1. **Context Awareness:** Before editing, check `README.md` for project-wide architecture decisions.
2. **Infrastructure:** Refer to `docker-compose.yml` for service dependencies (Postgres, Redis, Superset).
3. **Migration:** All DB changes must be handled via Alembic migrations in `apps/backend/migrations`.
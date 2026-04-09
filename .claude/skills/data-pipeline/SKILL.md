---
name: data-pipeline
description: Create or modify dbt models and Airflow DAGs for the analytics layer
---

# Data Pipeline Conventions

## dbt Models (`analytics/transformations/`)

- Source tables come from the transactional PostgreSQL database
- Staging models (`stg_`) clean and rename columns to camelCase
- Intermediate models (`int_`) join and enrich data
- Fact tables (`fact_`) are the final analytical output consumed by Superset
- Dimension tables (`dim_`) provide lookup context (neighborhoods, categories, teams)
- All models must have a `city_id` column for multi-tenant filtering
- Add dbt tests for uniqueness, not-null, and referential integrity
- Example: `fact_monthly_issues_by_neighborhood`, `dim_neighborhoods`

## Airflow DAGs (`analytics/pipelines/`)

- One DAG per data domain (e.g., `tickets_etl`, `scraper_transparency_portal`)
- Use `@daily` or `@hourly` schedule intervals, not cron strings
- Include retry logic (retries=2, retry_delay=timedelta(minutes=5))
- Alert on failure via webhook notification
- Scrapers are fragile by design — include fallback/error handling for portal changes

## Superset Dashboards (`analytics/visualizations/`)

- Dashboards always read from dbt-generated fact/dim tables, NEVER from raw transactional tables
- Use the Superset Embedded SDK to render inside the React web dashboard
- Include filters by city, neighborhood, date range, and problem category
